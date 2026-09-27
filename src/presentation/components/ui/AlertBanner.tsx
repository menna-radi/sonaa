import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';
import { resolveMediaUrl } from '../../../core/utils/mediaUrl';
import { IconButton } from './Button';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src?: string | null;
  alt?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  src,
  alt = 'Preview image',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const resolved = resolveMediaUrl(src);

  const content = (
    <div
      className="ui-backdrop"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 2500,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: 24,
          insetInlineEnd: 24,
          zIndex: 2501,
        }}
      >
        <IconButton
          aria-label="Close image lightbox"
          icon={<X size={24} color="#FFFFFF" />}
          size="lg"
          onClick={onClose}
        />
      </div>

      <img
        src={resolved}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          objectFit: 'contain',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
        }}
      />
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};

export interface AlertBannerProps {
  title: React.ReactNode;
  body?: React.ReactNode;
  message?: React.ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  body,
  message,
  tone = 'default',
  actions,
  icon,
  className = '',
}) => {
  const content = message ?? body;
  const toneClass = tone !== 'default' ? `ui-alert-banner--${tone}` : '';

  return (
    <div className={`ui-alert-banner ${toneClass} ${className}`}>
      <div className="ui-alert-banner__left">
        {icon}
        <div>
          <div className="ui-alert-banner__title">{title}</div>
          {content && <div className="ui-alert-banner__body">{content}</div>}
        </div>
      </div>
      {actions && <div className="ui-alert-banner__actions">{actions}</div>}
    </div>
  );
};
