import { TaskRepository } from '../../repositories/TaskRepository';
import { Task } from '../../entities/Task';
import { Result } from '../../../core/result/Result';

export class GetTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async execute(): Promise<Result<Task[]>> {
    return this.taskRepository.getTasks();
  }
}
