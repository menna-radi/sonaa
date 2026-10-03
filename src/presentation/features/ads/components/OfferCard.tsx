import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, Card, ProofViewer, StatusPill } from '../../../components/ui';
import { pillVariantFor, statusLabelKey } from '../../../components/ui/status';
import { formatDate } from '../../../../core/utils/format';
import type { Offer } from '../../../../domain/entities/Offer';
import { getOfferState } from '../offerState';
import { Pencil, Pause, Play, Eye, Trash2, Link2 } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  onEdit: (offer: Offer) => void;
  onToggle: (offer: Offer) => void;
  onPreview: (offer: Offer) => void;
  onDelete: (offer: Offer) => void;
  busy: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onEdit, onToggle, onPreview, onDelete, busy }) => {
  const { t, language } = useLanguage();
  const state = getOfferState(offer);
  const title = language === 'ar' ? offer.titleAr : offer.titleEn;
  const subtitle = language === 'ar' ? offer.subtitleAr : offer.subtitleEn;
  const host = (() => {
    try {
      return offer.targetUrl ? new URL(offer.targetUrl).hostname : null;
    } catch {
      return null;
    }
  })();

  return (
    <Card className="offer-card">
      <div className="offer-card__media">
        <ProofViewer src={offer.imageUrl} alt={title} size={64} />
      </div>
      <div className="ui-stack ui-stack--tight">
        <div className="offer-card__title">{title}</div>
        <div className="ui-caption">{subtitle}</div>
        <div className="ui-row">
          <StatusPill variant={pillVariantFor('offer', state)} label={t(statusLabelKey('offer', state))} />
          <span className="ui-caption">{offer.placement === 'TOP' ? t('offers_placement_top') : t('offers_placement_featured')}</span>
          {offer.bannerType === 'EMERGENCY_SOS' && (
            <StatusPill variant="danger" label={t('offers_type_sos')} />
          )}
          {host && (
            <span className="ui-caption">
              <Link2 size={12} /> <bdi className="ui-num">{host}</bdi>
            </span>
          )}
        </div>
        {(offer.startDate || offer.endDate) && (
          <div className="ui-caption">
            <bdi className="ui-num">{offer.startDate ? formatDate(offer.startDate, language) : '—'}</bdi>
            {' → '}
            <bdi className="ui-num">{offer.endDate ? formatDate(offer.endDate, language) : '—'}</bdi>
          </div>
        )}
        <div className="ui-row">
          <Button size="sm" variant="outline" icon={<Pencil size={14} />} disabled={busy} onClick={() => onEdit(offer)}>
            {t('offers_edit')}
          </Button>
          <Button size="sm" variant="ghost" icon={offer.isActive ? <Pause size={14} /> : <Play size={14} />} disabled={busy} onClick={() => onToggle(offer)}>
            {offer.isActive ? t('offers_pause') : t('offers_resume')}
          </Button>
          <Button size="sm" variant="ghost" icon={<Eye size={14} />} onClick={() => onPreview(offer)}>
            {t('offers_preview')}
          </Button>
          <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} disabled={busy} onClick={() => onDelete(offer)}>
            {t('billing_delete')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OfferCard;
