import React, { useState } from 'react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { AlertBanner, Button, Modal, useToast } from '../../../components/ui';

export interface TemporaryPasswordModalProps {
  isOpen: boolean;
  email: string;
  password: string;
  onClose: () => void;
}

export const TemporaryPasswordModal: React.FC<TemporaryPasswordModalProps> = ({ isOpen, email, password, onClose }) => {
  const { t } = useLanguage();
  const { error } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      error(t('team_copy_failed'));
    }
  };

  const close = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={t('team_temp_password_title')}
      size="sm"
      preventClose
      footer={
        <Button variant="primary" onClick={close}>
          {t('team_temp_password_saved')}
        </Button>
      }
    >
      <div className="ui-stack">
        <AlertBanner tone="warning" icon={<ShieldAlert size={18} />} title={t('team_temp_password_warning')} />
        <div className="ui-stack ui-stack--tight">
          <span className="ui-caption">
            {t('team_temp_password_for')} <bdi className="ui-num">{email}</bdi>
          </span>
          <div className="team-password">
            <code className="team-password__value ui-num">{password}</code>
            <Button
              variant="outline"
              size="sm"
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
              onClick={copy}
            >
              {copied ? t('team_copied') : t('team_copy')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemporaryPasswordModal;
