import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatRoom } from '../../../../domain/entities/Chat';
import { Avatar, Button, IconButton, StatusPill } from '../../../components/ui';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  Briefcase,
  ExternalLink,
  Shield,
} from 'lucide-react';

export interface ThreadHeaderProps {
  room: ChatRoom;
  onBack?: () => void;
  showBackButton?: boolean;
  onViewTask?: () => void;
  onViewProfile?: () => void;
}

export const ThreadHeader: React.FC<ThreadHeaderProps> = ({
  room,
  onBack,
  showBackButton,
  onViewTask,
  onViewProfile,
}) => {
  const { isRtl } = useLanguage();
  const participant = room.otherParticipant;
  const name = `${participant.firstName} ${participant.lastName}`.trim() || 'User';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--sp-3) var(--sp-4)',
        background: 'var(--surface-base)',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: 64,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
        {showBackButton && onBack && (
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            aria-label={isRtl ? 'رجوع للمحادثات' : 'Back to conversations'}
          />
        )}

        <Avatar
          src={participant.avatarUrl}
          name={name}
          size={40}
          presence="online"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'var(--font-md)',
                fontWeight: 600,
                color: 'var(--on-surface)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </h2>
            <StatusPill
              variant={participant.role === 'CRAFTSMAN' ? 'info' : 'neutral'}
              label={participant.role === 'CRAFTSMAN' ? (isRtl ? 'حرفي' : 'Craftsman') : (isRtl ? 'عميل' : 'Customer')}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-3)',
              fontSize: 'var(--font-xs)',
              color: 'var(--on-surface-subtle)',
              flexWrap: 'wrap',
            }}
          >
            {participant.phoneNumber && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={12} />
                <span>{participant.phoneNumber}</span>
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} />
              <span>{isRtl ? 'القدس' : 'Jerusalem'}</span>
            </span>
            {room.task && (
              <button
                type="button"
                onClick={onViewTask}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1px 6px',
                  color: 'var(--on-surface)',
                  fontSize: 'var(--font-xs)',
                  cursor: 'pointer',
                }}
              >
                <Briefcase size={12} />
                <span>{room.task.title || room.task.displayId}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexShrink: 0 }}>
        {room.task && onViewTask && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewTask}
            icon={<ExternalLink size={14} />}
          >
            {isRtl ? 'المهمة' : 'View Task'}
          </Button>
        )}
        {participant.role === 'CRAFTSMAN' && onViewProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            icon={<Shield size={14} />}
          >
            {isRtl ? 'ملف الحرفي' : 'Profile'}
          </Button>
        )}
      </div>
    </div>
  );
};
