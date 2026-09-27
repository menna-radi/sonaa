import React, { useState } from 'react';
import { ZoomIn, FileText, AlertCircle } from 'lucide-react';
import { Card, IconButton, Skeleton } from '../../../components/ui';

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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Filter only fields that actually exist (no placeholder data)
  const validFields = fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== '');

  const getToneColor = (tone?: 'default' | 'success' | 'warning' | 'danger') => {
    switch (tone) {
      case 'success':
        return 'var(--success)';
      case 'warning':
        return 'var(--warning)';
      case 'danger':
        return 'var(--danger)';
      default:
        return 'var(--text-primary)';
    }
  };

  return (
    <Card
      title={title}
      headerAction={
        imageUrl && !imageError && onZoom ? (
          <IconButton
            icon={<ZoomIn size={14} />}
            aria-label={`Zoom ${title}`}
            onClick={() => onZoom(imageUrl)}
            variant="ghost"
          />
        ) : undefined
      }
      padding="md"
      className="vr-document-card"
    >
      {/* 16:10 aspect ratio image area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          background: 'var(--surface-sunken)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          cursor: imageUrl && !imageError && onZoom ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (imageUrl && !imageError && onZoom) {
            onZoom(imageUrl);
          }
        }}
      >
        {imageUrl && !imageError ? (
          <>
            {imageLoading && (
              <div style={{ position: 'absolute', inset: 0 }}>
                <Skeleton width="100%" height="100%" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: imageLoading ? 'none' : 'block',
              }}
            />
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--sp-2)',
              padding: 'var(--sp-4)',
              textAlign: 'center',
            }}
          >
            {imageError ? (
              <>
                <AlertCircle size={28} style={{ color: 'var(--warning)' }} />
                <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Failed to load image
                </span>
              </>
            ) : (
              <>
                <FileText size={28} style={{ color: 'var(--text-faint)' }} />
                <span style={{ fontSize: 'var(--fs-caption)', fontWeight: 600, color: 'var(--text-muted)' }}>
                  No document uploaded
                </span>
                {craftsmanName && (
                  <span style={{ fontSize: 'var(--fs-nano)', color: 'var(--text-faint)' }}>
                    {craftsmanName} has not submitted this photo yet.
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Key-Value Fields */}
      {validFields.length > 0 && (
        <div
          style={{
            marginTop: 'var(--sp-3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-1)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--sp-2)',
          }}
        >
          {validFields.map((field, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBlock: 'var(--sp-1)',
                fontSize: 'var(--fs-caption)',
              }}
            >
              <span style={{ color: 'var(--text-faint)' }}>{field.label}</span>
              <span
                style={{
                  fontWeight: 600,
                  color: getToneColor(field.tone),
                  fontFamily: typeof field.value === 'number' ? 'var(--font-mono)' : 'inherit',
                }}
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
