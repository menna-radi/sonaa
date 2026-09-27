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
  Button
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
  const { isRtl } = useLanguage();

  const filterTabs = [
    { value: 'all', label: isRtl ? 'الكل' : 'All' },
    { value: 'subscriptions', label: isRtl ? 'اشتراكات Bit' : 'Bit Passes' },
    { value: 'tasks', label: isRtl ? 'المهام' : 'Tasks' },
    { value: 'support', label: isRtl ? 'الدعم' : 'Support' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--surface-base)',
        borderInlineEnd: '1px solid var(--border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Search and Filter Toolbar */}
      <div
        style={{
          padding: 'var(--sp-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-3)',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={isRtl ? 'بحث بالاسم، الهاتف، أو المهمة...' : 'Search participant, phone, task...'}
        />

        <Segmented
          value={filterTab}
          onChange={(v) => onFilterTabChange(v as ChatFilterTab)}
          items={filterTabs}
        />
      </div>

      {/* Rooms List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--sp-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sp-1)',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-3)' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
                <Skeleton width={40} height={40} variant="circle" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div style={{ padding: 'var(--sp-6) var(--sp-2)' }}>
            <EmptyState
              icon={<Inbox size={32} style={{ color: 'var(--on-surface-subtle)' }} />}
              title={
                searchQuery || filterTab !== 'all'
                  ? (isRtl ? 'لا توجد محادثات مطابقة' : 'No matching conversations')
                  : (isRtl ? 'لا توجد محادثات نشطة' : 'No active conversations')
              }
              description={
                searchQuery || filterTab !== 'all'
                  ? (isRtl ? 'لم نتمكن من العثور على محادثات تطابق بحثك الحالي.' : 'No threads match your filter or search criteria.')
                  : (isRtl ? 'ستظهر محادثات العملاء والحرفيين هنا فور إرسالها.' : 'Customer and craftsman conversations will appear here automatically.')
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
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--sp-3)',
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--surface-sunken)' : 'transparent',
                  borderInlineStart: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  src={room.otherParticipant.avatarUrl}
                  name={name}
                  size={40}
                  presence="online"
                />

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontWeight: isSelected ? 600 : 500,
                        fontSize: 'var(--font-sm)',
                        color: 'var(--on-surface)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--font-xs)',
                        color: 'var(--on-surface-subtle)',
                        flexShrink: 0,
                        marginInlineStart: 'var(--sp-2)',
                      }}
                    >
                      {time}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                      {room.task ? (
                        <StatusPill
                          variant="neutral"
                          label={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Briefcase size={10} />
                              {room.task.displayId}
                            </span>
                          }
                        />
                      ) : isBitThread ? (
                        <StatusPill
                          variant="warning"
                          label={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <CreditCard size={10} />
                              Bit
                            </span>
                          }
                        />
                      ) : (
                        <StatusPill
                          variant="neutral"
                          label={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <User size={10} />
                              {room.otherParticipant.role}
                            </span>
                          }
                        />
                      )}
                    </div>

                    {room.unreadCount > 0 && (
                      <span
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--on-primary)',
                          borderRadius: 'var(--radius-pill)',
                          padding: '1px 6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '16px',
                        }}
                      >
                        {room.unreadCount}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      marginTop: 2,
                      fontSize: 'var(--font-xs)',
                      color: room.unreadCount > 0 ? 'var(--on-surface)' : 'var(--on-surface-subtle)',
                      fontWeight: room.unreadCount > 0 ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {room.lastMessage?.content ||
                      (room.lastMessage?.imageUrl ? '📷 [Image Attachment]' : (isRtl ? 'بدء المحادثة' : 'Started conversation'))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
