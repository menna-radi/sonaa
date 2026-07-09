import { Task } from '../entities/Task';
import { Result } from '../../core/result/Result';

export interface TaskRepository {
  getTasks(): Promise<Result<Task[]>>;
  freezeTask(id: string): Promise<Result<Task>>;
  unfreezeTask(id: string): Promise<Result<Task>>;
}
