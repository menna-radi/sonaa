import React, { useState } from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useLanguage } from '../../../context/LanguageContext';
import '../broadcast.css';

interface BroadcastPreviewProps {
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  targetCity?: string;
  audienceLabel: string;
}

/** Remounted per URL (via `key`) so a previously failed image does not hide the next one. */
const PreviewImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="bc-notif__image" src={src} alt={alt} onError={() => setFailed(true)} />;
};

export const BroadcastPreview: React.FC<BroadcastPreviewProps> = ({
  title,
  body,
  imageUrl,
  deepLink,
  targetCity,
  audienceLabel,
}) => {
  const { t } = useLanguage();
  const image = imageUrl?.trim();
  const link = deepLink?.trim();

  return (
    <Card
      title={
        <span className="ui-row">
          <Smartphone size={18} />
          {t('broadcast_preview_title')}
        </span>
      }
      subtitle={t('broadcast_preview_subtitle')}
    >
      <div className="bc-preview">
        <div className="bc-phone">
          <div className="bc-phone__notch" />
          <div className="bc-notif">
            <div className="bc-notif__head">
              <span className="bc-notif__app">
                <span className="bc-notif__logo">{t('brand_name').charAt(0)}</span>
                {t('brand_name')}
              </span>
              <span className="bc-notif__time">{t('broadcast_preview_now')}</span>
            </div>
            <div>
              <div className="bc-notif__title">{title.trim() || t('broadcast_preview_title_ph')}</div>
              <div className="bc-notif__body">{body.trim() || t('broadcast_preview_body_ph')}</div>
            </div>
            {image && <PreviewImage key={image} src={image} alt={t('broadcast_preview_image_alt')} />}
            {link && (
              <div className="bc-notif__link">
                <ExternalLink size={10} />
                <bdi>{link}</bdi>
              </div>
            )}
          </div>
        </div>
        <div className="bc-preview__meta">
          <span>
            {t('broadcast_field_audience')}: <strong>{audienceLabel}</strong>
          </span>
          {targetCity && (
            <span>
              {t('broadcast_field_city')}: <strong>{targetCity}</strong>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
