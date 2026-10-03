import React from 'react';
import { Lock, ZoomIn } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { formatDateTime } from '../../../../core/utils/format';
import type { ChatMessage } from '../../../../domain/entities/Chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isAdmin: boolean;
  senderName: string;
  onImageClick?: (url: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isAdmin,
  senderName,
  onImageClick,
}) => {
  const { t, language } = useLanguage();

  const visibility = message.visibility || 'PUBLIC';
  const isPrivate = visibility !== 'PUBLIC';

  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'ADMIN_INTERNAL':
        return t('chat_visibility_internal');
      case 'CUSTOMER_PRIVATE':
        return t('chat_visibility_customer_private');
      case 'CRAFTSMAN_PRIVATE':
        return t('chat_visibility_craftsman_private');
      default:
        return '';
    }
  };

  const bubbleClass = [
    'chat-bubble',
    isAdmin ? 'chat-bubble--admin' : 'chat-bubble--user',
    isPrivate ? 'chat-bubble--private' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={bubbleClass}>
      <div className="chat-bubble__meta">
        <span className="ui-text-strong">{senderName}</span>
        {isPrivate && (
          <span className="ui-row ui-row--tight ui-caption">
            <Lock size={12} />
            {getVisibilityLabel()}
          </span>
        )}
      </div>

      {message.imageUrl && (
        <div className="chat-bubble__media" onClick={() => onImageClick?.(message.imageUrl!)}>
          <img
            src={message.imageUrl}
            alt={t('chat_attachment') || 'Attachment'}
            className="chat-bubble__img"
          />
          <div className="chat-bubble__zoom">
            <ZoomIn size={14} />
          </div>
        </div>
      )}

      {message.content && (
        <span className="chat-bubble__text">
          {message.content}
        </span>
      )}

      <span className="chat-bubble__time ui-caption ui-num">
        {formatDateTime(message.createdAt, language)}
      </span>
    </div>
  );
};
