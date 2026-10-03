import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatMessage, ChatParticipant } from '../../../../domain/entities/Chat';
import { EmptyState, Skeleton } from '../../../components/ui';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  otherParticipant: ChatParticipant;
  onImageClick: (url: string) => void;
  onParticipantClick?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  otherParticipant,
  onImageClick,
}) => {
  const { t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (loading) {
    return (
      <div className="chat-thread__messages">
        <Skeleton width="45%" height={60} borderRadius="var(--radius-md)" />
        <Skeleton width="50%" height={80} borderRadius="var(--radius-md)" style={{ alignSelf: 'flex-end' }} />
        <Skeleton width="35%" height={50} borderRadius="var(--radius-md)" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="ui-center" style={{ flex: 1, padding: 'var(--sp-6)' }}>
        <EmptyState
          icon={<MessageSquare size={36} className="ui-text-muted" />}
          title={t('chat_empty_title')}
          description={t('chat_empty_desc')}
        />
      </div>
    );
  }

  return (
    <div className="chat-thread__messages">
      {messages.map((msg) => {
        const isAdmin = msg.senderRole === 'ADMIN' || msg.senderId === 'admin';
        const senderName =
          msg.senderName ||
          (isAdmin ? 'Sonaa Admin' : `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim() || 'User');

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isAdmin={isAdmin}
            senderName={senderName}
            onImageClick={onImageClick}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
export default MessageList;
