import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import {
  AlertBanner,
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  ProofViewer,
  SearchInput,
  Segmented,
  StatusPill,
} from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirm, useConfirmWithReason } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { formatDateTime, formatMoney, formatRelativeTime } from '../../../../core/utils/format';
import { validate, tError } from '../../../../domain/validation';
import { rejectReasonSchema } from '../../../../domain/validation/billing';
import type { AppError } from '../../../../core/errors/AppError';
import type { SubscriptionRequest, SubscriptionRequestStatus } from '../../../../domain/entities/Billing';
import {
  useApproveRequest,
  useRejectRequest,
} from '../hooks/useBillingMutations';
import { useBillingSummary } from '../hooks/useBilling';
import { useRequests } from '../hooks/useBilling';
import { ReceiptRow } from './ReceiptRow';
import { CheckCircle, MessageCircle } from 'lucide-react';

const LIMIT = 20;
const STATUSES: Array<SubscriptionRequestStatus | 'ALL'> = ['PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'ALL'];

interface ReceiptsTabProps {
  onOpenCommission: (craftsmanName: string) => void;
}

export const ReceiptsTab: React.FC<ReceiptsTabProps> = ({ onOpenCommission }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const confirm = useConfirm();
  const confirmWithReason = useConfirmWithReason();
  const toast = useToast();
  const summary = useBillingSummary();
  const approve = useApproveRequest();
  const reject = useRejectRequest();

  const [status, setStatus] = useState<SubscriptionRequestStatus | 'ALL'>('PENDING_VERIFICATION');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [debtName, setDebtName] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const q = useRequests({ status, page, limit: LIMIT, search: debounced || undefined });
  const totalPages = Math.max(1, Math.ceil((q.data?.total ?? 0) / LIMIT));
  const busy = approve.isPending || reject.isPending;

  const openChat = (row: SubscriptionRequest) => {
    if (!row.chatRoomId) return;
    try {
      sessionStorage.setItem('chat_open_room', row.chatRoomId);
    } catch {
      // storage unavailable — navigation still works
    }
    navigate('chat');
  };

  const handleApprove = async (row: SubscriptionRequest) => {
    const ok = await confirm({
      title: t('billing_approve_title'),
      body: `${t('billing_approve_body')} — ${row.userName}, ${row.planTitle}, ${row.durationMonths} ${t('billing_plan_months')}, ${formatMoney(row.price, 'ILS', language)}`,
    });
    if (!ok) return;
    setDebtName(null);
    approve.mutate(row.id, {
      onError: (e: Error) => {
        if ((e as AppError).backendCode === 'COMMISSION_DEBT_UNSETTLED') setDebtName(row.userName);
      },
    });
  };

  const handleReject = async (row: SubscriptionRequest) => {
    const { confirmed, reason } = await confirmWithReason({
      title: t('billing_reject_title'),
      body: t('billing_reject_body'),
      tone: 'danger',
      requireReason: true,
      reasonPlaceholder: t('billing_reject_reason_ph'),
    });
    if (!confirmed) return;
    const v = validate(rejectReasonSchema, { reason: reason ?? '' });
    if (!v.ok) {
      toast.error(tError(t, v.errors.reason) ?? t('err_generic'));
      return;
    }
    reject.mutate({ id: row.id, reason: v.data.reason });
  };

  return (
    <div className="ui-stack">
      {debtName && (
        <AlertBanner
          tone="warning"
          title={t('err_commission_debt')}
          body={debtName}
          actions={
            <Button size="sm" variant="outline" onClick={() => onOpenCommission(debtName)}>
              {t('billing_open_commission')}
            </Button>
          }
        />
      )}
      <div className="ui-toolbar">
        <Segmented
          value={status}
          onChange={(v) => {
            setStatus(v as SubscriptionRequestStatus | 'ALL');
            setPage(1);
          }}
          items={STATUSES.map((s) => ({
            value: s,
            label: t(`billing_filter_${s.toLowerCase()}`),
            count: s === 'PENDING_VERIFICATION' ? summary.pendingReceipts : undefined,
          }))}
        />
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={setSearch} placeholder={t('billing_receipts_search_ph')} />
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
                render: (row: SubscriptionRequest) => (
                  <span>
                    <span className="ui-text-strong">{row.userName}</span>
                    <br />
                    <span className="ui-caption">
                      {row.craftsmanTitle}
                      {row.userPhone ? (
                        <>
                          {' · '}
                          <bdi className="ui-num">{row.userPhone}</bdi>
                        </>
                      ) : (
                        ''
                      )}
                    </span>
                  </span>
                ),
              },
              {
                key: 'plan',
                header: t('billing_col_plan'),
                render: (row: SubscriptionRequest) => (
                  <span>
                    {row.planTitle} · {row.durationMonths} {t('billing_plan_months')}
                  </span>
                ),
              },
              {
                key: 'amount',
                header: t('billing_col_amount'),
                align: 'end',
                render: (row: SubscriptionRequest) => (
                  <bdi className="ui-num">{formatMoney(row.price, 'ILS', language)}</bdi>
                ),
              },
              {
                key: 'submitted',
                header: t('billing_col_submitted'),
                render: (row: SubscriptionRequest) => (
                  <span title={formatDateTime(row.createdAt, language)}>
                    {formatRelativeTime(row.createdAt, language)}
                  </span>
                ),
              },
              {
                key: 'receipt',
                header: t('billing_col_receipt'),
                render: (row: SubscriptionRequest) => <ProofViewer src={row.paymentProofUrl} alt={row.userName} />,
              },
              {
                key: 'status',
                header: t('billing_col_status'),
                render: (row: SubscriptionRequest) => (
                  <span>
                    <StatusPill
                      variant={pillVariantFor('billing', row.status)}
                      label={t(statusLabelKey('billing', row.status))}
                    />
                    {row.status === 'REJECTED' && row.rejectionReason ? (
                      <>
                        <br />
                        <span className="ui-text-muted">{row.rejectionReason}</span>
                      </>
                    ) : (
                      ''
                    )}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: t('billing_col_actions'),
                align: 'end',
                render: (row: SubscriptionRequest) =>
                  row.status === 'PENDING_VERIFICATION' ? (
                    <span className="ui-row">
                      <Button size="sm" variant="primary" disabled={busy} onClick={() => void handleApprove(row)}>
                        {t('billing_approve')}
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleReject(row)}>
                        {t('billing_reject')}
                      </Button>
                      {row.chatRoomId ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<MessageCircle size={14} />}
                          aria-label={t('billing_chat')}
                          disabled={busy}
                          onClick={() => openChat(row)}
                        >
                          {t('billing_chat')}
                        </Button>
                      ) : (
                        ''
                      )}
                    </span>
                  ) : (
                    ''
                  ),
              },
            ]}
            rows={q.data?.items ?? []}
            rowKey={(row: SubscriptionRequest) => row.id}
            loading={q.isLoading}
            empty={
              <EmptyState icon={<CheckCircle size={20} />} title={t('empty_receipts_pending')} />
            }
            pagination={{
              page,
              totalPages,
              totalItems: q.data?.total,
              pageSize: LIMIT,
              onPageChange: setPage,
            }}
            mobile={(row: SubscriptionRequest) => (
              <ReceiptRow
                row={row}
                onApprove={(r) => void handleApprove(r)}
                onReject={(r) => void handleReject(r)}
                onChat={openChat}
                pendingAction={busy}
              />
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ReceiptsTab;
