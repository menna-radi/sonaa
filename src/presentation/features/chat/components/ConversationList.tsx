import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatRoom } from '../../../../domain/entities/Chat';
import { ChatFilterTab } from '../hooks/useChat';
import {
  Avatar,
  SearchInput,
  Segmented,
  StatusPill,
  EmptyState,
  Skeleton,
  Button,
} from '../../../components/ui';
import { Briefcase, CreditCard, User, Inbox } from 'lucide-react';

export interface ConversationListProps {
  rooms: ChatRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterTab: ChatFilterTab;
  onFilterTabChange: (tab: ChatFilterTab) => void;
  onResetFilters: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  loading,
  searchQuery,
  onSearchChange,
  filterTab,
  onFilterTabChange,
  onResetFilters,
}) => {
  const { isRtl, t } = useLanguage();

  const filterTabs = [
    { value: 'all', label: isRtl ? 'الكل' : 'All' },
    { value: 'subscriptions', label: isRtl ? 'اشتراكات Bit' : 'Bit Passes' },
    { value: 'tasks', label: isRtl ? 'المهام' : 'Tasks' },
    { value: 'support', label: isRtl ? 'الدعم' : 'Support' },
  ];

  return (
    <div className="chat-pane-sidebar" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Search and Filter Toolbar */}
      <div className="chat-sidebar-toolbar">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('chat_search_placeholder')}
        />

        <Segmented
          value={filterTab}
          onChange={(v) => onFilterTabChange(v as ChatFilterTab)}
          items={filterTabs}
        />
      </div>

      {/* Rooms List */}
      <div className="chat-sidebar-feed">
        {loading ? (
          <div className="ui-col" style={{ gap: 'var(--sp-3)', padding: 'var(--sp-3)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="ui-row" style={{ gap: 'var(--sp-3)' }}>
                <Skeleton width={40} height={40} variant="circle" />
                <div className="ui-col" style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ padding: 'var(--sp-6) var(--sp-2)' }}>
            <EmptyState
              icon={<Inbox size={32} />}
              title={
                searchQuery || filterTab !== 'all'
                  ? (isRtl ? 'لا توجد محادثات مطابقة' : 'No matching conversations')
                  : t('chat_empty_title')
              }
              description={
                searchQuery || filterTab !== 'all'
                  ? (isRtl ? 'لم نتمكن من العثور على محادثات تطابق بحثك الحالي.' : 'No threads match your filter or search criteria.')
                  : t('chat_empty_desc')
              }
              action={
                searchQuery || filterTab !== 'all' ? (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    {isRtl ? 'إعادة ضبط الفلتر' : 'Reset Filters'}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const name = `${room.otherParticipant.firstName} ${room.otherParticipant.lastName}`.trim() || 'User';
            const time = room.lastMessage?.createdAt
              ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—';

            const isBitThread = !room.task && (
              room.lastMessage?.content?.toLowerCase().includes('subscription') ||
              room.lastMessage?.content?.toLowerCase().includes('bit') ||
              room.lastMessage?.content?.includes('₪') ||
              room.lastMessage?.content?.includes('اشتراك')
            );

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className={`chat-room-card ${isSelected ? 'chat-room-card--selected' : ''}`}
              >
                <Avatar
                  src={room.otherParticipant.avatarUrl}
                  name={name}
                  size={40}
                  presence="online"
                />

                <div className="chat-room-card__content">
                  <div className="chat-room-card__top">
                    <span className="chat-room-card__name ui-text-strong">
                      {name}
                    </span>
                    <span className="chat-room-card__time ui-num">
                      {time}
                    </span>
                  </div>

                  <div className="chat-room-card__meta">
                    <div className="chat-room-card__tags">
                      {room.task ? (
                        <StatusPill
                          variant="neutral"
                          label={
                            <span className="ui-row ui-row--tight">
                              <Briefcase size={10} />
                              {room.task.displayId}
                            </span>
                          }
                        />
                      ) : isBitThread ? (
                        <StatusPill
                          variant="warning"
                          label={
                            <span className="ui-row ui-row--tight">
                              <CreditCard size={10} />
                              Bit
                            </span>
                          }
                        />
                      ) : (
                        <StatusPill
                          variant="neutral"
                          label={
                            <span className="ui-row ui-row--tight">
                              <User size={10} />
                              {room.otherParticipant.role}
                            </span>
                          }
                        />
                      )}
                    </div>

                    {room.unreadCount > 0 && (
                      <span className="chat-room-card__unread ui-num">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className={`chat-room-card__snippet ${room.unreadCount > 0 ? 'chat-room-card__snippet--unread' : ''}`}>
                    {room.lastMessage?.content ||
                      (room.lastMessage?.imageUrl ? '📷 [Image Attachment]' : (isRtl ? 'بدء المحادثة' : 'Started conversation'))}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
