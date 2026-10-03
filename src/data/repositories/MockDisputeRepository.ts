import type {
  DisputeRepository,
  DisputesQuery,
  DisputesResult,
} from '../../domain/repositories/DisputeRepository';
import type { Dispute, DisputeResolution } from '../../domain/entities/Dispute';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export class MockDisputeRepository implements DisputeRepository {
  private disputes: Dispute[] = [
    {
      id: 'd1',
      taskId: 't4',
      taskDisplayId: 'SN-0004',
      taskTitle: 'Wall painting, 2 rooms',
      customerName: 'Reema Al-Saud',
      craftsmanName: 'Ahmad Al-Otaibi',
      reason: 'SERVICE_QUALITY',
      description: 'The craftsman left early and did not wire the living room socket correctly.',
      status: 'PENDING',
      amount: 1500,
      createdAt: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 'd2',
      taskId: 't9',
      taskDisplayId: 'SN-0009',
      taskTitle: 'Bathroom pipe burst',
      customerName: 'Turki Al-Ghamdi',
      craftsmanName: 'Yousef Al-Harbi',
      reason: 'OVERCHARGING',
      description: 'Charged double the agreed price after the work was done.',
      status: 'PENDING',
      amount: 1200,
      createdAt: '2026-09-29T10:00:00.000Z',
    },
    {
      id: 'd3',
      taskId: 't10',
      taskDisplayId: 'SN-0010',
      taskTitle: 'Late arrival',
      customerName: 'Sara Al-Malki',
      craftsmanName: null,
      reason: 'NO_SHOW',
      description: 'Craftsman was over 3 hours late and did not finish on time.',
      status: 'RESOLVED',
      resolution: 'REFUND_CLIENT',
      amount: 320,
      createdAt: '2026-09-20T10:00:00.000Z',
      resolvedAt: '2026-09-21T10:00:00.000Z',
    },
  ];

  private async delay(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  public async getDisputes(q: DisputesQuery): Promise<Result<DisputesResult>> {
    await this.delay();
    const rows = this.disputes.filter((d) => q.status === 'ALL' || d.status === q.status);
    return ok({
      items: rows.slice((q.page - 1) * q.limit, q.page * q.limit).map((d) => ({ ...d })),
      total: rows.length,
      counts: {
        pending: this.disputes.filter((d) => d.status === 'PENDING').length,
        resolved: this.disputes.filter((d) => d.status === 'RESOLVED').length,
      },
    });
  }

  public async resolveDispute(
    id: string,
    resolution: DisputeResolution,
    notes?: string
  ): Promise<Result<boolean>> {
    await this.delay();
    const dispute = this.disputes.find((d) => d.id === id);
    if (!dispute) return fail(new NotFoundError('Dispute not found'));
    dispute.status = 'RESOLVED';
    dispute.resolution = resolution;
    dispute.adminNotes = notes;
    dispute.resolvedAt = new Date().toISOString();
    return ok(true);
  }
}
export default MockDisputeRepository;
