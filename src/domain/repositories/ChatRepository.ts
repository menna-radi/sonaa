import { ChatRoom, ChatMessage, ChatSearchUser } from '../entities/Chat';
import { Result } from '../../core/result/Result';

export interface ChatRepository {
  getChatRooms(): Promise<Result<ChatRoom[]>>;
  getChatRoomMessages(chatRoomId: string): Promise<Result<ChatMessage[]>>;
  sendMessage(
    chatRoomId: string,
    content: string,
    imageUrl?: string,
    visibility?: 'PUBLIC' | 'CUSTOMER_PRIVATE' | 'CRAFTSMAN_PRIVATE' | 'ADMIN_INTERNAL'
  ): Promise<Result<ChatMessage>>;
  markAsRead(chatRoomId: string): Promise<Result<boolean>>;
  createChatRoom(participantId: string): Promise<Result<ChatRoom>>;
  searchUsers(query?: string, role?: string): Promise<Result<ChatSearchUser[]>>;
}
