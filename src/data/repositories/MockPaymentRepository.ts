import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import { PaymentSummary, WithdrawalRequest, WithdrawalQuery } from '../../domain/entities/Payment';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';
import type { Page } from '../mappers/pageMapper';

export class MockPaymentRepository implements PaymentRepository {
  private summary: PaymentSummary = {
    gmvMtd: 4120000,
    gmvChangePct: 18.9,
    netRevenue: 842000,
    revenueChangePct: 22.4,
    takeRate: 20.4,
    takeRateChangePct: 0.3,
    pendingPayouts: 184000,
    pendingCraftsmenCount: 94,
    mrr: 132615,
  };

  private withdrawals: WithdrawalRequest[] = [
    {
      id: 'w1',
      craftsmanName: 'Ahmad Al-Otaibi',
      craftsmanProfileId: 'craft-mock-1',
      method: 'Al Rajhi',
      amount: 4200,
      status: 'PENDING',
      createdAt: '2026-10-02T10:00:00.000Z',
      referenceId: '#TX-w1',
    },
    {
      id: 'w2',
      craftsmanName: 'Mohammed Al-Zahrani',
      craftsmanProfileId: 'craft-mock-2',
      method: 'SNB',
      amount: 1840,
      status: 'COMPLETED',
      createdAt: '2026-10-01T10:00:00.000Z',
      referenceId: '#TX-w2',
    },
    {
      id: 'w3',
      craftsmanName: 'Khalid Al-Qahtani',
      craftsmanProfileId: 'craft-mock-3',
      method: 'Riyad Bank',
      amount: 8920,
      status: 'FAILED',
      createdAt: '2026-09-30T10:00:00.000Z',
      referenceId: '#TX-w3',
    },
    {
      id: 'w4',
      craftsmanName: 'Yousef Al-Harbi',
      craftsmanProfileId: 'craft-mock-4',
      method: 'SNB',
      amount: 3120,
      status: 'PENDING',
      createdAt: '2026-10-02T08:00:00.000Z',
      referenceId: '#TX-w4',
    },
    {
      id: 'w5',
      craftsmanName: 'Saif Al-Ghamdi',
      craftsmanProfileId: 'craft-mock-5',
      method: '+972559998888',
      amount: 2480,
      status: 'PENDING',
      createdAt: '2026-10-02T06:00:00.000Z',
      referenceId: '#TX-w5',
    },
  ];

  public async getPaymentSummary(): Promise<Result<PaymentSummary>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return ok({ ...this.summary });
  }

  public async getWithdrawals(q: WithdrawalQuery): Promise<Result<Page<WithdrawalRequest>>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const rows = this.withdrawals.filter((w) => q.status === 'ALL' || w.status === q.status);
    return ok({
      items: rows.slice((q.page - 1) * q.limit, q.page * q.limit).map((w) => ({ ...w })),
      total: rows.length,
      page: q.page,
      limit: q.limit,
    });
  }

  public async approveWithdrawal(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const req = this.withdrawals.find((w) => w.id === id);
    if (!req) return fail(new NotFoundError(`Withdrawal request with ID ${id} not found.`));
    req.status = 'COMPLETED';
    return ok(true);
  }

  public async rejectWithdrawal(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const req = this.withdrawals.find((w) => w.id === id);
    if (!req) return fail(new NotFoundError(`Withdrawal request with ID ${id} not found.`));
    req.status = 'FAILED';
    return ok(true);
  }

  public async retryWithdrawal(id: string): Promise<Result<boolean>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const req = this.withdrawals.find((w) => w.id === id);
    if (!req) return fail(new NotFoundError(`Withdrawal request with ID ${id} not found.`));
    req.status = 'PENDING';
    return ok(true);
  }
}
export default MockPaymentRepository;
