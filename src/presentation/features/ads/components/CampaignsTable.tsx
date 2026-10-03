import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import {
  Button,
  Card,
  DataTable,
  Dropdown,
  EmptyState,
  ErrorState,
  ProofViewer,
  SearchInput,
  StatusPill,
} from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { formatDate, formatNumber, formatPercentValue } from '../../../../core/utils/format';
import type { Campaign } from '../../../../domain/repositories/AdRepository';
import { useCampaigns, useDeleteCampaign, useUpdateCampaign, useUpdateCampaignStatus } from '../hooks/useCampaigns';
import { getCampaignState } from './campaignState';
import { CampaignRow } from './CampaignRow';
import { EditCampaignModal } from './EditCampaignModal';
import { Megaphone, MoreVertical, Pause, Pencil, Play, Plus, Square, Trash2 } from 'lucide-react';

export type CampaignsTab = 'Active' | 'Scheduled' | 'Ended';

interface CampaignsTableProps {
  tab: CampaignsTab;
}

const ctrOf = (camp: Campaign): number | null => {
  const impressions = camp.impressions || 0;
  if (impressions <= 0) return null;
  return ((camp.clicks ?? 0) / impressions) * 100;
};

export const CampaignsTable: React.FC<CampaignsTableProps> = ({ tab }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();
  const confirm = useConfirm();
  const campaignsQ = useCampaigns();
  const updateStatus = useUpdateCampaignStatus();
  const updateCampaign = useUpdateCampaign();
  const remove = useDeleteCampaign();
  const busy = updateStatus.isPending || updateCampaign.isPending || remove.isPending;

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [now] = useState(() => Date.now());

  const rows = (campaignsQ.data ?? []).filter((c) => {
    const state = getCampaignState(c, now);
    if (tab === 'Active') return state === 'ACTIVE' || state === 'PAUSED';
    if (tab === 'Scheduled') return state === 'SCHEDULED';
    return state === 'ENDED';
  }).filter((c) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return `${c.name} ${c.description ?? ''} ${c.placement}`.toLowerCase().includes(needle);
  });

  const handleToggle = (camp: Campaign) => {
    updateStatus.mutate({ id: camp.id, status: camp.status === 'Active' ? 'Paused' : 'Active' });
  };

  const handleEnd = async (camp: Campaign) => {
    const ok = await confirm({ title: t('campaigns_end_title'), body: t('campaigns_end_body'), tone: 'warning' });
    if (!ok) return;
    updateStatus.mutate({ id: camp.id, status: 'Ended' });
  };

  const handleDelete = async (camp: Campaign) => {
    const ok = await confirm({ title: t('campaigns_delete_title'), body: t('campaigns_delete_body'), tone: 'danger' });
    if (!ok) return;
    remove.mutate(camp.id);
  };

  const handleSaveEdit = async (
    id: string,
    data: { name: string; budget: number; placement: string; description?: string; ctaText?: string; imageUrl?: string; targetUrl?: string; startDate?: string; endDate?: string | null }
  ) => {
    await updateCampaign.mutateAsync({ id, data });
  };

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <div className="ui-toolbar__grow">
          <SearchInput value={search} onChange={setSearch} placeholder={t('campaigns_search_ph')} />
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => navigate('create_ad')}>
          {t('campaigns_new')}
        </Button>
      </div>
      <Card padding="none">
        {campaignsQ.isError ? (
          <ErrorState title={t('status_error_title')} message={campaignsQ.error.message} onRetry={() => campaignsQ.refetch()} retryLabel={t('btn_retry')} />
        ) : (
          <DataTable
            columns={[
              {
                key: 'campaign',
                header: t('campaigns_col_campaign'),
                render: (camp: Campaign) => (
                  <span className="ui-row">
                    <ProofViewer src={camp.imageUrl} alt={camp.name} size={40} />
                    <span className="campaign-cell">
                      <span className="ui-text-strong ui-clamp-1">{camp.name}</span>
                      {camp.description ? <span className="ui-caption ui-clamp-1">{camp.description}</span> : ''}
                    </span>
                  </span>
                ),
              },
              { key: 'placement', header: t('campaigns_col_placement'), render: (camp: Campaign) => <span>{camp.placement}</span> },
              {
                key: 'window',
                header: t('campaigns_col_window'),
                render: (camp: Campaign) => (
                  <bdi className="ui-num ui-caption">
                    {camp.startDate ? formatDate(camp.startDate, language) : '—'}
                    {' → '}
                    {camp.endDate ? formatDate(camp.endDate, language) : '—'}
                  </bdi>
                ),
              },
              {
                key: 'impressions',
                header: t('campaigns_col_impressions'),
                align: 'end',
                render: (camp: Campaign) => <bdi className="ui-num">{formatNumber(camp.impressions, language)}</bdi>,
              },
              {
                key: 'clicks',
                header: t('campaigns_col_clicks'),
                align: 'end',
                render: (camp: Campaign) => <bdi className="ui-num">{formatNumber(camp.clicks ?? 0, language)}</bdi>,
              },
              {
                key: 'ctr',
                header: t('campaigns_col_ctr'),
                align: 'end',
                render: (camp: Campaign) => {
                  const ctr = ctrOf(camp);
                  return <bdi className="ui-num">{ctr === null ? '—' : formatPercentValue(ctr)}</bdi>;
                },
              },
              {
                key: 'status',
                header: t('billing_col_status'),
                render: (camp: Campaign) => {
                  const state = getCampaignState(camp, now);
                  return <StatusPill variant={pillVariantFor('offer', state)} label={t(statusLabelKey('offer', state))} />;
                },
              },
              {
                key: 'actions',
                header: t('billing_col_actions'),
                align: 'end',
                render: (camp: Campaign) => {
                  const ended = getCampaignState(camp, now) === 'ENDED';
                  return (
                    <span className="ui-row">
                      <Button size="sm" variant="ghost" icon={<Pencil size={14} />} aria-label={t('campaigns_edit')} disabled={busy} onClick={() => setEditing(camp)} />
                      <Dropdown
                        align="end"
                        trigger={
                          <Button variant="ghost" size="sm" aria-label={t('billing_col_actions')}>
                            <MoreVertical size={16} />
                          </Button>
                        }
                        items={[
                          ...(!ended
                            ? [
                                {
                                  key: 'toggle',
                                  label: camp.status === 'Active' ? t('campaigns_pause') : t('campaigns_resume'),
                                  icon: camp.status === 'Active' ? <Pause size={14} /> : <Play size={14} />,
                                  onClick: () => handleToggle(camp),
                                },
                                {
                                  key: 'end',
                                  label: t('campaigns_end'),
                                  icon: <Square size={14} />,
                                  onClick: () => void handleEnd(camp),
                                },
                              ]
                            : []),
                          {
                            key: 'delete',
                            label: t('billing_delete'),
                            icon: <Trash2 size={14} />,
                            tone: 'danger' as const,
                            onClick: () => void handleDelete(camp),
                          },
                        ]}
                      />
                    </span>
                  );
                },
              },
            ]}
            rows={rows}
            rowKey={(c: Campaign) => c.id}
            loading={campaignsQ.isLoading}
            empty={
              <EmptyState
                icon={<Megaphone size={20} />}
                title={t('empty_campaigns')}
                action={
                  <Button variant="primary" size="sm" onClick={() => navigate('create_ad')}>
                    {t('campaigns_new')}
                  </Button>
                }
              />
            }
            mobile={(camp: Campaign) => (
              <CampaignRow
                camp={camp}
                busy={busy}
                onEdit={setEditing}
                onToggle={handleToggle}
                onEnd={(c) => void handleEnd(c)}
                onDelete={(c) => void handleDelete(c)}
              />
            )}
          />
        )}
      </Card>
      <EditCampaignModal
        campaign={editing}
        onClose={() => setEditing(null)}
        onSave={handleSaveEdit}
        loading={updateCampaign.isPending}
      />
    </div>
  );
};

export default CampaignsTable;
