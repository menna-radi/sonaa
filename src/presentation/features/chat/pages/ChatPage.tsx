import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { Sidebar } from '../../../../presentation/layouts/Sidebar';
import { Header } from '../../../../presentation/layouts/Header';
import { MobileBottomTabs } from '../../../../presentation/layouts/MobileBottomTabs';
import { useChat, ChatFilterTab } from '../hooks/useChat';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  User,
  Shield,
  Briefcase,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { navigate } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    rooms,
    allRoomsCount,
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
    error,
    selectRoom,
    sendMessage,
    refreshRooms
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() && !selectedImage) return;

    const success = await sendMessage(inputContent, selectedImage || undefined);
    if (success) {
      setInputContent('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const QUICK_TEMPLATES = [
    { label: 'Bit Proof Received', text: 'Hello! We received your Bit payment submission. Our finance team is reviewing the transaction details now.' },
    { label: 'Subscription Approved', text: '🎉 Your subscription pass has been verified and activated! You now have full access to accept customer orders in Jerusalem and the West Bank.' },
    { label: 'Request Better Screenshot', text: 'Could you please upload a clearer screenshot showing the Bit reference number and timestamp?' },
    { label: 'Dispute Investigation', text: 'Thank you for reaching out. We are currently investigating this order details and will update you shortly.' }
  ];

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className="main-content chat-page-main">
        {/* Top Header Bar */}
        <div className="chat-top-bar">
          <div className="chat-title-group">
            <div className="chat-title-icon">
              <MessageSquare size={22} color="var(--color-primary)" />
            </div>
            <div>
              <div className="chat-title-row">
                <h1 className="chat-page-title">{isRtl ? 'مركز المحادثات والدعم المباشر' : 'Live Support & Communications'}</h1>
                <span className={`ws-badge ${isConnected ? 'online' : 'offline'}`}>
                  {isConnected ? (
                    <>
                      <span className="live-dot" />
                      <Wifi size={13} /> {isRtl ? 'متصل بالبث المباشر' : 'Real-time WebSocket'}
                    </>
                  ) : (
                    <>
                      <WifiOff size={13} /> {isRtl ? 'إعادة الاتصال...' : 'Reconnecting...'}
                    </>
                  )}
                </span>
              </div>
              <p className="chat-page-subtitle">
                {isRtl
                  ? 'متابعة المحادثات المباشرة مع الحرفيين والعملاء والتحقق من إيصالات الدفع'
                  : 'Manage active customer & craftsman communications, task discussions, and Bit verification threads.'}
              </p>
            </div>
          </div>

          <div className="chat-top-actions">
            <button className="btn-chat-refresh" onClick={() => refreshRooms()} title="Refresh Rooms">
              <RefreshCw size={15} />
              <span>{isRtl ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Dual-Pane Chat Layout */}
        <div className="chat-workspace-container">
          {/* Left Pane: Conversation List */}
          <div className="chat-sidebar-pane">
            {/* Search Bar */}
            <div className="chat-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder={isRtl ? 'بحث بالاسم، الهاتف، أو المهمة...' : 'Search participant, phone, task...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="chat-search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="chat-filter-tabs">
              {(['all', 'subscriptions', 'tasks', 'support'] as ChatFilterTab[]).map(tab => {
                const labels: Record<ChatFilterTab, { en: string; ar: string }> = {
                  all: { en: 'All', ar: 'الكل' },
                  subscriptions: { en: 'Bit Passes', ar: 'اشتراكات Bit' },
                  tasks: { en: 'Tasks', ar: 'المهام' },
                  support: { en: 'Support', ar: 'الدعم' },
                };
                return (
                  <button
                    key={tab}
                    className={`chat-filter-btn ${filterTab === tab ? 'active' : ''}`}
                    onClick={() => setFilterTab(tab)}
                  >
                    {isRtl ? labels[tab].ar : labels[tab].en}
                  </button>
                );
              })}
            </div>

            {/* Rooms List Feed */}
            <div className="chat-rooms-list">
              {loadingRooms ? (
                <div className="chat-loading-state">
                  <div className="mini-spinner" />
                  <span>{isRtl ? 'جاري تحميل المحادثات...' : 'Loading conversations...'}</span>
                </div>
              ) : rooms.length === 0 ? (
                <div className="chat-empty-state">
                  <MessageSquare size={32} opacity={0.3} />
                  <p>{isRtl ? 'لا توجد محادثات مطابقة' : 'No conversations found'}</p>
                </div>
              ) : (
                rooms.map(room => {
                  const isSelected = room.id === selectedRoomId;
                  const name = `${room.otherParticipant.firstName} ${room.otherParticipant.lastName}`.trim() || 'User';
                  const initials = name.slice(0, 2).toUpperCase();
                  const time = room.lastMessage?.createdAt
                    ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—';

                  const isBitThread = !room.task && (
                    room.lastMessage?.content?.toLowerCase().includes('subscription') ||
                    room.lastMessage?.content?.toLowerCase().includes('bit') ||
                    room.lastMessage?.content?.includes('₪')
                  );

                  return (
                    <div
                      key={room.id}
                      className={`chat-room-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectRoom(room.id)}
                    >
                      <div className="room-avatar-wrap">
                        {room.otherParticipant.avatarUrl ? (
                          <img src={room.otherParticipant.avatarUrl} alt={name} className="room-avatar-img" />
                        ) : (
                          <div className="room-avatar-initials">{initials}</div>
                        )}
                        <span className="room-status-indicator online" />
                      </div>

                      <div className="room-info-wrap">
                        <div className="room-header-row">
                          <span className="room-participant-name">{name}</span>
                          <span className="room-time">{time}</span>
                        </div>

                        <div className="room-sub-row">
                          {room.task ? (
                            <span className="room-tag task-tag">
                              <Briefcase size={10} /> {room.task.displayId}
                            </span>
                          ) : isBitThread ? (
                            <span className="room-tag bit-tag">
                              <CreditCard size={10} /> Bit Verification
                            </span>
                          ) : (
                            <span className="room-tag role-tag">
                              <User size={10} /> {room.otherParticipant.role}
                            </span>
                          )}

                          {room.unreadCount > 0 && (
                            <span className="room-unread-badge">{room.unreadCount}</span>
                          )}
                        </div>

                        <div className="room-last-msg-row">
                          <p className="room-last-msg-text">
                            {room.lastMessage?.content || (room.lastMessage?.imageUrl ? '📷 [Image Attachment]' : 'Started conversation')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Active Conversation Feed & Message Center */}
          <div className="chat-thread-pane">
            {selectedRoom ? (
              <>
                {/* Thread Header */}
                <div className="thread-header">
                  <div className="thread-user-info">
                    <button
                      className="btn-chat-mobile-back"
                      onClick={() => selectRoom('')}
                      title="Back to Conversations"
                    >
                      {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                    </button>
                    <div
                      className="thread-avatar clickable-user"
                      onClick={() => {
                        if (selectedRoom.otherParticipant.role === 'CRAFTSMAN') {
                          navigate('craftsmen');
                        } else if (selectedRoom.task) {
                          navigate('tasks');
                        }
                      }}
                      title={selectedRoom.otherParticipant.role === 'CRAFTSMAN' ? 'View Craftsman in Management' : 'View User Details'}
                    >
                      {selectedRoom.otherParticipant.avatarUrl ? (
                        <img src={selectedRoom.otherParticipant.avatarUrl} alt="" className="thread-avatar-img" />
                      ) : (
                        <div className="thread-avatar-initials">
                          {selectedRoom.otherParticipant.firstName.slice(0, 1)}
                          {selectedRoom.otherParticipant.lastName.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="thread-name-row">
                        <h3
                          className="clickable-user-title"
                          onClick={() => {
                            if (selectedRoom.otherParticipant.role === 'CRAFTSMAN') {
                              navigate('craftsmen');
                            } else if (selectedRoom.task) {
                              navigate('tasks');
                            }
                          }}
                          title="Click to view details"
                        >
                          {selectedRoom.otherParticipant.firstName} {selectedRoom.otherParticipant.lastName}
                        </h3>
                        <span className="thread-role-badge">{selectedRoom.otherParticipant.role}</span>
                      </div>
                      <div className="thread-meta-row">
                        {selectedRoom.otherParticipant.phoneNumber && (
                          <span className="thread-meta-item">
                            <Phone size={12} /> {selectedRoom.otherParticipant.phoneNumber}
                          </span>
                        )}
                        <span className="thread-meta-item">
                          <MapPin size={12} /> Jerusalem (القدس)
                        </span>
                        {selectedRoom.task && (
                          <span 
                            className="thread-meta-item task-meta clickable-task-pill"
                            onClick={() => navigate('tasks')}
                            title="Go to Task"
                          >
                            <Briefcase size={12} /> {selectedRoom.task.title} ({selectedRoom.task.displayId})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="thread-header-actions">
                    {selectedRoom.task && (
                      <button
                        className="btn-thread-action"
                        onClick={() => navigate('tasks')}
                        title="View Task Details"
                      >
                        <ExternalLink size={14} />
                        <span>{isRtl ? 'تفاصيل المهمة' : 'View Task'}</span>
                      </button>
                    )}
                    {selectedRoom.otherParticipant.role === 'CRAFTSMAN' && (
                      <button
                        className="btn-thread-action"
                        onClick={() => navigate('craftsmen')}
                        title="View Craftsman Profile"
                      >
                        <Shield size={14} />
                        <span>{isRtl ? 'ملف الحرفي' : 'Craftsman Profile'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="thread-messages-feed">
                  {loadingMessages ? (
                    <div className="chat-feed-loading">
                      <div className="mini-spinner" />
                      <span>{isRtl ? 'جاري تحميل الرسائل...' : 'Loading message history...'}</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="chat-feed-empty">
                      <MessageSquare size={36} opacity={0.2} />
                      <p>{isRtl ? 'لا توجد رسائل سابقة في هذه المحادثة' : 'No messages yet in this conversation.'}</p>
                      <span>{isRtl ? 'ابدأ المحادثة بإرسال رسالة أدناه' : 'Send an official administrative reply below.'}</span>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isAdmin = msg.senderRole === 'ADMIN' || msg.senderId === 'admin';
                      const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const senderName = msg.senderName || (!isAdmin ? `${selectedRoom.otherParticipant.firstName} ${selectedRoom.otherParticipant.lastName}`.trim() : 'Sonaa Admin');
                      const senderAvatar = msg.senderAvatar || (!isAdmin ? selectedRoom.otherParticipant.avatarUrl : null);
                      const isCraftsmanSender = msg.senderRole === 'CRAFTSMAN' || (!isAdmin && selectedRoom.otherParticipant.role === 'CRAFTSMAN');

                      return (
                        <div key={msg.id || index} className={`chat-bubble-wrap ${isAdmin ? 'admin-bubble' : 'user-bubble'}`}>
                          {!isAdmin && (
                            <div 
                              className={`bubble-sender-title ${isCraftsmanSender ? 'clickable-sender' : ''}`}
                              onClick={() => {
                                if (isCraftsmanSender) {
                                  navigate('craftsmen');
                                } else if (selectedRoom.task) {
                                  navigate('tasks');
                                }
                              }}
                              title={isCraftsmanSender ? 'View Craftsman in Management' : undefined}
                            >
                              {senderAvatar ? (
                                <img src={senderAvatar} alt="" className="bubble-sender-avatar-img" />
                              ) : (
                                <div className="bubble-sender-avatar-mini">
                                  {senderName.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <span className="sender-display-name">{senderName}</span>
                              {isCraftsmanSender && <span className="sender-role-tag">Craftsman ↗</span>}
                            </div>
                          )}

                          <div className="bubble-content-card">
                            {msg.imageUrl && (
                              <div className="bubble-image-wrap" onClick={() => setPreviewModalImg(msg.imageUrl || null)}>
                                <img src={msg.imageUrl} alt="Attachment" className="bubble-img" />
                                <div className="img-zoom-hint">
                                  <span>🔍 Click to inspect receipt</span>
                                </div>
                              </div>
                            )}

                            {msg.content && (
                              <p className="bubble-text" style={{ whiteSpace: 'pre-line' }}>{msg.content}</p>
                            )}

                            <div className="bubble-footer">
                              <span className="bubble-time">{time}</span>
                              {isAdmin && (
                                <span className="bubble-checkmarks" title="Delivered to user">
                                  <CheckCheck size={14} color="#60a5fa" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image attachment preview banner */}
                {selectedImage && (
                  <div className="attached-img-preview-bar">
                    <img src={selectedImage} alt="Attachment Preview" className="attached-thumbnail" />
                    <span className="attached-info">Image attachment ready to send</span>
                    <button className="remove-attached-btn" onClick={() => setSelectedImage(null)}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Quick Templates Bar */}
                <div className="quick-templates-bar">
                  <div className="template-label">
                    <Sparkles size={13} color="var(--color-primary)" />
                    <span>{isRtl ? 'ردود سريعة جاهزة:' : 'Quick Admin Templates:'}</span>
                  </div>
                  <div className="template-chips">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        className="template-chip"
                        onClick={() => setInputContent(tmpl.text)}
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Composer */}
                <form className="thread-composer" onSubmit={handleSend}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImagePick}
                  />
                  <button
                    type="button"
                    className="composer-btn-attach"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Image / Receipt"
                  >
                    <Paperclip size={18} />
                  </button>

                  <textarea
                    className="composer-textarea"
                    placeholder={isRtl ? 'اكتب رداً رسمياً للمستخدم... (اضغط Enter للإرسال)' : 'Type an official administrative message... (Enter to send, Shift+Enter for newline)'}
                    value={inputContent}
                    onChange={e => setInputContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />

                  <button
                    type="submit"
                    className="composer-btn-send"
                    disabled={sending || (!inputContent.trim() && !selectedImage)}
                  >
                    {sending ? <div className="btn-spinner" /> : <Send size={16} />}
                    <span>{isRtl ? 'إرسال' : 'Send'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="no-room-selected-state">
                <MessageSquare size={48} opacity={0.2} />
                <h3>{isRtl ? 'اختر محادثة من القائمة' : 'Select a conversation to start chatting'}</h3>
                <p>
                  {isRtl
                    ? 'يمكنك الرد على استفسارات الحرفيين، مراجعة إيصالات Bit، وتقديم الدعم الفوري'
                    : 'Real-time administrative control over all participant threads, customer queries, and Bit payment proofs.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox Zoom Modal for Receipt / Images */}
        {previewModalImg && (
          <div className="img-lightbox-overlay" onClick={() => setPreviewModalImg(null)}>
            <div className="img-lightbox-content" onClick={e => e.stopPropagation()}>
              <div className="lightbox-header">
                <span>Proof & Attachment Inspector</span>
                <button className="lightbox-close-btn" onClick={() => setPreviewModalImg(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="lightbox-body">
                <img src={previewModalImg} alt="Proof Large" className="lightbox-full-img" />
              </div>
            </div>
          </div>
        )}

        <MobileBottomTabs />
      </main>

      <style>{`
        .chat-page-main {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 65px);
          padding: 20px 24px;
          gap: 16px;
          box-sizing: border-box;
          background: var(--bg-base);
          overflow: hidden;
        }

        .chat-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .chat-title-group {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .chat-title-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-page-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .chat-page-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin: 3px 0 0 0;
        }

        .ws-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
        }

        .ws-badge.online {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .ws-badge.offline {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          animation: pulse 1.8s infinite;
        }

        .btn-chat-refresh {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 8px;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-chat-refresh:hover {
          background: var(--bg-hover);
          border-color: var(--color-primary);
        }

        /* Workspace Grid */
        .chat-workspace-container {
          display: flex;
          flex: 1;
          min-height: 0;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        /* Sidebar Pane (Rooms) */
        .chat-sidebar-pane {
          width: 360px;
          border-inline-end: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .chat-search-wrap {
          display: flex;
          align-items: center;
          position: relative;
          padding: 14px 14px 10px 14px;
        }

        .search-icon {
          position: absolute;
          left: 26px;
          color: var(--text-muted);
          pointer-events: none;
        }

        [dir="rtl"] .search-icon {
          left: auto;
          right: 26px;
        }

        .chat-search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        [dir="rtl"] .chat-search-input {
          padding: 8px 36px 8px 12px;
        }

        .chat-search-input:focus {
          border-color: var(--color-primary);
        }

        .clear-search-btn {
          position: absolute;
          right: 24px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        [dir="rtl"] .clear-search-btn {
          right: auto;
          left: 24px;
        }

        .chat-filter-tabs {
          display: flex;
          padding: 0 14px 12px 14px;
          gap: 6px;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .chat-filter-btn {
          padding: 5px 11px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .chat-filter-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .chat-filter-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          font-weight: 600;
        }

        .chat-rooms-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .chat-room-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .chat-room-card:hover {
          background: var(--bg-hover);
        }

        .chat-room-card.selected {
          background: rgba(37, 99, 235, 0.08);
          border-inline-start: 3px solid var(--color-primary);
        }

        .room-avatar-wrap {
          position: relative;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
        }

        .room-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .room-avatar-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .room-status-indicator {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 2px solid var(--bg-surface);
        }

        .room-status-indicator.online {
          background: #10b981;
        }

        .room-info-wrap {
          flex: 1;
          min-width: 0;
        }

        .room-header-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 2px;
        }

        .room-participant-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .room-time {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .room-sub-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .room-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .room-tag.task-tag {
          background: rgba(14, 165, 233, 0.12);
          color: #0ea5e9;
        }

        .room-tag.bit-tag {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .room-tag.role-tag {
          background: rgba(148, 163, 184, 0.12);
          color: var(--text-muted);
        }

        .room-unread-badge {
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 10px;
        }

        .room-last-msg-row {
          overflow: hidden;
        }

        .room-last-msg-text {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Thread Pane */
        .chat-thread-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          min-width: 0;
        }

        .thread-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .thread-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .thread-avatar {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }

        .thread-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .thread-avatar-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
        }

        .thread-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .thread-name-row h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .thread-role-badge {
          font-size: 11px;
          padding: 2px 7px;
          border-radius: 4px;
          background: rgba(37, 99, 235, 0.1);
          color: var(--color-primary);
          font-weight: 600;
        }

        .thread-meta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 3px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .thread-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .thread-meta-item.task-meta {
          color: #0ea5e9;
          font-weight: 500;
        }

        .thread-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-thread-action {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-thread-action:hover {
          background: var(--bg-hover);
          border-color: var(--color-primary);
        }

        /* Messages Feed */
        .thread-messages-feed {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: var(--bg-base);
        }

        .chat-bubble-wrap {
          display: flex;
          flex-direction: column;
          max-width: 68%;
        }

        .chat-bubble-wrap.admin-bubble {
          align-self: flex-end;
        }

        .chat-bubble-wrap.user-bubble {
          align-self: flex-start;
        }

        .clickable-user,
        .clickable-user-title {
          cursor: pointer;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .clickable-user:hover {
          transform: scale(1.05);
        }
        .clickable-user-title:hover {
          color: var(--color-primary);
        }

        .clickable-task-pill {
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .clickable-task-pill:hover {
          color: #60a5fa !important;
          text-decoration: underline;
        }

        .bubble-sender-title {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 4px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bubble-sender-title.clickable-sender {
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .bubble-sender-title.clickable-sender:hover {
          opacity: 0.85;
        }
        .bubble-sender-title.clickable-sender:hover .sender-display-name {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .bubble-sender-avatar-img {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          object-fit: cover;
        }

        .bubble-sender-avatar-mini {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.2);
          color: #60a5fa;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sender-role-tag {
          font-size: 9.5px;
          font-weight: 700;
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
          padding: 1px 6px;
          border-radius: 4px;
          border: 1px solid rgba(37, 99, 235, 0.3);
        }

        .bubble-content-card {
          padding: 10px 14px;
          border-radius: 12px;
          position: relative;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .admin-bubble .bubble-content-card {
          background: linear-gradient(135deg, #1e40af, #2563eb);
          color: #ffffff;
          border-bottom-right-radius: 2px;
        }

        [dir="rtl"] .admin-bubble .bubble-content-card {
          border-bottom-right-radius: 12px;
          border-bottom-left-radius: 2px;
        }

        .user-bubble .bubble-content-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-bottom-left-radius: 2px;
        }

        [dir="rtl"] .user-bubble .bubble-content-card {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 2px;
        }

        .bubble-image-wrap {
          margin-bottom: 8px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          max-width: 280px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .bubble-img {
          width: 100%;
          display: block;
          transition: transform 0.2s ease;
        }

        .bubble-image-wrap:hover .bubble-img {
          transform: scale(1.02);
        }

        .img-zoom-hint {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 4px 8px;
          background: rgba(0,0,0,0.7);
          font-size: 10px;
          color: #ffffff;
          text-align: center;
        }

        .bubble-text {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.45;
          word-break: break-word;
        }

        .bubble-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 4px;
        }

        .bubble-time {
          font-size: 10px;
          opacity: 0.75;
        }

        .admin-bubble .bubble-time {
          color: #e0e7ff;
        }

        .user-bubble .bubble-time {
          color: var(--text-muted);
        }

        /* Quick templates bar */
        .quick-templates-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .template-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .template-chips {
          display: flex;
          gap: 6px;
          overflow-x: auto;
        }

        .template-chip {
          font-size: 11.5px;
          padding: 4px 10px;
          border-radius: 6px;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
        }

        .template-chip:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(37, 99, 235, 0.05);
        }

        /* Attached preview */
        .attached-img-preview-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(37, 99, 235, 0.08);
          border-top: 1px solid rgba(37, 99, 235, 0.2);
        }

        .attached-thumbnail {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
        }

        .attached-info {
          font-size: 12px;
          color: var(--color-primary);
          font-weight: 500;
          flex: 1;
        }

        .remove-attached-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        /* Composer */
        .thread-composer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-surface);
        }

        .composer-btn-attach {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .composer-btn-attach:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .composer-textarea {
          flex: 1;
          resize: none;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-base);
          color: var(--text-primary);
          padding: 10px 14px;
          font-size: 13.5px;
          outline: none;
          font-family: inherit;
          max-height: 120px;
          transition: border-color 0.2s ease;
        }

        .composer-textarea:focus {
          border-color: var(--color-primary);
        }

        .composer-btn-send {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 8px;
          background: var(--color-primary);
          color: #ffffff;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .composer-btn-send:hover:not(:disabled) {
          opacity: 0.9;
        }

        .composer-btn-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Lightbox */
        .img-lightbox-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .img-lightbox-content {
          background: var(--bg-surface);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          max-width: 90vw;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }

        .lightbox-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .lightbox-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .lightbox-body {
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
        }

        .lightbox-full-img {
          max-width: 100%;
          max-height: 75vh;
          border-radius: 8px;
          object-fit: contain;
        }

        .no-room-selected-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
          text-align: center;
          padding: 40px;
        }

        .no-room-selected-state h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 18px;
        }

        .no-room-selected-state p {
          max-width: 420px;
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        .mini-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .btn-chat-mobile-back {
          display: none;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 6px;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .btn-chat-mobile-back {
            display: flex;
            margin-inline-end: 4px;
          }
          .chat-page-main {
            padding: 12px;
            height: calc(100vh - 120px);
          }
          .chat-sidebar-pane {
            width: ${selectedRoomId ? '0px' : '100%'};
            display: ${selectedRoomId ? 'none' : 'flex'};
          }
          .chat-thread-pane {
            display: ${selectedRoomId ? 'flex' : 'none'};
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
