import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useChat } from '../hooks/useChat';
import {
  PageHeader,
  Button,
  StatusPill,
  EmptyState,
  useBreakpoint,
} from '../../../components/ui';
import { ImageLightbox } from '../../verification/components/ImageLightbox';
import { ConversationList } from '../components/ConversationList';
import { ThreadHeader } from '../components/ThreadHeader';
import { MessageList } from '../components/MessageList';
import { Composer } from '../components/Composer';
import { QuickTemplates } from '../components/QuickTemplates';
import { NewMessageModal } from '../components/NewMessageModal';
import {
  MessageSquare,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  CreditCard,
  Radio,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const { isMobile } = useBreakpoint();

  const {
    rooms,
    selectedRoomId,
    selectedRoom,
    messages,
    loadingRooms,
    loadingMessages,
    sending,
    searchQuery,
    setSearchQuery,
    filterTab,
    setFilterTab,
    isConnected,
    selectRoom,
    sendMessage,
    startNewChat,
    searchUsers,
    refreshRooms,
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewLightboxImg, setPreviewLightboxImg] = useState<string | null>(null);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  const handleStartChat = async (targetUser: any) => {
    const roomId = await startNewChat(targetUser.id);
    if (roomId) {
      setNewChatModalOpen(false);
    }
  };

  const handlePickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!inputContent.trim() && !selectedImage) return;
    const success = await sendMessage(inputContent, selectedImage || undefined);
    if (success) {
      setInputContent('');
      setSelectedImage(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 72px)',
        padding: 'var(--sp-4)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        gap: 'var(--sp-3)',
      }}
    >
      {/* Page Header */}
      <PageHeader
        title={isRtl ? 'مركز المحادثات والدعم المباشر' : 'Live Support & Communications'}
        subtitle={
          isRtl
            ? 'متابعة المحادثات المباشرة مع الحرفيين والعملاء وفحص إيصالات الدفع'
            : 'Manage active customer & craftsman communications, task discussions, and Bit verification threads.'
        }
        meta={
          <StatusPill
            variant={isConnected ? 'success' : 'neutral'}
            dot
            pulse={isConnected}
            label={
              isConnected
                ? (isRtl ? 'متصل بالبث المباشر' : 'Real-time WebSocket')
                : (isRtl ? 'إعادة الاتصال...' : 'Reconnecting...')
            }
          />
        }
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshRooms()}
              icon={<RefreshCw size={14} />}
            >
              {isRtl ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNewChatModalOpen(true)}
              icon={<UserPlus size={14} />}
            >
              {isRtl ? 'رسالة جديدة' : 'New Message'}
            </Button>
          </div>
        }
      />

      {/* Dual-Pane Workspace */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          background: 'var(--surface-base)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xs)',
          minHeight: 0,
        }}
      >
        {/* Left Pane: Conversation List */}
        {(!isMobile || !selectedRoomId) && (
          <div
            style={{
              width: isMobile ? '100%' : '360px',
              minWidth: isMobile ? '100%' : '320px',
              maxWidth: isMobile ? '100%' : '420px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            <ConversationList
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={selectRoom}
              loading={loadingRooms}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterTab={filterTab}
              onFilterTabChange={setFilterTab}
              onResetFilters={() => {
                setSearchQuery('');
                setFilterTab('all');
              }}
            />
          </div>
        )}

        {/* Right Pane: Thread or No-Selected State */}
        {(!isMobile || Boolean(selectedRoomId)) && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minWidth: 0,
              background: 'var(--surface-base)',
            }}
          >
            {selectedRoom ? (
              <>
                <ThreadHeader
                  room={selectedRoom}
                  showBackButton={isMobile}
                  onBack={() => selectRoom('')}
                  onViewTask={() => navigate('tasks')}
                  onViewProfile={() => navigate('craftsmen')}
                />

                <MessageList
                  messages={messages}
                  loading={loadingMessages}
                  otherParticipant={selectedRoom.otherParticipant}
                  onImageClick={(url) => setPreviewLightboxImg(url)}
                  onParticipantClick={() => {
                    if (selectedRoom.otherParticipant.role === 'CRAFTSMAN') {
                      navigate('craftsmen');
                    } else if (selectedRoom.task) {
                      navigate('tasks');
                    }
                  }}
                />

                <QuickTemplates
                  onSelectTemplate={(text) => {
                    setInputContent((prev) => (prev ? `${prev} ${text}` : text));
                  }}
                />

                <Composer
                  inputContent={inputContent}
                  onChangeContent={setInputContent}
                  selectedImage={selectedImage}
                  onPickImage={handlePickImage}
                  onRemoveImage={() => setSelectedImage(null)}
                  onSend={handleSend}
                  sending={sending}
                />
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--sp-6)',
                }}
              >
                <div
                  style={{
                    maxWidth: 420,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--sp-3)',
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--surface-sunken)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--on-surface-subtle)',
                    }}
                  >
                    <MessageSquare size={28} />
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-lg)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}
                  >
                    {isRtl ? 'مركز المحادثات والدعم الإداري' : 'Direct Support & Communication Hub'}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 'var(--font-sm)',
                      color: 'var(--on-surface-subtle)',
                      lineHeight: 'var(--line-height-normal)',
                    }}
                  >
                    {isRtl
                      ? 'اختر محادثة من القائمة الجانبية لعرض الرسائل المباشرة، فحص إيصالات Bit، وتقديم الدعم الفوري للحرفيين والعملاء.'
                      : 'Select a conversation from the sidebar to inspect participant threads, review payment attachments, or dispatch official administrative responses.'}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--sp-2)',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginTop: 'var(--sp-2)',
                    }}
                  >
                    <StatusPill
                      variant="success"
                      dot
                      label={isRtl ? 'مزامنة فورية' : 'Live WebSocket Sync'}
                    />
                    <StatusPill
                      variant="info"
                      label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={11} />
                          {isRtl ? 'سجل رقابي مدقق' : 'Audit Trail Logged'}
                        </span>
                      }
                    />
                    <StatusPill
                      variant="warning"
                      label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <CreditCard size={11} />
                          {isRtl ? 'فحص إيصالات Bit' : 'Bit Slip Verification'}
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Zoom for Receipt / Photos */}
      <ImageLightbox
        url={previewLightboxImg}
        onClose={() => setPreviewLightboxImg(null)}
        title={isRtl ? 'فحص الإيصال / المرفق' : 'Attachment & Receipt Inspector'}
      />

      {/* Start New Chat Modal */}
      <NewMessageModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSelectUser={handleStartChat}
        searchUsers={searchUsers}
      />
    </div>
  );
};

export default ChatPage;
