import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatMessage, ChatParticipant } from '../../../../domain/entities/Chat';
import { Avatar, StatusPill, EmptyState, Skeleton } from '../../../components/ui';
import { MessageSquare, CheckCheck, ZoomIn } from 'lucide-react';

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
  onParticipantClick,
}) => {
  const { isRtl } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-4)',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
          <Skeleton width={32} height={32} variant="circle" />
          <Skeleton width="45%" height={60} borderRadius="var(--radius-md)" />
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start', alignSelf: 'flex-end', width: '50%' }}>
          <Skeleton width="100%" height={80} borderRadius="var(--radius-md)" />
        </div>
        <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start' }}>
          <Skeleton width={32} height={32} variant="circle" />
          <Skeleton width="35%" height={50} borderRadius="var(--radius-md)" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--sp-6)',
        }}
      >
        <EmptyState
          icon={<MessageSquare size={36} style={{ color: 'var(--on-surface-subtle)' }} />}
          title={isRtl ? 'لا توجد رسائل سابقة في هذه المحادثة' : 'No messages yet in this conversation'}
          description={isRtl ? 'ابدأ المحادثة بإرسال رسالة رسمية أدناه.' : 'Send an official administrative reply below.'}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
      }}
    >
      {messages.map((msg, index) => {
        const isAdmin = msg.senderRole === 'ADMIN' || msg.senderId === 'admin';
        const isInternal =
          (msg as any).visibility === 'ADMIN_INTERNAL' ||
          msg.content?.startsWith('[INTERNAL') ||
          msg.messageType === 'INTERNAL_NOTE';

        const time = msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';

        const senderName =
          msg.senderName ||
          (isAdmin ? 'Sonaa Admin' : `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim() || 'User');
        const senderAvatar = msg.senderAvatar || (!isAdmin ? otherParticipant.avatarUrl : null);

        // Internal note bubble styling
        if (isInternal) {
          return (
            <div
              key={msg.id || index}
              style={{
                alignSelf: 'center',
                maxWidth: '85%',
                width: '100%',
                background: 'var(--warning-soft)',
                border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--sp-3) var(--sp-4)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                <StatusPill variant="warning" label={isRtl ? 'ملاحظة إدارية داخلية' : 'Internal Note'} />
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>{time}</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-sm)',
                  color: 'var(--on-surface)',
                  lineHeight: 'var(--line-height-normal)',
                  whiteSpace: 'pre-line',
                }}
              >
                {msg.content}
              </p>
            </div>
          );
        }

        // Admin bubble styling: surface-inverse with on-inverse text
        if (isAdmin) {
          return (
            <div
              key={msg.id || index}
              style={{
                alignSelf: isRtl ? 'flex-start' : 'flex-end',
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isRtl ? 'flex-start' : 'flex-end',
                gap: 4,
              }}
            >
              <div
                style={{
                  background: 'var(--surface-inverse)',
                  color: 'var(--on-inverse)',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomRightRadius: isRtl ? 'var(--radius-lg)' : 2,
                  borderBottomLeftRadius: isRtl ? 2 : 'var(--radius-lg)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  boxShadow: 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                }}
              >
                {msg.imageUrl && (
                  <div
                    onClick={() => onImageClick(msg.imageUrl!)}
                    style={{
                      cursor: 'zoom-in',
                      marginBottom: msg.content ? 'var(--sp-2)' : 0,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 280,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        gap: 4,
                        fontSize: 'var(--font-xs)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <ZoomIn size={14} />
                      <span>{isRtl ? 'تكبير' : 'Zoom'}</span>
                    </div>
                  </div>
                )}

                {msg.content && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-sm)',
                      lineHeight: 'var(--line-height-normal)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.content}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      opacity: 0.75,
                    }}
                  >
                    {time}
                  </span>
                  <CheckCheck size={14} style={{ color: 'var(--primary-light, #60a5fa)' }} />
                </div>
              </div>
            </div>
          );
        }

        // Participant bubble styling: surface-sunken with on-surface text
        return (
          <div
            key={msg.id || index}
            style={{
              alignSelf: isRtl ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              display: 'flex',
              gap: 'var(--sp-2)',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{ cursor: onParticipantClick ? 'pointer' : 'default', flexShrink: 0 }}
              onClick={onParticipantClick}
            >
              <Avatar
                src={senderAvatar}
                name={senderName}
                size={32}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <span
                  style={{
                    fontSize: 'var(--font-xs)',
                    fontWeight: 600,
                    color: 'var(--on-surface-subtle)',
                  }}
                >
                  {senderName}
                </span>
                {otherParticipant.role === 'CRAFTSMAN' && (
                  <span
                    style={{
                      fontSize: '10px',
                      color: 'var(--primary)',
                      fontWeight: 600,
                    }}
                  >
                    {isRtl ? 'حرفي' : 'Craftsman'}
                  </span>
                )}
              </div>

              <div
                style={{
                  background: 'var(--surface-sunken)',
                  color: 'var(--on-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  borderBottomLeftRadius: isRtl ? 'var(--radius-lg)' : 2,
                  borderBottomRightRadius: isRtl ? 2 : 'var(--radius-lg)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  boxShadow: 'var(--shadow-sm)',
                  wordBreak: 'break-word',
                }}
              >
                {msg.imageUrl && (
                  <div
                    onClick={() => onImageClick(msg.imageUrl!)}
                    style={{
                      cursor: 'zoom-in',
                      marginBottom: msg.content ? 'var(--sp-2)' : 0,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 280,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        opacity: 0,
                        transition: 'opacity var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        gap: 4,
                        fontSize: 'var(--font-xs)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <ZoomIn size={14} />
                      <span>{isRtl ? 'فحص الإيصال / الصورة' : 'Inspect image'}</span>
                    </div>
                  </div>
                )}

                {msg.content && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-sm)',
                      lineHeight: 'var(--line-height-normal)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {msg.content}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--on-surface-subtle)',
                    }}
                  >
                    {time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
