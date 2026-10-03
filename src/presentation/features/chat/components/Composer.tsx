import React, { useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button, IconButton, Select } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';

export type ChatVisibility = 'PUBLIC' | 'CUSTOMER_PRIVATE' | 'CRAFTSMAN_PRIVATE' | 'ADMIN_INTERNAL';

export interface ComposerProps {
  inputContent: string;
  onChangeContent: (val: string) => void;
  selectedImage: string | null;
  onPickImage: (file: File) => void;
  onRemoveImage: () => void;
  onSend: () => void;
  sending: boolean;
  visibility: ChatVisibility;
  onChangeVisibility: (v: ChatVisibility) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  inputContent,
  onChangeContent,
  selectedImage,
  onPickImage,
  onRemoveImage,
  onSend,
  sending,
  visibility,
  onChangeVisibility,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visibilityOptions = [
    { value: 'PUBLIC', label: t('chat_visibility_public') },
    { value: 'CUSTOMER_PRIVATE', label: t('chat_visibility_customer_private') },
    { value: 'CRAFTSMAN_PRIVATE', label: t('chat_visibility_craftsman_private') },
    { value: 'ADMIN_INTERNAL', label: t('chat_visibility_internal') },
  ];

  const getHelperText = () => {
    switch (visibility) {
      case 'CUSTOMER_PRIVATE':
        return t('chat_visibility_helper_customer');
      case 'CRAFTSMAN_PRIVATE':
        return t('chat_visibility_helper_craftsman');
      case 'ADMIN_INTERNAL':
        return t('chat_visibility_helper_internal');
      case 'PUBLIC':
      default:
        return t('chat_visibility_helper_public');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending && (inputContent.trim() || selectedImage)) {
        onSend();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPickImage(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chat-composer">
      {/* Visibility control bar */}
      <div className="chat-composer__visibility">
        <div style={{ maxWidth: 220 }}>
          <Select
            value={visibility}
            onChange={(e) => onChangeVisibility(e.target.value as ChatVisibility)}
            options={visibilityOptions}
          />
        </div>
        <span className="ui-caption ui-text-muted">
          {getHelperText()}
        </span>
      </div>

      {/* Attached image preview */}
      {selectedImage && (
        <div className="ui-row" style={{ width: 'fit-content', padding: 'var(--sp-2)', background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)' }}>
          <img
            src={selectedImage}
            alt={t('preview_image') || 'Preview'}
            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
          />
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onRemoveImage}
            icon={<X size={14} />}
            aria-label={t('chat_remove_image')}
          />
        </div>
      )}

      {/* Input controls row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!sending && (inputContent.trim() || selectedImage)) {
            onSend();
          }
        }}
        className="chat-composer__bar"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <IconButton
          type="button"
          variant="ghost"
          size="md"
          onClick={() => fileInputRef.current?.click()}
          icon={<Paperclip size={18} />}
          aria-label={t('chat_attach_image')}
        />

        <textarea
          rows={1}
          value={inputContent}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat_type_message')}
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface-card)',
            color: 'var(--text-strong)',
            fontFamily: 'inherit',
            resize: 'none',
          }}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={sending || (!inputContent.trim() && !selectedImage)}
          icon={<Send size={15} />}
          loading={sending}
        >
          {t('chat_send')}
        </Button>
      </form>
    </div>
  );
};
export default Composer;
