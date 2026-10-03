import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../../components/ui/Modal';
import type { Offer } from '../../../../domain/entities/Offer';
import { AndroidPhoneBannerPreview } from './AndroidPhoneBannerPreview';

interface OfferPreviewModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export const OfferPreviewModal: React.FC<OfferPreviewModalProps> = ({ offer, onClose }) => {
  const { t, language, isRtl } = useLanguage();
  if (!offer) return null;
  const title = language === 'ar' ? offer.titleAr : offer.titleEn;
  const subtitle = language === 'ar' ? offer.subtitleAr : offer.subtitleEn;
  const button = language === 'ar' ? offer.buttonTextAr : offer.buttonTextEn;

  return (
    <Modal isOpen={!!offer} onClose={onClose} title={t('offers_preview')} size="sm">
      <AndroidPhoneBannerPreview
        imageUrl={offer.imageUrl}
        adTitle={title}
        description={subtitle}
        ctaText={button}
        placement={offer.placement === 'TOP' ? 'Home Banner' : 'Featured Slots'}
        badgeText={offer.bannerType}
        isRtl={isRtl}
      />
    </Modal>
  );
};

export default OfferPreviewModal;
