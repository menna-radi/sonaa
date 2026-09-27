import React from 'react';
import { Trash2, Search, Download } from 'lucide-react';
import { CampaignRecord } from '../../../../domain/repositories/BroadcastRepository';
import { Card } from '../../../components/ui/Card';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Segmented } from '../../../components/ui/Segmented';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Button } from '../../../components/ui/Button';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { useLanguage } from '../../../context/LanguageContext';

interface BroadcastHistoryTableProps {
  campaigns: CampaignRecord[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onDeleteCampaign: (id: string | number) => void;
  onExportCSV: () => void;
}

export const BroadcastHistoryTable: React.FC<BroadcastHistoryTableProps> = ({
  campaigns,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onDeleteCampaign,
  onExportCSV,
}) => {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();

  const handleDelete = async (campaign: CampaignRecord) => {
    const ok = await confirm({
      title: 'Delete Broadcast Campaign',
      body: `Are you sure you want to delete campaign "${campaign.title}"?`,
      tone: 'danger',
      confirmLabel: 'Delete Campaign',
    });

    if (ok) {
      onDeleteCampaign(campaign.id);
      toast.success('Campaign deleted successfully.');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'success' as const;
      case 'scheduled':
        return 'warning' as const;
      case 'draft':
      default:
        return 'neutral' as const;
    }
  };

  const columns: Column<CampaignRecord>[] = [
    {
      key: 'title',
      header: 'Campaign Title',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{c.title}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-subtle)' }}>
            Audience: {c.audience}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <StatusPill variant={getStatusVariant(c.status)}>{c.status}</StatusPill>
      ),
    },
    {
      key: 'sendDate',
      header: 'Send Date',
      render: (c) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
          {c.sendDate}
        </span>
      ),
    },
    {
      key: 'recipients',
      header: 'Recipients',
      render: (c) => (
        <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{c.recipients}</span>
      ),
    },
    {
      key: 'openRate',
      header: 'Open Rate',
      render: (c) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface)' }}>
          {c.openRate}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (c) => (
        <Button
          size="sm"
          variant="ghost"
          icon={<Trash2 size={14} />}
          onClick={() => handleDelete(c)}
          aria-label="Delete campaign"
        />
      ),
    },
  ];

  return (
    <Card
      title={t('tab_history') || 'Broadcast Campaign History'}
      subtitle="Track past broadcasts, delivery performance, and recipient engagement"
      actions={
        <Button
          size="sm"
          variant="outline"
          icon={<Download size={14} />}
          onClick={onExportCSV}
        >
          {t('btn_export') || 'Export'}
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {/* Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)',
          }}
        >
          <SearchInput
            placeholder="Search campaigns by title or audience..."
            value={searchQuery}
            onChange={setSearchQuery}
            style={{ maxWidth: 320 }}
          />

          <Segmented
            value={statusFilter}
            onChange={setStatusFilter}
            items={[
              { value: 'All', label: 'All' },
              { value: 'Sent', label: 'Sent' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Draft', label: 'Draft' },
            ]}
          />
        </div>

        <DataTable columns={columns} rows={campaigns} rowKey={(c) => c.id} />
      </div>
    </Card>
  );
};
