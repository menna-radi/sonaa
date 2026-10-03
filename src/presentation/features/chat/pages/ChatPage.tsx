import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useChat } from '../hooks/useChat';
import {
  PageHeader,
  Button,
  StatusPill,
  useBreakpoint,
} from '../../../components/ui';
import { ImageLightbox } from '../../verification/components/ImageLightbox';
import { ConversationList } from '../components/ConversationList';
import { ThreadHeader } from '../components/ThreadHeader';
import { MessageList } from '../components/MessageList';
import { Composer, ChatVisibility } from '../components/Composer';
import { QuickTemplates } from '../components/QuickTemplates';
import { NewMessageModal } from '../components/NewMessageModal';
import { ChatSearchUser } from '../../../../domain/entities/Chat';
import {
  MessageSquare,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import '../chat.css';

export const ChatPage: React.FC = () => {
  const { isRtl, t } = useLanguage();
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
  const [visibility, setVisibility] = useState<ChatVisibility>('PUBLIC');

  const handleStartChat = async (targetUser: ChatSearchUser) => {
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
    const success = await sendMessage(inputContent, selectedImage || undefined, visibility);
    if (success) {
      setInputContent('');
      setSelectedImage(null);
    }
  };

  return (
    <div className="chat-page">
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
          <div className="chat-header-actions">
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
      <div className="chat-workspace">
        {/* Left Pane: Conversation List */}
        {(!isMobile || !selectedRoomId) && (
          <div className={isMobile ? 'chat-pane-sidebar chat-pane-sidebar--mobile' : 'chat-pane-sidebar'}>
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
          <div className="chat-pane-thread">
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
                  visibility={visibility}
                  onChangeVisibility={setVisibility}
                />
              </>
            ) : (
              <div className="chat-empty-hub">
                <div className="chat-empty-hub__card">
                  <div className="chat-empty-hub__icon">
                    <MessageSquare size={28} />
                  </div>

                  <h3 className="chat-empty-hub__title">
                    {t('chat_title')}
                  </h3>

                  <p className="chat-empty-hub__desc">
                    {t('chat_subtitle')}
                  </p>

                  <div className="chat-empty-hub__pills">
                    <StatusPill
                      variant="success"
                      dot
                      label={isRtl ? 'مزامنة فورية' : 'Live WebSocket Sync'}
                    />
                    <StatusPill
                      variant="info"
                      label={
                        <span className="ui-row ui-row--tight">
                          <ShieldCheck size={11} />
                          {isRtl ? 'سجل رقابي مدقق' : 'Audit Trail Logged'}
                        </span>
                      }
                    />
                    <StatusPill
                      variant="warning"
                      label={
                        <span className="ui-row ui-row--tight">
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
