import React, { useState } from 'react';
import { ZoomIn, FileText, AlertCircle } from 'lucide-react';
import { Card, IconButton, Skeleton } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { tf } from '../utils';

export interface DocumentField {
  label: string;
  value?: string | number | null;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

interface DocumentCardProps {
  title: string;
  imageUrl?: string;
  fields?: DocumentField[];
  onZoom?: (url: string) => void;
  craftsmanName?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  imageUrl,
  fields = [],
  onZoom,
  craftsmanName,
}) => {
  const { t } = useLanguage();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Filter only fields that actually exist (no placeholder data)
  const validFields = fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== '');
  const canZoom = Boolean(imageUrl && !imageError && onZoom);

  return (
    <Card
      title={title}
      headerAction={
        imageUrl && canZoom && onZoom ? (
          <IconButton
            icon={<ZoomIn size={14} />}
            aria-label={tf(t, 'vr_doc_zoom', { title })}
            onClick={() => onZoom(imageUrl)}
            variant="ghost"
          />
        ) : undefined
      }
      padding="md"
      className="vr-document-card"
    >
      <div
        className={`vr-doc-media${canZoom ? ' vr-doc-media--zoomable' : ''}`}
        onClick={() => {
          if (imageUrl && canZoom && onZoom) onZoom(imageUrl);
        }}
      >
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div className="vr-doc-skeleton">
                <Skeleton width="100%" height="100%" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className={`vr-doc-img${imageLoading ? ' vr-doc-img--hidden' : ''}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </>
        ) : (
          <div className="vr-doc-placeholder">
            {imageError ? (
              <>
                <AlertCircle size={28} className="vr-icon-warning" />
                <span className="vr-doc-placeholder__title">{t('vr_doc_load_failed')}</span>
              </>
            ) : (
              <>
                <FileText size={28} className="vr-icon-faint" />
                <span className="vr-doc-placeholder__title">{t('vr_doc_none')}</span>
                {craftsmanName && (
                  <span className="vr-doc-placeholder__hint">{tf(t, 'vr_doc_none_hint', { name: craftsmanName })}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {validFields.length > 0 && (
        <div className="vr-doc-fields">
          {validFields.map((field, idx) => (
            <div key={idx} className="vr-doc-field">
              <span className="vr-doc-field__label">{field.label}</span>
              <span
                className={`vr-doc-field__value${typeof field.value === 'number' ? ' vr-doc-field__value--num' : ''}${
                  field.tone && field.tone !== 'default' ? ` vr-tone-${field.tone}` : ''
                }`}
              >
                {field.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DocumentCard;
