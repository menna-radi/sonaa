import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';

interface ImageLightboxProps {
  url: string | null;
  onClose: () => void;
  title?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ url, onClose, title }) => {
  const { t } = useLanguage();
  useEffect(() => {
    if (!url) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [url, onClose]);

  if (!url) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-6)',
        cursor: 'zoom-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'default',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -16,
            right: -16,
            zIndex: 10,
          }}
        >
          <IconButton
            icon={<X size={18} />}
            aria-label={t('btn_close_lightbox') || 'Close image preview'}
            onClick={onClose}
            variant="ghost"
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-overlay)',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>

        <img
          src={url}
          alt={title}
          style={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-overlay)',
            objectFit: 'contain',
            background: 'var(--surface-sunken)',
          }}
        />
      </div>
    </div>
  );
};

export default ImageLightbox;
