import type { Task, TaskDetail, TaskFilter } from '../entities/Task';
import type { Result } from '../../core/result/Result';

export interface TasksQuery {
  status: TaskFilter;
  q?: string;
  page: number;
  limit: number;
}

export interface TasksResult {
  items: Task[];
  total: number;
  counts?: Record<TaskFilter, number>;
}

export interface TaskRepository {
  getTasks(q: TasksQuery): Promise<Result<TasksResult>>;
  getTask(id: string): Promise<Result<TaskDetail>>;
  freezeTask(id: string): Promise<Result<boolean>>;
  unfreezeTask(id: string): Promise<Result<boolean>>;
  dispatchBackup(id: string, craftsmanProfileId: string): Promise<Result<boolean>>;
}
