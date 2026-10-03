import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import {
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  SearchInput,
  Segmented,
  StatusPill,
} from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { formatDate, formatNumber } from '../../../../core/utils/format';
import type { Subscriber } from '../../../../domain/entities/Billing';
import { usePlatformSettings, useSubscribers } from '../hooks/useBilling';
import { useCancelSubscriber } from '../hooks/useBillingMutations';
import { SubscriberActions } from './SubscriberActions';
import { ExtendModal } from './ExtendModal';
import { FreeTasksModal } from './FreeTasksModal';
import { Check, Users, X } from 'lucide-react';

const LIMIT = 20;
type Filter = 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired';
const FILTERS: Filter[] = ['all', 'active', 'free', 'commission', 'locked', 'expired'];

const daysLeft = (expiry?: string): number | null => {
  if (!expiry) return null;
  const ms = new Date(expiry).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return null;
  return Math.ceil(ms / 86400000);
};

export const SubscribersTab: React.FC = () => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const confirmWithReason = useConfirmWithReason();
  const cancel = useCancelSubscriber();
  const platform = usePlatformSettings();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ type: 'extend' | 'free'; sub: Subscriber } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const q = useSubscribers({ filter, page, limit: LIMIT, search: debounced || undefined });
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / LIMIT));
  const freeTotal = platform.data?.freeTasksCount;

  const openCraftsman = (row: Subscriber) => {
    try {
      sessionStorage.setItem('craftsmen_search', row.name);
    } catch {
      // storage unavailable — navigation still works
    }
    navigate('craftsmen');
  };

  const handleCancel = async (row: Subscriber) => {
    const { confirmed } = await confirmWithReason({
      title: t('subscribers_cancel_title'),
      body: t('subscribers_cancel_body'),
      tone: 'danger',
      requireReason: false,
      reasonPlaceholder: t('billing_reject_reason_ph'),
    });
    if (!confirmed) return;
    cancel.mutate(row.id);
  };

  const billingPill = (row: Subscriber) => {
    if (row.billingModel === 'SUBSCRIPTION')
      return <StatusPill variant={pillVariantFor('subscription', 'ACTIVE')} label={t('status_subscription')} />;
    if (row.billingModel === 'COMMISSION')
      return <StatusPill variant={pillVariantFor('subscription', 'COMMISSION')} label={t('status_commission')} />;
    return <span className="ui-caption">{t('subscribers_no_plan')}</span>;
  };

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <Segmented
          value={filter}
          onChange={(v) => {
            setFilter(v as Filter);
            setPage(1);
          }}
          items={FILTERS.map((f) => ({ value: f, label: t(`subscribers_filter_${f}`) }))}
        />
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder={t('billing_subscribers_search_ph')} />
        </div>
      </div>
      <Card padding="none">
        {q.isError ? (
          <ErrorState message={q.error.message} onRetry={() => q.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'craftsman',
                header: t('billing_col_craftsman'),
                render: (row: Subscriber) => (
                  <span>
                    <span className="ui-text-strong">{row.name}</span>
                    <br />
                    <span className="ui-caption">{row.title}</span>
                  </span>
                ),
              },
              {
                key: 'billing',
                header: t('subscribers_col_billing'),
                render: (row: Subscriber) => billingPill(row),
              },
              {
                key: 'subscription',
                header: t('subscribers_col_subscription'),
                render: (row: Subscriber) => {
                  const left = row.subscriptionStatus === 'ACTIVE' ? daysLeft(row.expiryDate) : null;
                  return (
                    <span>
                      <StatusPill
                        variant={pillVariantFor('subscription', row.subscriptionStatus)}
                        label={t(statusLabelKey('subscription', row.subscriptionStatus))}
                      />
                      {row.expiryDate ? (
                        <>
                          <br />
                          <span className="ui-caption">
                            <bdi className="ui-num">{formatDate(row.expiryDate, language)}</bdi>
                            {left !== null ? ` · ${left}${t('billing_plan_days_short')}` : ''}
                          </span>
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  );
                },
              },
              {
                key: 'free',
                header: t('subscribers_col_free'),
                render: (row: Subscriber) => (
                  <span>
                    <bdi className="ui-num">{formatNumber(row.freeTasksRemaining, language)}</bdi>
                    {freeTotal !== undefined ? (
                      <>
                        <br />
                        <span className="ui-caption">
                          {t('subscribers_free_of').replace('{n}', String(freeTotal))}
                        </span>
                      </>
                    ) : (
                      ''
                    )}
                  </span>
                ),
              },
              {
                key: 'lock',
                header: t('commission_lock_state'),
                render: (row: Subscriber) =>
                  row.commissionLocked ? <StatusPill variant="danger" label={t('status_locked')} /> : '—',
              },
              {
                key: 'accept',
                header: t('subscribers_col_accept'),
                render: (row: Subscriber) =>
                  row.isAllowedToAcceptTasks ? (
                    <span aria-label={t('subscribers_can_accept')}>
                      <Check size={16} />
                    </span>
                  ) : (
                    <span aria-label={t('subscribers_cannot_accept')}>
                      <X size={16} />
                    </span>
                  ),
              },
              {
                key: 'actions',
                header: t('billing_col_actions'),
                align: 'end',
                render: (row: Subscriber) => (
                  <SubscriberActions
                    row={row}
                    onExtend={(r) => setModal({ type: 'extend', sub: r })}
                    onFreeTasks={(r) => setModal({ type: 'free', sub: r })}
                    onCancel={(r) => void handleCancel(r)}
                    onOpenCraftsman={openCraftsman}
                  />
                ),
              },
            ]}
            rows={q.data?.items ?? []}
            rowKey={(row: Subscriber) => row.id}
            loading={q.isLoading}
            empty={<EmptyState icon={<Users size={20} />} title={t('empty_subscribers')} />}
            pagination={{
              page,
              totalPages,
              totalItems: q.data?.total,
              pageSize: LIMIT,
              onPageChange: setPage,
            }}
            mobile={(row: Subscriber) => (
              <div className="billing-receipt-card">
                <div className="billing-receipt-card__top">
                  <div className="billing-receipt-card__identity">
                    <span className="billing-receipt-card__name">{row.name}</span>
                    <span className="ui-caption">{row.title}</span>
                    <span>{billingPill(row)}</span>
                  </div>
                  <SubscriberActions
                    row={row}
                    onExtend={(r) => setModal({ type: 'extend', sub: r })}
                    onFreeTasks={(r) => setModal({ type: 'free', sub: r })}
                    onCancel={(r) => void handleCancel(r)}
                    onOpenCraftsman={openCraftsman}
                  />
                </div>
              </div>
            )}
          />
        )}
      </Card>
      {modal?.type === 'extend' ? (
        <ExtendModal key={`extend-${modal.sub.id}`} subscriber={modal.sub} onClose={() => setModal(null)} />
      ) : modal ? (
        <FreeTasksModal key={`free-${modal.sub.id}`} subscriber={modal.sub} onClose={() => setModal(null)} />
      ) : null}
    </div>
  );
};

export default SubscribersTab;
