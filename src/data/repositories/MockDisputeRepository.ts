import { DisputeRepository, Dispute } from '../../domain/repositories/DisputeRepository';
import { Result, ok } from '../../core/result/Result';

export class MockDisputeRepository implements DisputeRepository {
  private disputes: Dispute[] = [
    {
      id: 'd1',
      jobId: '#JOB-9481',
      customerName: 'Reema Al-Saud',
      craftsmanName: 'Ahmad Al-Otaibi',
      amount: 450,
      reason: 'Incomplete work & damage to wiring',
      status: 'pending',
      createdAt: '2026-07-01',
      description: 'The craftsman left early and did not wire the living room socket correctly. There is scorch marks on the panel.',
    },
    {
      id: 'd2',
      jobId: '#JOB-9382',
      customerName: 'Turki Al-Ghamdi',
      craftsmanName: 'Yousef Al-Harbi',
      amount: 1200,
      reason: 'Wrong materials used',
      status: 'pending',
      createdAt: '2026-07-02',
      description: 'Plumbing pipe fittings were PVC instead of copper as requested in specifications. Now they are leaking.',
    },
    {
      id: 'd3',
      jobId: '#JOB-9214',
      customerName: 'Sara Al-Malki',
      craftsmanName: 'Bandar Al-Omari',
      amount: 320,
      reason: 'No-show / Delay of work',
      status: 'resolved',
      createdAt: '2026-06-28',
      description: 'Craftsman was over 3 hours late and did not finish on time.',
    },
  ];

  public async getDisputes(): Promise<Result<Dispute[]>> {
    return ok(this.disputes);
  }

  public async resolveDispute(
    id: string,
    _resolution: 'refund_customer' | 'pay_craftsman' | 'split_split',
    _notes: string
  ): Promise<Result<boolean>> {
    this.disputes = this.disputes.map((d) =>
      d.id === id ? { ...d, status: 'resolved' as const } : d
    );
    return ok(true);
  }
}
export default MockDisputeRepository;
