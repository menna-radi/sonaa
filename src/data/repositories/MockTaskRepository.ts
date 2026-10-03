import type {
  TaskRepository,
  TasksQuery,
  TasksResult,
} from '../../domain/repositories/TaskRepository';
import type { Task, TaskDetail, TaskFilter } from '../../domain/entities/Task';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

const seed = (
  id: string,
  displayId: string,
  title: string,
  status: Task['status'],
  extra: Partial<Task> = {}
): Task => ({
  id,
  displayId,
  title,
  status,
  isEmergency: false,
  customerName: 'Mona Al-Harbi',
  craftsmanName: 'Mohammed Z.',
  category: 'Electrician',
  address: 'Jerusalem',
  amount: 500,
  budgetType: 'SPECIFIC',
  distributionType: 'DIRECT',
  createdAt: '2026-09-20T10:00:00.000Z',
  hasDispute: status === 'DISPUTED',
  offersCount: 2,
  ...extra,
});

export class MockTaskRepository implements TaskRepository {
  private tasks: Task[] = [
    seed('t1', 'SN-0001', 'AC unit installation', 'IN_PROGRESS'),
    seed('t2', 'SN-0002', 'Bathroom pipe burst', 'ACCEPTED', { isEmergency: true, amount: 480 }),
    seed('t3', 'SN-0003', 'Ceiling lights install', 'WORK_SUBMITTED'),
    seed('t4', 'SN-0004', 'Wall painting, 2 rooms', 'DISPUTED', { amount: 1500 }),
    seed('t5', 'SN-0005', 'Generator maintenance', 'FROZEN', { amount: 900 }),
    seed('t6', 'SN-0006', 'Smart lock installation', 'RATING_PENDING', { amount: 900 }),
    seed('t7', 'SN-0007', 'Kitchen sink unclog', 'CLOSED', { craftsmanName: null, amount: 280 }),
    seed('t8', 'SN-0008', 'Cancelled wiring job', 'CANCELLED', { cancelReason: 'reason_1', cancelNote: null }),
  ];

  private async delay(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  private matches(task: Task, filter: TaskFilter, q?: string): boolean {
    if (filter === 'live' && !['ACCEPTED', 'PRE_CHAT_PENDING', 'CHAT_OPEN', 'AGREEMENT_PENDING', 'IN_PROGRESS', 'WORK_SUBMITTED'].includes(task.status)) {
      return false;
    }
    if (filter === 'emergency' && !task.isEmergency) return false;
    if (filter === 'disputed' && task.status !== 'DISPUTED') return false;
    if (filter === 'done' && !['RATING_PENDING', 'CLOSED', 'COMPLETED'].includes(task.status)) return false;
    if (filter === 'cancelled' && !['CANCELLED', 'REJECTED'].includes(task.status)) return false;
    if (filter === 'frozen' && task.status !== 'FROZEN') return false;
    if (q) {
      const needle = q.trim().toLowerCase();
      if (!`${task.title} ${task.displayId} ${task.customerName}`.toLowerCase().includes(needle)) return false;
    }
    return true;
  }

  public async getTasks(q: TasksQuery): Promise<Result<TasksResult>> {
    await this.delay();
    const rows = this.tasks.filter((t) => this.matches(t, q.status, q.q));
    const counts = {
      all: this.tasks.length,
      live: this.tasks.filter((t) => this.matches(t, 'live')).length,
      emergency: this.tasks.filter((t) => this.matches(t, 'emergency')).length,
      disputed: this.tasks.filter((t) => this.matches(t, 'disputed')).length,
      done: this.tasks.filter((t) => this.matches(t, 'done')).length,
      cancelled: this.tasks.filter((t) => this.matches(t, 'cancelled')).length,
      frozen: this.tasks.filter((t) => this.matches(t, 'frozen')).length,
    };
    return ok({
      items: rows.slice((q.page - 1) * q.limit, q.page * q.limit).map((t) => ({ ...t })),
      total: rows.length,
      counts,
    });
  }

  public async getTask(id: string): Promise<Result<TaskDetail>> {
    await this.delay();
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return fail(new NotFoundError('Task not found'));
    return ok({
      task: { ...task },
      customer: { id: 'cust-1', name: task.customerName, phone: '+972541111111' },
      craftsman: task.craftsmanName
        ? { id: 'craft-1', name: task.craftsmanName, phone: '+972542222222', title: task.category }
        : null,
      offers: [],
      agreement: null,
      workProof: { imageUrls: [] },
      dispute: task.hasDispute ? { id: 'd-1' } : null,
      emergency: task.isEmergency ? { id: 'e-1' } : null,
      commission: null,
      cancel: { reason: task.cancelReason ?? null, note: task.cancelNote ?? null },
    });
  }

  public async freezeTask(id: string): Promise<Result<boolean>> {
    await this.delay();
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return fail(new NotFoundError('Task not found'));
    task.status = 'FROZEN';
    return ok(true);
  }

  public async unfreezeTask(id: string): Promise<Result<boolean>> {
    await this.delay();
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return fail(new NotFoundError('Task not found'));
    task.status = 'IN_PROGRESS';
    return ok(true);
  }

  public async dispatchBackup(id: string, craftsmanProfileId: string): Promise<Result<boolean>> {
    await this.delay();
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return fail(new NotFoundError('Task not found'));
    task.status = 'IN_PROGRESS';
    task.craftsmanName = `Craftsman ${craftsmanProfileId.slice(0, 4)}`;
    return ok(true);
  }
}
export default MockTaskRepository;
