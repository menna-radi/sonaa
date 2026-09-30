import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Download, Plus, Play, Pause, Edit2, Trash2, Clock, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { resolveMediaUrl } from '../../../../core/utils/mediaUrl';
import { formatMoney } from '../../../../core/utils/format';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Segmented } from '../../../components/ui/Segmented';
import { SearchInput } from '../../../components/ui/SearchInput';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusPill } from '../../../components/ui/StatusPill';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { Campaign } from '../types';
import { AdsKpis } from '../components/AdsKpis';
import { AdsPerformanceChart } from '../components/AdsPerformanceChart';
import { TopPerformingAds } from '../components/TopPerformingAds';
import { EditCampaignModal } from '../components/EditCampaignModal';
import { NewCampaignModal } from '../components/NewCampaignModal';

const getAdStatusVariant = (status: string) => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Paused':
      return 'warning';
    case 'Scheduled':
      return 'info';
    case 'Expired':
      return 'muted';
    default:
      return 'neutral';
  }
};

export const AdsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;
  const confirm = useConfirm();
  const { success, error: toastError } = useToast();

  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');
  const [chartTimeFilter, setChartTimeFilter] = useState<'30d' | '90d' | 'ytd'>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adRepository.getAds();
      if (result.success) {
        setCampaigns(result.data as Campaign[]);
      } else {
        toastError(result.error.message || 'Failed to fetch campaigns.');
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to fetch campaigns.');
    } finally {
      setLoading(false);
    }
  }, [adRepository, toastError]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleToggleStatus = async (camp: Campaign) => {
    const nextStatus = camp.status === 'Active' ? 'Paused' : 'Active';
    try {
      const res = await adRepository.updateAdStatus(camp.id, nextStatus as 'Active' | 'Paused');
      if (res.success) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c))
        );
        success(`Campaign ${nextStatus === 'Active' ? 'activated' : 'paused'} successfully`);
      } else {
        toastError(res.error.message || 'Failed to update campaign status');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (camp: Campaign) => {
    const ok = await confirm({
      title: 'Delete Campaign',
      body: `Are you sure you want to delete campaign "${camp.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;

    try {
      const res = await adRepository.deleteAd(camp.id);
      if (res.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
        success('Campaign deleted successfully');
      } else {
        toastError(res.error.message || 'Failed to delete campaign');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete campaign');
    }
  };

  const handleCreateCampaign = async (name: string, budget: number, placement: string) => {
    const res = await adRepository.createAd(name, budget, placement);
    if (res.success) {
      setCampaigns((prev) => [res.data as Campaign, ...prev]);
      success('Campaign launched successfully');
    } else {
      throw new Error(res.error.message || 'Failed to create campaign');
    }
  };

  const handleSaveEdit = async (
    id: string,
    data: {
      name: string;
      budget: number;
      placement: string;
      description?: string;
      ctaText?: string;
      imageUrl?: string;
      startDate?: string;
      endDate?: string | null;
    }
  ) => {
    const res = await adRepository.updateAd(id, data);
    if (res.success) {
      await fetchCampaigns();
      success('Campaign updated successfully');
    } else {
      throw new Error(res.error.message || 'Failed to update campaign');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Campaign ID', 'Name', 'Placement', 'Status', 'Impressions', 'CTR', 'Conversions', 'Budget (ILS)'];
    const rows = campaigns.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.placement.replace(/"/g, '""')}"`,
      c.status,
      c.impressions,
      `${c.ctr}%`,
      c.conversions,
      c.budget,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ad_campaigns_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) => c.name.toLowerCase().includes(q) || c.placement.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  const renderScheduleBadge = (camp: Campaign) => {
    if (!camp.endDate) {
      return (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          {isRtl ? 'حملة مستمرة' : 'Continuous'}
        </span>
      );
    }
    const end = new Date(camp.endDate);
    const now = new Date();
    if (camp.startDate && new Date(camp.startDate) > now) {
      const start = new Date(camp.startDate);
      return (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--warning)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          {isRtl
            ? `مجدول (${start.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })})`
            : `Starts ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </span>
      );
    }
    if (end < now) {
      return (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--danger)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} />
          {isRtl
            ? `منتهي (${end.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })})`
            : `Ended (${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
        </span>
      );
    }
    return (
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={11} />
        {isRtl
          ? `حتى ${end.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`
          : `Until ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
      </span>
    );
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      render: (camp) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div
            onClick={() => setEditingCampaign(camp)}
            title="Edit campaign & creative"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {camp.imageUrl ? (
              <img
                src={resolveMediaUrl(camp.imageUrl)}
                alt={camp.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <ImageIcon size={18} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <span
              onClick={() => setEditingCampaign(camp)}
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {camp.name}
            </span>
            {camp.description && (
              <span
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '220px',
                }}
              >
                {camp.description}
              </span>
            )}
            {camp.targetUrl && (
              <a
                href={camp.targetUrl.startsWith('http') ? camp.targetUrl : `https://${camp.targetUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  marginTop: '2px',
                  maxWidth: '220px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {camp.targetUrl}
                </span>
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'placement',
      header: 'Placement',
      render: (camp) => (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          {camp.placement}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (camp) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-1)', alignItems: 'flex-start' }}>
          <StatusPill variant={getAdStatusVariant(camp.status)} label={camp.status} />
          {renderScheduleBadge(camp)}
        </div>
      ),
    },
    {
      key: 'impressions',
      header: 'Impressions',
      align: 'end',
      render: (camp) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {camp.impressions.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'end',
      render: (camp) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {camp.ctr > 0 ? `${camp.ctr}%` : '—'}
        </span>
      ),
    },
    {
      key: 'conversions',
      header: 'Conv.',
      align: 'end',
      render: (camp) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>
          {camp.conversions > 0 ? camp.conversions.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      align: 'end',
      render: (camp) => (
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
          {formatMoney(camp.budget, 'ILS')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (camp) => (
        <div style={{ display: 'flex', gap: 'var(--sp-1)', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(camp)}
            title={camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
          >
            {camp.status === 'Active' ? <Pause size={14} /> : <Play size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingCampaign(camp)}
            title="Edit Campaign"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(camp)}
            title="Delete Campaign"
          >
            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
      <PageHeader
        title={t('ads_title') || 'Ads & Promotions'}
        subtitle={t('ads_subtitle') || 'Manage campaigns, placements and performance'}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <Segmented
              value={timeFilter}
              onChange={(val) => setTimeFilter(val as typeof timeFilter)}
              items={[
                { value: '7d', label: t('ads_last_7_days') || 'Last 7d' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
                { value: 'ytd', label: 'YTD' },
              ]}
            />
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} />
              <span>{t('ads_export') || 'Export'}</span>
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('create_ad')}>
              <Plus size={14} />
              <span>{t('ads_new_campaign') || 'New Campaign'}</span>
            </Button>
          </div>
        }
      />

      <AdsKpis campaigns={campaigns} loading={loading} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--sp-4)',
          width: '100%',
        }}
      >
        <AdsPerformanceChart
          campaigns={campaigns}
          timeFilter={chartTimeFilter}
          onTimeFilterChange={setChartTimeFilter}
        />
        <TopPerformingAds campaigns={campaigns} />
      </div>

      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--sp-2)',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
              Active Campaigns Quick View
            </h3>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Currently running advertisements across all placements
            </span>
          </div>

          <div style={{ width: '260px' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filteredCampaigns}
          rowKey={(c) => c.id}
          loading={loading}
          empty={
            <EmptyState
              title="No campaigns found"
              description="Launch your first campaign to start driving engagement."
              action={
                <Button variant="primary" size="sm" onClick={() => navigate('create_ad')}>
                  <Plus size={14} />
                  <span>Create Campaign</span>
                </Button>
              }
            />
          }
          mobile={(camp) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                padding: 'var(--sp-3)',
                background: 'var(--surface-base)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{camp.name}</span>
                <StatusPill variant={getAdStatusVariant(camp.status)} label={camp.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                <span>{camp.placement}</span>
                <span>{formatMoney(camp.budget, 'ILS')}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', marginTop: 'var(--sp-1)' }}>
                <Button variant="outline" size="sm" onClick={() => handleToggleStatus(camp)}>
                  {camp.status === 'Active' ? 'Pause' : 'Resume'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingCampaign(camp)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(camp)}>
                  Delete
                </Button>
              </div>
            </div>
          )}
        />
      </Card>

      <NewCampaignModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />

      <EditCampaignModal
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default AdsPage;
