import { TaskRepository } from '../../repositories/TaskRepository';
import { Result } from '../../../core/result/Result';

export class FreezeTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async execute(id: string): Promise<Result<boolean>> {
    return this.taskRepository.freezeTask(id);
  }
}
export class UnfreezeTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  public async execute(id: string): Promise<Result<boolean>> {
    return this.taskRepository.unfreezeTask(id);
  }
}
