/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button, ButtonVariant } from './Button';
import { TextArea, TextField } from './FormFields';

export interface ConfirmOptions {
  title: string;
  body: React.ReactNode;
  tone?: 'default' | 'danger' | 'warning';
  confirmLabel?: string;
  cancelLabel?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  /** When set, the confirm button stays disabled until this exact text is typed. */
  confirmText?: string;
  confirmTextPlaceholder?: string;
}

export interface ConfirmResult {
  confirmed: boolean;
  reason?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmWithReason: (options: ConfirmOptions) => Promise<ConfirmResult>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', body: '' });
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [typedText, setTypedText] = useState('');

  const resolverRef = useRef<((value: ConfirmResult) => void) | null>(null);

  const confirmWithReason = (opts: ConfirmOptions): Promise<ConfirmResult> => {
    setOptions(opts);
    setReason('');
    setReasonError('');
    setTypedText('');
    setIsOpen(true);

    return new Promise<ConfirmResult>((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const confirm = async (opts: ConfirmOptions): Promise<boolean> => {
    const result = await confirmWithReason(opts);
    return result.confirmed;
  };

  const confirmBlocked = !!options.confirmText && typedText !== options.confirmText;

  const handleConfirm = () => {
    if (options.requireReason && !reason.trim()) {
      setReasonError('Please provide a reason before proceeding.');
      return;
    }
    if (confirmBlocked) return;
    setIsOpen(false);
    resolverRef.current?.({ confirmed: true, reason: reason.trim() });
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolverRef.current?.({ confirmed: false });
  };

  const getConfirmButtonVariant = (): ButtonVariant => {
    if (options.tone === 'danger') return 'danger';
    if (options.tone === 'warning') return 'soft-warning';
    return 'primary';
  };

  return (
    <ConfirmContext.Provider value={{ confirm, confirmWithReason }}>
      {children}
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={options.title}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelLabel || 'Cancel'}
            </Button>
            <Button variant={getConfirmButtonVariant()} onClick={handleConfirm} disabled={confirmBlocked}>
              {options.confirmLabel || 'Confirm'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-body)', lineHeight: 1.5 }}>
            {options.body}
          </div>

          {options.confirmText && (
            <TextField
              label={options.confirmTextPlaceholder || `Type ${options.confirmText} to confirm`}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              dir="ltr"
            />
          )}

          {options.requireReason && (
            <TextArea
              label="Reason for audit log (required)"
              placeholder={options.reasonPlaceholder || 'Explain the rationale for this action...'}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
              error={reasonError}
              sunken
            />
          )}
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType['confirm'] => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
};

export const useConfirmWithReason = (): ConfirmContextType['confirmWithReason'] => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirmWithReason must be used within a ConfirmProvider');
  }
  return context.confirmWithReason;
};

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: React.ReactNode;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ fontSize: 'var(--fs-body)', color: 'var(--text-body)', lineHeight: 1.5 }}>
        {description ?? body}
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
