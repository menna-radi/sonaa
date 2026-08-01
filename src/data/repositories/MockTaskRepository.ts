import { Task } from '../../domain/entities/Task';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

const SEED_TASKS: Task[] = [
  { id: 't1', title: 'AC unit installation', jobNumber: '#SN-2418', customer: 'Mona Al-Harbi', craftsman: 'Mohammed Z.', zone: 'Shuafat', amountSAR: 720, eta: '12 min', status: 'in_progress' },
  { id: 't2', title: 'Bathroom pipe burst', jobNumber: '#SN-2417', customer: 'Lina Al-Qahtani', craftsman: 'Yousef H.', zone: 'Beit Hanina', amountSAR: 480, eta: 'NOW', status: 'emergency' },
  { id: 't3', title: 'Ceiling lights install', jobNumber: '#SN-2415', customer: 'Saad Al-Dawsari', craftsman: 'Khalid Q.', zone: 'Old City', amountSAR: 350, eta: '4 min', status: 'in_progress' },
  { id: 't4', title: 'Wall painting · 2 rooms', jobNumber: '#SN-2412', customer: 'Omar Al-Ghamdi', craftsman: 'Hassan M.', zone: 'Sheikh Jarrah', amountSAR: 1500, eta: '—', status: 'disputed' },
  { id: 't5', title: 'Generator maintenance', jobNumber: '#SN-2410', customer: 'Faisal Al-Shamri', craftsman: 'Saif G.', zone: 'Silwan', amountSAR: 900, eta: '18 min', status: 'in_progress' },
  { id: 't6', title: 'Smart lock installation', jobNumber: '#SN-2408', customer: 'Reem Al-Anzi', craftsman: 'Bandar O.', zone: 'Beit Hanina', amountSAR: 900, eta: '—', status: 'frozen' },
  { id: 't7', title: 'Kitchen sink unclog', jobNumber: '#SN-2405', customer: 'Nadia Al-Saud', craftsman: 'Mohammed Z.', zone: 'Old City', amountSAR: 280, eta: 'Done', status: 'completed' },
];

export class MockTaskRepository implements TaskRepository {
  private tasks: Task[] = [...SEED_TASKS];

  public async getTasks(): Promise<Result<Task[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ok([...this.tasks]);
  }

  public async freezeTask(id: string): Promise<Result<Task>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.tasks.findIndex((t) => t.id === id || t.jobNumber === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Task with id ${id} not found`));
    }
    const updated: Task = {
      ...this.tasks[idx],
      status: 'frozen'
    };
    this.tasks[idx] = updated;
    return ok(updated);
  }

  public async unfreezeTask(id: string): Promise<Result<Task>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.tasks.findIndex((t) => t.id === id || t.jobNumber === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Task with id ${id} not found`));
    }
    const updated: Task = {
      ...this.tasks[idx],
      status: 'in_progress'
    };
    this.tasks[idx] = updated;
    return ok(updated);
  }

  public async dispatchBackup(_id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return ok(true);
  }
}
export default MockTaskRepository;
