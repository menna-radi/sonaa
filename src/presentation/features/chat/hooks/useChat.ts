import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { storageService } from '../../../../core/storage/StorageService';
import { ChatRoom, ChatMessage } from '../../../../domain/entities/Chat';

export type ChatFilterTab = 'all' | 'subscriptions' | 'tasks' | 'support';

export const useChat = () => {
  const { dependencies } = useDependencies();
  const { chatRepository } = dependencies;

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<ChatFilterTab>('all');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const activeRoomIdRef = useRef<string | null>(selectedRoomId);

  useEffect(() => {
    activeRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  // 1. Fetch Rooms
  const fetchRooms = useCallback(async (showLoader = false) => {
    if (showLoader) setLoadingRooms(true);
    setError(null);
    try {
      const result = await chatRepository.getChatRooms();
      if (result.success) {
        setRooms(result.data);
        // Default select first room if none selected yet
        if (!activeRoomIdRef.current && result.data.length > 0) {
          setSelectedRoomId(result.data[0].id);
        }
      } else {
        setError(result.error.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chat rooms.');
    } finally {
      if (showLoader) setLoadingRooms(false);
    }
  }, [chatRepository]);

  // 2. Fetch Messages for selected room
  const fetchMessages = useCallback(async (roomId: string, showLoader = false) => {
    if (showLoader) setLoadingMessages(true);
    try {
      const result = await chatRepository.getChatRoomMessages(roomId);
      if (result.success) {
        const sorted = [...result.data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setMessages(sorted);
        // Reset unread count locally for this room
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
      }
    } catch (err: unknown) {
      console.error('Failed to load room messages:', err);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  }, [chatRepository]);

  // 3. Socket.IO Real-time Lifecycle
  useEffect(() => {
    const token = storageService.getToken();
    const serverUrl = window.location.origin;

    const socket: Socket = io(serverUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('chat:message', (incomingMsg: any) => {
      const chatRoomId = incomingMsg.chatRoomId;
      const formattedMsg: ChatMessage = {
        id: incomingMsg.id || `msg_${Date.now()}`,
        chatRoomId,
        senderId: incomingMsg.senderId,
        senderRole: incomingMsg.senderRole || (incomingMsg.sender?.role || 'CRAFTSMAN'),
        senderName: incomingMsg.senderName || `${incomingMsg.sender?.firstName || 'User'}`,
        messageType: incomingMsg.messageType || 'TEXT',
        content: incomingMsg.content || '',
        imageUrl: incomingMsg.imageUrl || null,
        status: 'DELIVERED',
        createdAt: incomingMsg.createdAt || new Date().toISOString(),
      };

      // If this message belongs to currently active room, append to messages feed and sort chronologically
      if (activeRoomIdRef.current === chatRoomId) {
        setMessages(prev => {
          if (prev.some(m => m.id === formattedMsg.id)) return prev;
          const updated = [...prev, formattedMsg];
          return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }

      // Update room lastMessage & unread count
      setRooms(prev => {
        return prev.map(r => {
          if (r.id === chatRoomId) {
            return {
              ...r,
              lastMessage: formattedMsg,
              unreadCount: activeRoomIdRef.current === chatRoomId ? 0 : r.unreadCount + 1,
            };
          }
          return r;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 4. Initial Load
  useEffect(() => {
    fetchRooms(true);
  }, [fetchRooms]);

  // 5. Silent periodic polling fallback (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRooms(false);
      if (activeRoomIdRef.current) {
        fetchMessages(activeRoomIdRef.current, false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms, fetchMessages]);

  // 6. When selected room changes, fetch its messages
  useEffect(() => {
    if (selectedRoomId) {
      fetchMessages(selectedRoomId, true);
    }
  }, [selectedRoomId, fetchMessages]);

  // 7. Send Message Action
  const sendMessage = useCallback(async (content: string, imageUrl?: string): Promise<boolean> => {
    if (!selectedRoomId || (!content.trim() && !imageUrl)) return false;

    setSending(true);
    try {
      const result = await chatRepository.sendMessage(selectedRoomId, content.trim(), imageUrl);
      if (result.success) {
        const newMsg = result.data;
        setMessages(prev => {
          const updated = [...prev, newMsg];
          return updated.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });

        // Update last message in room list
        setRooms(prev => prev.map(r => r.id === selectedRoomId ? { ...r, lastMessage: newMsg } : r));
        return true;
      } else {
        setError(result.error.message);
        return false;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
      return false;
    } finally {
      setSending(false);
    }
  }, [selectedRoomId, chatRepository]);

  // 8. Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Tab filter
      if (filterTab === 'subscriptions') {
        const isSub = !room.task && (
          room.lastMessage?.content?.toLowerCase().includes('subscription') ||
          room.lastMessage?.content?.toLowerCase().includes('bit') ||
          room.lastMessage?.content?.includes('₪') ||
          room.lastMessage?.content?.includes('اشتراك') ||
          room.otherParticipant.role === 'CRAFTSMAN'
        );
        if (!isSub) return false;
      } else if (filterTab === 'tasks') {
        if (!room.task) return false;
      } else if (filterTab === 'support') {
        if (room.task) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const participantName = `${room.otherParticipant.firstName} ${room.otherParticipant.lastName}`.toLowerCase();
        const taskTitle = room.task?.title.toLowerCase() || '';
        const taskDisplayId = room.task?.displayId.toLowerCase() || '';
        const lastContent = room.lastMessage?.content.toLowerCase() || '';
        const phone = room.otherParticipant.phoneNumber?.toLowerCase() || '';

        return (
          participantName.includes(q) ||
          taskTitle.includes(q) ||
          taskDisplayId.includes(q) ||
          lastContent.includes(q) ||
          phone.includes(q)
        );
      }

      return true;
    });
  }, [rooms, filterTab, searchQuery]);

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  return {
    rooms: filteredRooms,
    allRoomsCount: rooms.length,
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
    selectRoom: setSelectedRoomId,
    sendMessage,
    refreshRooms: () => fetchRooms(false),
  };
};

export default useChat;
