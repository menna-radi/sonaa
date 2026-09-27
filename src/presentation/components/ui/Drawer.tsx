import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';
import { IconButton, Button } from './Button';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right';
  showBackOnMobile?: boolean;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width,
  size = 'md',
  position = 'right',
  showBackOnMobile = false,
  className = '',
}) => {
  const resolvedWidth = width ?? (size === 'sm' ? 320 : size === 'lg' ? 600 : 440);
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <>
      <div className="ui-drawer-backdrop" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Drawer'}
        className={`ui-drawer ${className}`}
        style={{ width: resolvedWidth }}
      >
        <div className="ui-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showBackOnMobile && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={18} className="ui-icon--directional" />}
                onClick={onClose}
              >
                Back
              </Button>
            )}
            <div>
              {title && <div className="ui-modal__title">{title}</div>}
              {subtitle && (
                <div style={{ fontSize: 'var(--fs-caption)', color: 'var(--text-muted)' }}>
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <IconButton
            aria-label="Close drawer"
            icon={<X size={18} />}
            size="sm"
            onClick={onClose}
          />
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
