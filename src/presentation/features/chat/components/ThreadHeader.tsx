import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatRoom } from '../../../../domain/entities/Chat';
import { Avatar, Button, IconButton, StatusPill } from '../../../components/ui';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
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
    <div className="chat-thread-header">
      <div className="chat-thread-header__main">
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

        <div className="chat-thread-header__details">
          <div className="chat-thread-header__row">
            <h2 className="chat-thread-header__name">
              {name}
            </h2>
            <StatusPill
              variant={participant.role === 'CRAFTSMAN' ? 'info' : 'neutral'}
              label={participant.role === 'CRAFTSMAN' ? (isRtl ? 'حرفي' : 'Craftsman') : (isRtl ? 'عميل' : 'Customer')}
            />
          </div>

          <div className="chat-thread-header__meta">
            {participant.phoneNumber && (
              <span className="ui-row ui-row--tight">
                <Phone size={12} />
                <span>{participant.phoneNumber}</span>
              </span>
            )}
            {participant.trade && (
              <span className="ui-row ui-row--tight">
                <Briefcase size={12} />
                <span>{participant.trade}</span>
              </span>
            )}
            {room.task && (
              <button
                type="button"
                onClick={onViewTask}
                className="chat-thread-header__task-btn"
              >
                <Briefcase size={12} />
                <span>{room.task.title || room.task.displayId}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="chat-thread-header__actions">
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
