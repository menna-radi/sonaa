import { TaskRepository } from '../../domain/repositories/TaskRepository';
import { Task } from '../../domain/entities/Task';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { TaskMapper } from '../mappers/TaskMapper';
import { TaskDTO } from '../dto/TaskDTO';
import { AppError, UnknownError } from '../../core/errors/AppError';

interface PaginatedTasksResponse {
  results: TaskDTO[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export class ApiTaskRepository implements TaskRepository {
  public async getTasks(): Promise<Result<Task[]>> {
    try {
      const response = await apiClient.get<PaginatedTasksResponse>(API_ENDPOINTS.tasks.list);
      const domainTasks = response.results.map(dto => TaskMapper.toDomain(dto));
      return ok(domainTasks);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async freezeTask(_id: string): Promise<Result<Task>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async unfreezeTask(_id: string): Promise<Result<Task>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }
}
export default ApiTaskRepository;
