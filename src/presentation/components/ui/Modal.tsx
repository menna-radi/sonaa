import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { useLanguage } from '../../context/LanguageContext';
import { useFocusTrap } from './useFocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  preventClose?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  preventClose = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const maxWidthMap = {
    sm: 420,
    md: 560,
    lg: 760,
  };

  const content = (
    <div
      className="ui-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !preventClose) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? 'Dialog' : undefined}
        className={`ui-modal ${className}`}
        style={{ maxWidth: maxWidthMap[size] }}
      >
        {title && (
          <div className="ui-modal__header">
            <div className="ui-modal__title" id={titleId}>{title}</div>
            {!preventClose && (
              <IconButton
                aria-label={t('btn_close')}
                icon={<X size={18} />}
                size="sm"
                onClick={onClose}
              />
            )}
          </div>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
