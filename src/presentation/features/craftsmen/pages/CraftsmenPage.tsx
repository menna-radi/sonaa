import React, { useState } from 'react';
import { useCraftsmen } from '../hooks/useCraftsmen';
import type { CraftsmanStatusFilter } from '../../../../domain/repositories/CraftsmanRepository';
import { useLanguage } from '../../../context/LanguageContext';
import { useBreakpoint } from '../../../components/ui/useBreakpoint';
import { PageHeader, Button, AlertBanner, Drawer, SearchInput, Segmented, Skeleton } from '../../../components/ui';
import { formatNumber, formatRelativeTime } from '../../../../core/utils/format';
import { CraftsmenTable } from '../components/CraftsmenTable';
import { CraftsmanDetailPanel } from '../components/CraftsmanDetailPanel';
import { RefreshCw } from 'lucide-react';
import '../craftsmen.css';

const FILTERS: CraftsmanStatusFilter[] = ['all', 'verified', 'pending', 'suspended'];

export const CraftsmenPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { isMobile } = useBreakpoint();
  const q = useCraftsmen();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelect = (c: { id: string }) => {
    q.setSelectedId(c.id);
    setDrawerOpen(true);
  };

  const selected = q.rows.find((c) => c.id === q.selectedId) ?? null;

  return (
    <div className="ui-page">
      <PageHeader
        title={t('craftsmen_title')}
        subtitle={`${formatNumber(q.total, language)} ${t('craftsmen_registered')}`}
        meta={q.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(q.dataUpdatedAt, language)}` : undefined}
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={14} />}
            loading={q.isFetching}
            onClick={() => q.refetch()}
          >
            {t('btn_refresh')}
          </Button>
        }
      />
      {q.suspendedMismatch && (
        <AlertBanner tone="info" title={t('craftsmen_suspended_notice')} />
      )}
      <div className="ui-toolbar">
        <Segmented
          value={q.tab}
          onChange={(v) => q.setTab(v as CraftsmanStatusFilter)}
          items={FILTERS.map((f) => ({
            value: f,
            label: t(`craftsmen_filter_${f}`),
            count: q.counts[f],
            tone: f === 'suspended' ? ('danger' as const) : undefined,
          }))}
        />
        <div className="ui-toolbar__grow">
          <SearchInput value={q.search} onChange={q.setSearch} placeholder={t('craftsmen_search_ph')} />
        </div>
      </div>
      {q.loading ? (
        <Skeleton variant="card" height={320} />
      ) : (
        <CraftsmenTable
          rows={q.rows}
          total={q.total}
          loading={false}
          error={q.error}
          onRetry={() => q.refetch()}
          page={q.page}
          onPageChange={q.setPage}
          selectedId={q.selectedId}
          onSelect={handleSelect}
        />
      )}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected?.name ?? t('craftsmen_title')}
        subtitle={selected?.trade}
        size={isMobile ? 'lg' : 'md'}
      >
        <CraftsmanDetailPanel craftsman={selected} />
      </Drawer>
    </div>
  );
};

export default CraftsmenPage;
