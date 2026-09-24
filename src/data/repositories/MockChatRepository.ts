import { ChatRepository } from '../../domain/repositories/ChatRepository';
import { ChatRoom, ChatMessage } from '../../domain/entities/Chat';
import { Result, ok } from '../../core/result/Result';

export class MockChatRepository implements ChatRepository {
  private rooms: ChatRoom[] = [];
  private messages: Record<string, ChatMessage[]> = {};

  public async getChatRooms(): Promise<Result<ChatRoom[]>> {
    return ok(this.rooms);
  }

  public async getChatRoomMessages(chatRoomId: string): Promise<Result<ChatMessage[]>> {
    return ok(this.messages[chatRoomId] || []);
  }

  public async sendMessage(chatRoomId: string, content: string, imageUrl?: string): Promise<Result<ChatMessage>> {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatRoomId,
      senderId: 'admin',
      senderRole: 'ADMIN',
      senderName: 'Sonaa Admin',
      messageType: imageUrl ? 'IMAGE' : 'TEXT',
      content,
      imageUrl: imageUrl || null,
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };

    if (!this.messages[chatRoomId]) {
      this.messages[chatRoomId] = [];
    }
    this.messages[chatRoomId].push(newMsg);

    return ok(newMsg);
  }

  public async markAsRead(chatRoomId: string): Promise<Result<boolean>> {
    const room = this.rooms.find(r => r.id === chatRoomId);
    if (room) {
      room.unreadCount = 0;
    }
    return ok(true);
  }

  public async createChatRoom(participantId: string): Promise<Result<ChatRoom>> {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      task: null,
      otherParticipant: {
        id: participantId,
        craftsmanProfileId: null,
        customerProfileId: null,
        firstName: 'Mock',
        lastName: 'User',
        avatarUrl: null,
        role: 'CUSTOMER',
      },
      lastMessage: null,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.rooms.unshift(newRoom);
    return ok(newRoom);
  }

  public async searchUsers(_query?: string, _role?: string): Promise<Result<any[]>> {
    return ok([]);
  }
}

export default MockChatRepository;
