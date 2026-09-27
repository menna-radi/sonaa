import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Megaphone,
  Calendar,
  Clock,
  Edit2,
  MoreVertical,
  Image as ImageIcon,
} from 'lucide-react';
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
import { Select } from '../../../components/ui/FormFields';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { StatusPill } from '../../../components/ui/StatusPill';
import { Dropdown, DropdownItem } from '../../../components/ui/Dropdown';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { Campaign } from '../types';
import { EditCampaignModal } from '../components/EditCampaignModal';

interface ActiveCampaignsPageProps {
  defaultTab?: 'Active' | 'Scheduled' | 'Expired';
}

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

export const ActiveCampaignsPage: React.FC<ActiveCampaignsPageProps> = ({
  defaultTab = 'Active',
}) => {
  const { isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { dependencies } = useDependencies();
  const { adRepository } = dependencies;
  const confirm = useConfirm();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'Active' | 'Scheduled' | 'Expired'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlacement, setSelectedPlacement] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'spend' | 'impressions'>('default');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adRepository.getAds();
      if (result.success) {
        setCampaigns(result.data as Campaign[]);
      } else {
        toastError(result.error.message || 'Failed to load campaigns');
      }
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Failed to load campaigns');
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
        success(`Campaign ${nextStatus === 'Active' ? 'resumed' : 'paused'} successfully`);
      } else {
        toastError(res.error.message || 'Failed to update campaign status');
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteCampaign = async (camp: Campaign) => {
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

  const tabCounts = useMemo(() => {
    const now = new Date();
    const active = campaigns.filter((c) => {
      if (c.status === 'Paused') return true;
      if (c.status !== 'Active') return false;
      if (c.endDate && new Date(c.endDate) < now) return false;
      if (c.startDate && new Date(c.startDate) > now) return false;
      return true;
    }).length;

    const scheduled = campaigns.filter((c) => {
      if (c.status === 'Scheduled') return true;
      return c.startDate && new Date(c.startDate) > now;
    }).length;

    const expired = campaigns.filter((c) => {
      if (c.status === 'Expired') return true;
      return c.endDate && new Date(c.endDate) < now;
    }).length;

    return { Active: active, Scheduled: scheduled, Expired: expired };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns
      .filter((c) => {
        if (activeTab === 'Active') {
          if (c.status === 'Paused') return true;
          if (c.status === 'Active') {
            if (c.endDate && new Date(c.endDate) < now) return false;
            if (c.startDate && new Date(c.startDate) > now) return false;
            return true;
          }
          return false;
        }
        if (activeTab === 'Scheduled') {
          return c.status === 'Scheduled' || (c.startDate ? new Date(c.startDate) > now : false);
        }
        if (activeTab === 'Expired') {
          return c.status === 'Expired' || (c.endDate ? new Date(c.endDate) < now : false);
        }
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.placement.toLowerCase().includes(q)
        );
      })
      .filter((c) => {
        if (selectedPlacement === 'All') return true;
        return c.placement === selectedPlacement;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'spend') return (b.budget || 0) - (a.budget || 0);
        if (sortBy === 'impressions') return (b.impressions || 0) - (a.impressions || 0);
        return 0;
      });
  }, [campaigns, activeTab, searchQuery, selectedPlacement, sortBy]);

  const pageMeta = useMemo(() => {
    switch (activeTab) {
      case 'Scheduled':
        return {
          title: 'Scheduled Campaigns',
          subtitle: 'Campaigns queued to launch in the future',
          icon: <Calendar size={18} />,
        };
      case 'Expired':
        return {
          title: 'Expired Campaigns',
          subtitle: 'Past advertisement campaigns that have ended',
          icon: <Clock size={18} />,
        };
      case 'Active':
      default:
        return {
          title: isRtl ? 'الإعلانات النشطة' : 'Active Ads',
          subtitle: isRtl
            ? 'الإعلانات التي تعمل حالياً عبر المنصة'
            : 'Currently running advertisements across the marketplace',
          icon: <Megaphone size={18} />,
        };
    }
  }, [activeTab, isRtl]);

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
            : `Ended (${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`}
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

  const getRowActions = (camp: Campaign): DropdownItem[] => {
    const items: DropdownItem[] = [];

    if (camp.status === 'Active' || camp.status === 'Paused') {
      items.push({
        key: 'toggle',
        label: camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign',
        icon: camp.status === 'Active' ? <Pause size={14} /> : <Play size={14} />,
        onClick: () => handleToggleStatus(camp),
      });
    }

    items.push({
      key: 'edit',
      label: 'Edit Campaign',
      icon: <Edit2 size={14} />,
      onClick: () => setEditingCampaign(camp),
    });

    items.push({
      key: 'delete',
      label: 'Delete Campaign',
      icon: <Trash2 size={14} />,
      tone: 'danger',
      onClick: () => handleDeleteCampaign(camp),
    });

    return items;
  };

  const columns: Column<Campaign>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      render: (camp) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          <div
            onClick={() => setEditingCampaign(camp)}
            title="Edit campaign"
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
      header: '',
      align: 'center',
      width: 50,
      render: (camp) => (
        <Dropdown
          align="end"
          trigger={
            <Button variant="ghost" size="sm" aria-label="Campaign options">
              <MoreVertical size={16} />
            </Button>
          }
          items={getRowActions(camp)}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', width: '100%' }}>
      <PageHeader
        title={pageMeta.title}
        subtitle={pageMeta.subtitle}
        actions={
          <Button variant="primary" size="sm" onClick={() => navigate('create_ad')}>
            <Plus size={14} />
            <span>New Campaign</span>
          </Button>
        }
      />

      <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {/* Segmented Tab Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          <Segmented
            value={activeTab}
            onChange={(val) => setActiveTab(val as typeof activeTab)}
            items={[
              { value: 'Active', label: 'Active', count: tabCounts.Active },
              { value: 'Scheduled', label: 'Scheduled', count: tabCounts.Scheduled },
              { value: 'Expired', label: 'Expired', count: tabCounts.Expired },
            ]}
          />
        </div>

        {/* Toolbar: Search, Filters, Sort */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-2)',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '360px' }}>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <div style={{ width: '160px' }}>
              <Select
                value={selectedPlacement}
                onChange={(e) => setSelectedPlacement(e.target.value)}
                options={[
                  { value: 'All', label: 'All Placements' },
                  { value: 'Home Banner', label: 'Home Banner' },
                  { value: 'Search Results', label: 'Search Results' },
                  { value: 'Popups', label: 'Popups' },
                  { value: 'Category Page', label: 'Category Page' },
                  { value: 'Craftsmen Listing', label: 'Craftsmen Listing' },
                  { value: 'Notifications', label: 'Notifications' },
                ]}
              />
            </div>

            <div style={{ width: '140px' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                options={[
                  { value: 'default', label: 'Default Order' },
                  { value: 'name', label: 'Name (A-Z)' },
                  { value: 'spend', label: 'Highest Budget' },
                  { value: 'impressions', label: 'Most Views' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          rows={filteredCampaigns}
          rowKey={(c) => c.id}
          loading={loading}
          empty={
            <EmptyState
              title={`No ${activeTab.toLowerCase()} campaigns`}
              description={`There are currently no campaigns matching the "${activeTab}" filter.`}
              action={
                activeTab === 'Active' ? (
                  <Button variant="primary" size="sm" onClick={() => navigate('create_ad')}>
                    <Plus size={14} />
                    <span>Create Campaign</span>
                  </Button>
                ) : undefined
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
                <Button variant="outline" size="sm" onClick={() => setEditingCampaign(camp)}>
                  Edit
                </Button>
                <Dropdown
                  align="end"
                  trigger={
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  }
                  items={getRowActions(camp)}
                />
              </div>
            </div>
          )}
        />
      </Card>

      <EditCampaignModal
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ActiveCampaignsPage;
