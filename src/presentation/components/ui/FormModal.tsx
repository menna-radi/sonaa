import React, { useId } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  size?: 'sm' | 'md' | 'lg';
  submitDisabled?: boolean;
  children: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  submitLabel,
  cancelLabel,
  pending = false,
  size = 'md',
  submitDisabled = false,
  children,
}) => {
  const { t } = useLanguage();
  const formId = useId();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      preventClose={pending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            {cancelLabel ?? t('btn_cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={formId}
            loading={pending}
            disabled={submitDisabled || pending}
          >
            {submitLabel ?? t('btn_save')}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
      >
        {children}
      </form>
    </Modal>
  );
};

export default FormModal;
