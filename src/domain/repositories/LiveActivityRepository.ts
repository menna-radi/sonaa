import type { LiveActivitySnapshot, ActivityEvent } from '../entities/LiveActivity';
import { Result } from '../../core/result/Result';

export interface LiveActivityRepository {
  getSnapshot(): Promise<Result<LiveActivitySnapshot>>;
  subscribeToFeed(onEvent: (event: ActivityEvent) => void): () => void;
}
