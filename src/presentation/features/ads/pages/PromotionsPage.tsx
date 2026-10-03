import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Button, EmptyState, ErrorState, SearchInput, Segmented, Skeleton, KpiCard } from '../../../components/ui';
import { formatNumber, formatRelativeTime } from '../../../../core/utils/format';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useOffers, useToggleOffer, useDeleteOffer } from '../hooks/useOffers';
import { getOfferState } from '../offerState';
import type { Offer, OfferState } from '../../../../domain/entities/Offer';
import { OfferCard } from '../components/OfferCard';
import { OfferFormModal } from '../components/OfferFormModal';
import { OfferPreviewModal } from '../components/OfferPreviewModal';
import { Plus, RefreshCw, Megaphone } from 'lucide-react';
import '../ads.css';

type PlacementFilter = 'ALL' | 'TOP' | 'FEATURED';
type StateFilter = 'ALL' | OfferState;
const PLACEMENTS: PlacementFilter[] = ['ALL', 'TOP', 'FEATURED'];
const STATES: StateFilter[] = ['ALL', 'ACTIVE', 'PAUSED', 'SCHEDULED', 'ENDED'];

export const PromotionsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const offersQ = useOffers();
  const toggle = useToggleOffer();
  const remove = useDeleteOffer();
  const busy = toggle.isPending || remove.isPending;

  const [search, setSearch] = useState('');
  const [placement, setPlacement] = useState<PlacementFilter>('ALL');
  const [state, setState] = useState<StateFilter>('ALL');
  const [modal, setModal] = useState<Offer | 'new' | null>(null);
  const [preview, setPreview] = useState<Offer | null>(null);
  const [now] = useState(() => Date.now());

  const offers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (offersQ.data ?? []).filter((o) => {
      if (placement !== 'ALL' && o.placement !== placement) return false;
      if (state !== 'ALL' && getOfferState(o, now) !== state) return false;
      if (needle) {
        const hay = `${o.titleEn} ${o.titleAr} ${o.subtitleEn}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [offersQ.data, search, placement, state, now]);

  const counts = useMemo(() => {
    const c: Record<OfferState, number> = { ACTIVE: 0, PAUSED: 0, SCHEDULED: 0, ENDED: 0 };
    for (const o of offersQ.data ?? []) c[getOfferState(o, now)] += 1;
    return c;
  }, [offersQ.data, now]);

  const handleDelete = async (offer: Offer) => {
    const ok = await confirm({ title: t('offers_delete_title'), body: t('offers_delete_body'), tone: 'danger' });
    if (!ok) return;
    remove.mutate(offer.id);
  };

  return (
    <div className="ui-page">
      <PageHeader
        title={t('offers_title')}
        subtitle={t('offers_subtitle')}
        meta={offersQ.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(offersQ.dataUpdatedAt, language)}` : undefined}
        actions={
          <>
            <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} loading={offersQ.isFetching} onClick={() => offersQ.refetch()}>
              {t('btn_refresh')}
            </Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setModal('new')}>
              {t('offers_new')}
            </Button>
          </>
        }
      />
      {offersQ.isError ? (
        <ErrorState title={t('status_error_title')} message={offersQ.error.message} onRetry={() => offersQ.refetch()} retryLabel={t('btn_retry')} />
      ) : offersQ.isLoading ? (
        <div className="ui-grid-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height={280} />
          ))}
        </div>
      ) : (
        <>
          <div className="ui-kpi-grid ui-kpi-grid--4">
            <KpiRow label={t('offers_kpi_total')} value={formatNumber(offersQ.data?.length ?? 0, language)} />
            <KpiRow label={t('offers_kpi_active')} value={formatNumber(counts.ACTIVE, language)} />
            <KpiRow label={t('offers_kpi_scheduled')} value={formatNumber(counts.SCHEDULED, language)} />
            <KpiRow label={t('offers_kpi_ended')} value={formatNumber(counts.ENDED, language)} />
          </div>
          <div className="ui-toolbar">
            <div className="ui-toolbar__grow">
              <SearchInput value={search} onChange={setSearch} placeholder={t('offers_search_ph')} />
            </div>
            <Segmented
              value={placement}
              onChange={(v) => setPlacement(v as PlacementFilter)}
              items={PLACEMENTS.map((p) => ({ value: p, label: t(`offers_placement_filter_${p.toLowerCase()}`) }))}
            />
            <Segmented
              value={state}
              onChange={(v) => setState(v as StateFilter)}
              items={STATES.map((s) => ({ value: s, label: t(`offers_state_filter_${s.toLowerCase()}`) }))}
            />
          </div>
          {offers.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={20} />}
              title={t('offers_empty')}
              action={
                <Button variant="primary" size="sm" onClick={() => setModal('new')}>
                  {t('offers_new')}
                </Button>
              }
            />
          ) : (
            <div className="ui-grid-auto">
              {offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  busy={busy}
                  onEdit={(o) => setModal(o)}
                  onToggle={(o) => toggle.mutate(o.id)}
                  onPreview={setPreview}
                  onDelete={(o) => void handleDelete(o)}
                />
              ))}
            </div>
          )}
        </>
      )}
      {modal !== null && (
        <OfferFormModal offer={modal === 'new' ? null : modal} onClose={() => setModal(null)} />
      )}
      <OfferPreviewModal offer={preview} onClose={() => setPreview(null)} />
    </div>
  );
};

const KpiRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => {
  return <KpiCard label={label} value={value} />;
};

export default PromotionsPage;
