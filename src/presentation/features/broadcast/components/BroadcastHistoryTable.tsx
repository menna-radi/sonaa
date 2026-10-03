import React, { useMemo, useState } from 'react';
import { Trash2, Download, Megaphone } from 'lucide-react';
import type { CampaignRecord } from '../../../../domain/repositories/BroadcastRepository';
import { Card } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Segmented } from '../../../components/ui/Segmented';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDateTime, formatNumber } from '../../../../core/utils/format';
import { toCsv, downloadCsv } from '../../../../core/utils/csv';
import { useDeleteBroadcast } from '../hooks/useBroadcast';
import '../broadcast.css';

const PAGE_SIZE = 10;
const STATUS_FILTERS = ['ALL', 'SENT', 'SCHEDULED', 'CANCELLED'] as const;

interface BroadcastHistoryTableProps {
  campaigns: CampaignRecord[];
  loading: boolean;
}

export const BroadcastHistoryTable: React.FC<BroadcastHistoryTableProps> = ({ campaigns, loading }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const remove = useDeleteBroadcast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const audienceLabel = (c: CampaignRecord) => t(`broadcast_audience_${c.audience.toLowerCase()}`);
  const recipientsLabel = (c: CampaignRecord) =>
    c.status === 'SCHEDULED' && c.recipients === 0 ? '—' : formatNumber(c.recipients, language);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter(
      (c) => (status === 'ALL' || c.status === status) && (!q || c.title.toLowerCase().includes(q))
    );
  }, [campaigns, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleDelete = async (c: CampaignRecord) => {
    const ok = await confirm({
      title: t('broadcast_delete_title'),
      body: `${c.title} — ${t(c.status === 'SCHEDULED' ? 'broadcast_delete_body_scheduled' : 'broadcast_delete_body')}`,
      tone: 'danger',
      confirmLabel: t('broadcast_delete_confirm'),
    });
    if (ok) remove.mutate(c.id);
  };

  const exportCsv = () => {
    const header = [
      t('broadcast_col_title'),
      t('broadcast_col_audience'),
      t('broadcast_col_city'),
      t('broadcast_col_status'),
      t('broadcast_col_date'),
      t('broadcast_col_recipients'),
    ];
    const body = filtered.map((c) => [
      c.title,
      audienceLabel(c),
      c.targetCity ?? '',
      t(statusLabelKey('broadcast', c.status)),
      c.at,
      c.recipients,
    ]);
    downloadCsv(`broadcasts_${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...body]));
  };

  const deleteButton = (c: CampaignRecord) => (
    <Button
      size="sm"
      variant="ghost"
      icon={<Trash2 size={14} />}
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(c);
      }}
      aria-label={t('broadcast_delete_title')}
    />
  );

  const pill = (c: CampaignRecord) => (
    <StatusPill variant={pillVariantFor('broadcast', c.status)} label={t(statusLabelKey('broadcast', c.status))} />
  );

  const columns: Column<CampaignRecord>[] = [
    {
      key: 'title',
      header: t('broadcast_col_title'),
      render: (c) => <span className="ui-text-strong">{c.title}</span>,
    },
    {
      key: 'audience',
      header: t('broadcast_col_audience'),
      hideOnTablet: true,
      render: (c) => (
        <div className="bc-cell">
          <span>{audienceLabel(c)}</span>
          {c.targetCity && <span className="ui-caption">{c.targetCity}</span>}
        </div>
      ),
    },
    { key: 'status', header: t('broadcast_col_status'), render: pill },
    {
      key: 'at',
      header: t('broadcast_col_date'),
      render: (c) => <span className="ui-num">{formatDateTime(c.at, language)}</span>,
    },
    {
      key: 'recipients',
      header: t('broadcast_col_recipients'),
      align: 'end',
      render: (c) => <span className="ui-num">{recipientsLabel(c)}</span>,
    },
    { key: 'actions', header: '', align: 'end', render: deleteButton },
  ];

  return (
    <Card
      title={t('broadcast_history')}
      subtitle={t('broadcast_history_subtitle')}
      actions={
        <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={exportCsv} disabled={!filtered.length}>
          {t('btn_export')}
        </Button>
      }
    >
      <div className="ui-stack">
        <div className="ui-toolbar">
          <div className="ui-toolbar__grow">
            <SearchInput
              placeholder={t('broadcast_search_ph')}
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
            />
          </div>
          <Segmented
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            items={STATUS_FILTERS.map((s) => ({
              value: s,
              label: s === 'ALL' ? t('broadcast_filter_all') : t(statusLabelKey('broadcast', s)),
            }))}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={loading}
          empty={<EmptyState icon={<Megaphone size={24} />} title={t('broadcast_empty')} />}
          pagination={{
            page: currentPage,
            totalPages,
            totalItems: filtered.length,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
          mobile={(c) => (
            <div className="bc-mobile">
              <div className="ui-row ui-row--between">
                <span className="ui-text-strong">{c.title}</span>
                {pill(c)}
              </div>
              <span className="ui-caption">
                {audienceLabel(c)}
                {c.targetCity ? ` · ${c.targetCity}` : ''}
              </span>
              <div className="ui-row ui-row--between">
                <span className="ui-caption ui-num">
                  {formatDateTime(c.at, language)} · {recipientsLabel(c)}
                </span>
                {deleteButton(c)}
              </div>
            </div>
          )}
        />
      </div>
    </Card>
  );
};
