import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Dropdown, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate, formatNumber } from '../../../../core/utils/format';
import type { Campaign } from '../../../../domain/repositories/AdRepository';
import { getCampaignState } from './campaignState';
import { Pencil, Pause, Play, Square, Trash2, MoreVertical } from 'lucide-react';

interface CampaignRowProps {
  camp: Campaign;
  onEdit: (camp: Campaign) => void;
  onToggle: (camp: Campaign) => void;
  onEnd: (camp: Campaign) => void;
  onDelete: (camp: Campaign) => void;
  busy: boolean;
}

export const CampaignRow: React.FC<CampaignRowProps> = ({ camp, onEdit, onToggle, onEnd, onDelete, busy }) => {
  const { t, language } = useLanguage();
  const state = getCampaignState(camp);
  const ended = state === 'ENDED';

  return (
    <div className="campaign-row">
      <div className="campaign-row__top">
        <span className="campaign-row__name">{camp.name}</span>
        <StatusPill variant={pillVariantFor('offer', state)} label={t(statusLabelKey('offer', state))} />
      </div>
      <div className="ui-caption">
        {camp.placement}
        {' · '}
        <bdi className="ui-num">
          {camp.startDate ? formatDate(camp.startDate, language) : '—'}
          {' → '}
          {camp.endDate ? formatDate(camp.endDate, language) : '—'}
        </bdi>
      </div>
      <div className="ui-caption">
        <bdi className="ui-num">
          {formatNumber(camp.impressions, language)} {t('campaigns_impressions')}
          {' · '}
          {formatNumber(camp.clicks ?? 0, language)} {t('campaigns_clicks')}
        </bdi>
      </div>
      <div className="campaign-row__actions">
        <Button size="sm" variant="outline" icon={<Pencil size={14} />} disabled={busy} onClick={() => onEdit(camp)}>
          {t('campaigns_edit')}
        </Button>
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
                    onClick: () => onToggle(camp),
                  },
                  {
                    key: 'end',
                    label: t('campaigns_end'),
                    icon: <Square size={14} />,
                    onClick: () => onEnd(camp),
                  },
                ]
              : []),
            {
              key: 'delete',
              label: t('billing_delete'),
              icon: <Trash2 size={14} />,
              tone: 'danger' as const,
              onClick: () => onDelete(camp),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CampaignRow;
