import type { TaskRepository, TasksQuery } from '../../repositories/TaskRepository';
import { Result } from '../../../core/result/Result';

export class GetTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async execute(q: TasksQuery): Promise<ReturnType<TaskRepository['getTasks']>> {
    return this.taskRepository.getTasks(q);
  }
}
