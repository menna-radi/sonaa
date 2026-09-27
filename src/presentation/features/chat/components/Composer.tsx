import React, { useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Button, IconButton } from '../../../components/ui';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';

export interface ComposerProps {
  inputContent: string;
  onChangeContent: (val: string) => void;
  selectedImage: string | null;
  onPickImage: (file: File) => void;
  onRemoveImage: () => void;
  onSend: () => void;
  sending: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  inputContent,
  onChangeContent,
  selectedImage,
  onPickImage,
  onRemoveImage,
  onSend,
  sending,
}) => {
  const { isRtl } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Reset input so re-selecting same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface-base)',
        borderTop: '1px solid var(--border-subtle)',
        padding: 'var(--sp-3) var(--sp-4)',
        gap: 'var(--sp-2)',
        flexShrink: 0,
      }}
    >
      {/* Attached image preview banner */}
      {selectedImage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            padding: 'var(--sp-2)',
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            width: 'fit-content',
          }}
        >
          <img
            src={selectedImage}
            alt="Preview"
            style={{
              width: 44,
              height: 44,
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--on-surface)' }}>
              {isRtl ? 'صورة مرفقة جاهزة للإرسال' : 'Image attachment ready'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--on-surface-subtle)' }}>
              {isRtl ? 'إيصال أو صورة توضيحية' : 'Receipt or photo proof'}
            </span>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onRemoveImage}
            icon={<X size={14} />}
            aria-label="Remove image"
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
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--sp-2)',
        }}
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
          aria-label={isRtl ? 'إرفاق صورة / إيصال' : 'Attach image / receipt'}
          title={isRtl ? 'إرفاق صورة أو إيصال تحويل' : 'Attach image or payment receipt'}
        />

        <textarea
          rows={1}
          value={inputContent}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRtl
              ? 'اكتب رداً رسمياً للمستخدم... (Enter للإرسال، Shift+Enter لسطر جديد)'
              : 'Type an official message... (Enter to send, Shift+Enter for newline)'
          }
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 120,
            padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--surface-base)',
            color: 'var(--on-surface)',
            fontSize: 'var(--font-sm)',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={sending || (!inputContent.trim() && !selectedImage)}
          icon={<Send size={15} />}
          loading={sending}
        >
          {isRtl ? 'إرسال' : 'Send'}
        </Button>
      </form>
    </div>
  );
};
