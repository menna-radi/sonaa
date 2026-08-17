export interface ChatParticipant {
  id: string | null;
  craftsmanProfileId?: string | null;
  customerProfileId?: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: 'CUSTOMER' | 'CRAFTSMAN' | 'ADMIN' | string;
  phoneNumber?: string;
  email?: string;
  trade?: string;
  rating?: number;
}

export interface ChatTaskSummary {
  id: string;
  title: string;
  displayId: string;
  status: string;
  budgetAmount?: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole?: 'ADMIN' | 'CUSTOMER' | 'CRAFTSMAN' | string;
  senderName?: string;
  senderAvatar?: string | null;
  craftsmanProfileId?: string | null;
  customerProfileId?: string | null;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM' | string;
  content: string;
  imageUrl?: string | null;
  status: 'SENT' | 'DELIVERED' | 'READ' | string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  task: ChatTaskSummary | null;
  otherParticipant: ChatParticipant;
  customerProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    userId: string;
    user?: {
      phoneNumber?: string;
      email?: string;
    };
  };
  craftsmanProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    userId: string;
    tradeCategory?: string;
    rating?: number;
    user?: {
      phoneNumber?: string;
      email?: string;
    };
  };
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: string;
}
