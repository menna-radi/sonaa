import { ChatRepository } from '../../domain/repositories/ChatRepository';
import { ChatRoom, ChatMessage } from '../../domain/entities/Chat';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

export class ApiChatRepository implements ChatRepository {
  public async getChatRooms(): Promise<Result<ChatRoom[]>> {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.chat.rooms);
      const rawList = Array.isArray(response) ? response : (response as any).items || [];
      
      const mapped: ChatRoom[] = rawList.map((room: any) => {
        const lastMsg: ChatMessage | null = room.lastMessage ? {
          id: room.lastMessage.id,
          chatRoomId: room.lastMessage.chatRoomId,
          senderId: room.lastMessage.senderId,
          senderRole: room.lastMessage.senderRole,
          senderName: room.lastMessage.senderName,
          senderAvatar: room.lastMessage.senderAvatar || null,
          craftsmanProfileId: room.lastMessage.craftsmanProfileId || null,
          customerProfileId: room.lastMessage.customerProfileId || null,
          messageType: room.lastMessage.messageType || 'TEXT',
          content: room.lastMessage.content || '',
          imageUrl: room.lastMessage.imageUrl || null,
          status: room.lastMessage.status || 'SENT',
          createdAt: room.lastMessage.createdAt || new Date().toISOString(),
        } : null;

        const other = room.otherParticipant || {};

        return {
          id: room.id,
          task: room.task ? {
            id: room.task.id,
            title: room.task.title || 'Service Task',
            displayId: room.task.displayId || `#TSK-${room.task.id.slice(0, 4)}`,
            status: room.task.status || 'IN_PROGRESS',
            budgetAmount: room.task.budgetAmount,
          } : null,
          otherParticipant: {
            id: other.id || null,
            craftsmanProfileId: other.craftsmanProfileId || room.craftsmanProfile?.id || null,
            customerProfileId: other.customerProfileId || room.customerProfile?.id || null,
            firstName: other.firstName || 'User',
            lastName: other.lastName || '',
            avatarUrl: other.avatarUrl || null,
            role: other.role || 'CRAFTSMAN',
            phoneNumber: other.phoneNumber || room.craftsmanProfile?.user?.phoneNumber || room.customerProfile?.user?.phoneNumber,
            email: other.email || room.craftsmanProfile?.user?.email || room.customerProfile?.user?.email,
            trade: other.trade || room.craftsmanProfile?.tradeCategory,
            rating: other.rating || room.craftsmanProfile?.rating,
          },
          customerProfile: room.customerProfile,
          craftsmanProfile: room.craftsmanProfile,
          lastMessage: lastMsg,
          unreadCount: Number(room.unreadCount || 0),
          createdAt: room.createdAt || new Date().toISOString(),
        };
      });

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getChatRoomMessages(chatRoomId: string): Promise<Result<ChatMessage[]>> {
    try {
      const response = await apiClient.get<any[]>(API_ENDPOINTS.chat.messages(chatRoomId));
      const rawList = Array.isArray(response) ? response : (response as any).items || [];

      // Backend returns newest first (descending); reverse to chronological ascending order (oldest at top, newest at bottom)
      const chronological = [...rawList].reverse();

      const mapped: ChatMessage[] = chronological.map((msg: any) => ({
        id: msg.id,
        chatRoomId: msg.chatRoomId || chatRoomId,
        senderId: msg.senderId,
        senderRole: msg.senderRole || (msg.sender?.role) || 'USER',
        senderName: msg.senderName || (msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'User'),
        senderAvatar: msg.senderAvatar || msg.sender?.avatarUrl || null,
        craftsmanProfileId: msg.craftsmanProfileId || msg.sender?.craftsmanProfile?.id || null,
        customerProfileId: msg.customerProfileId || msg.sender?.customerProfile?.id || null,
        messageType: msg.messageType || 'TEXT',
        content: msg.content || '',
        imageUrl: msg.imageUrl || null,
        status: msg.status || 'SENT',
        createdAt: msg.createdAt || new Date().toISOString(),
      }));

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async sendMessage(chatRoomId: string, content: string, imageUrl?: string): Promise<Result<ChatMessage>> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.chat.sendMessage(chatRoomId), {
        content,
        imageUrl: imageUrl || undefined,
      });

      const message: ChatMessage = {
        id: response.id || `msg_${Date.now()}`,
        chatRoomId: response.chatRoomId || chatRoomId,
        senderId: response.senderId || 'admin',
        senderRole: response.senderRole || 'ADMIN',
        senderName: response.senderName || 'Sonaa Admin',
        senderAvatar: response.senderAvatar || null,
        craftsmanProfileId: response.craftsmanProfileId || null,
        customerProfileId: response.customerProfileId || null,
        messageType: response.messageType || (imageUrl ? 'IMAGE' : 'TEXT'),
        content: response.content || content,
        imageUrl: response.imageUrl || imageUrl || null,
        status: response.status || 'SENT',
        createdAt: response.createdAt || new Date().toISOString(),
      };

      return ok(message);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async markAsRead(chatRoomId: string): Promise<Result<boolean>> {
    try {
      await this.getChatRoomMessages(chatRoomId);
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}

export default ApiChatRepository;
