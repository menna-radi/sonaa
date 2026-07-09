import type { LiveActivitySnapshot, ActivityEvent } from '../../domain/entities/LiveActivity';
import type { LiveActivityRepository } from '../../domain/repositories/LiveActivityRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { AppError } from '../../core/errors/AppError';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { LiveActivityMapper, ApiLiveSnapshotModel } from '../mappers/LiveActivityMapper';

export class ApiLiveActivityRepository implements LiveActivityRepository {
  async getSnapshot(): Promise<Result<LiveActivitySnapshot>> {
    try {
      const response = await apiClient.get<ApiLiveSnapshotModel>(API_ENDPOINTS.admin.liveActivity);
      return ok(LiveActivityMapper.toSnapshot(response));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeToFeed(_onEvent: (event: ActivityEvent) => void): () => void {
    return () => { /* no-op until WebSocket/SSE is connected */ };
  }
}
export default ApiLiveActivityRepository;
