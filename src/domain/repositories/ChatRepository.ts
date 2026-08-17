import { ChatRoom, ChatMessage } from '../entities/Chat';
import { Result } from '../../core/result/Result';

export interface ChatRepository {
  getChatRooms(): Promise<Result<ChatRoom[]>>;
  getChatRoomMessages(chatRoomId: string): Promise<Result<ChatMessage[]>>;
  sendMessage(chatRoomId: string, content: string, imageUrl?: string): Promise<Result<ChatMessage>>;
  markAsRead(chatRoomId: string): Promise<Result<boolean>>;
}
