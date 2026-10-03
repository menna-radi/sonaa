import { PaymentRepository, type Subscriber, type SubscriptionRequestItem } from '../../domain/repositories/PaymentRepository';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest,
  WithdrawalQuery,
  LegacyWithdrawalRequest,
} from '../../domain/entities/Payment';
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
    mrr: 132615
  };

  private plans: SubscriptionPlan[] = [
    { id: 'p1', name: 'Starter', price: 0, subscribersCount: 5912 },
    { id: 'p2', name: 'Pro', price: 99, subscribersCount: 718 },
    { id: 'p3', name: 'Pro+', price: 249, subscribersCount: 112 }
  ];

  private subscribers: Subscriber[] = [
    {
      id: 'sub-1',
      craftsmanName: 'Tariq Mansoor',
      user: { id: 'user-sub-1', firstName: 'Tariq', lastName: 'Mansoor', email: 'tariq@sonaa.ps', phoneNumber: '+972541112233', role: 'CUSTOMER' },
      subscriptionStatus: 'ACTIVE',
      startDate: '2026-07-01',
    },
    {
      id: 'sub-2',
      craftsmanName: 'Omar Farooq',
      user: { id: 'user-sub-2', firstName: 'Omar', lastName: 'Farooq', email: 'omar@sonaa.ps', phoneNumber: '+972542223344', role: 'CRAFTSMAN' },
      subscriptionStatus: 'ACTIVE',
      startDate: '2026-06-15',
    },
  ];

  private failedTransactions: FailedTransaction[] = [
    { id: 't1', name: 'Ahmad Al-Otaibi', txId: '#TX-8421', bank: 'Al Rajhi', timeAgo: '12m ago', amount: 4200, reasonKey: 'reason_bank_declined', retries: 1 },
    { id: 't2', name: 'Yousef Al-Harbi', txId: '#TX-8420', bank: 'SNB', timeAgo: '34m ago', amount: 1840, reasonKey: 'reason_insufficient_funds', retries: 2 },
    { id: 't3', name: 'Khalid Al-Qahtani', txId: '#TX-8418', bank: 'Riyad Bank', timeAgo: '1h ago', amount: 8920, reasonKey: 'reason_iban_mismatch', retries: 0 },
    { id: 't4', name: 'Saif Al-Ghamdi', txId: '#TX-8415', bank: 'Alinma', timeAgo: '2h ago', amount: 2480, reasonKey: 'reason_bank_declined', retries: 1 }
  ];

  private withdrawalRequests: LegacyWithdrawalRequest[] = [
    { id: 'w1', name: 'Ahmad Al-Otaibi', bank: 'Al Rajhi', timeAgo: '8m ago', amount: 4200, status: 'pending' },
    { id: 'w2', name: 'Mohammed Al-Zahrani', bank: 'SNB', timeAgo: '22m ago', amount: 1840, status: 'approved' },
    { id: 'w3', name: 'Khalid Al-Qahtani', bank: 'Riyad Bank', timeAgo: '34m ago', amount: 8920, status: 'pending' },
    { id: 'w4', name: 'Yousef Al-Harbi', bank: 'SNB', timeAgo: '1h ago', amount: 3120, status: 'approved' },
    { id: 'w5', name: 'Saif Al-Ghamdi', bank: 'Alinma', timeAgo: '2h ago', amount: 2480, status: 'pending' }
  ];

  public async getPaymentSummary(): Promise<Result<PaymentSummary>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return ok({ ...this.summary });
  }

  public async getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>> {
    await new Promise(resolve => setTimeout(resolve, 150));
    return ok([...this.plans]);
  }

  public async createSubscriptionPlan(data: Record<string, unknown>): Promise<Result<SubscriptionPlan>> {
    await new Promise(resolve => setTimeout(resolve, 250));
    const name = typeof data.name === 'string' && data.name ? data.name : 'New Plan';
    const price = typeof data.price === 'number' ? data.price : 99;
    const newPlan: SubscriptionPlan = {
      id: `p-${Date.now()}`,
      name,
      price,
      subscribersCount: 0,
    };
    this.plans.push(newPlan);
    return ok(newPlan);
  }

  public async updateSubscriptionPlan(id: string, data: Record<string, unknown>): Promise<Result<SubscriptionPlan>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = this.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.plans[idx] = { ...this.plans[idx], ...(data as Partial<SubscriptionPlan>) };
      return ok(this.plans[idx]);
    }
    return fail(new NotFoundError('Plan not found'));
  }

  public async getSubscribers(): Promise<Result<Subscriber[]>> {
    return ok([...this.subscribers]);
  }

  public async cancelSubscriber(id: string): Promise<Result<boolean>> {
    const sub = this.subscribers.find(s => s.id === id);
    if (sub) {
      sub.subscriptionStatus = 'CANCELLED';
    }
    return ok(true);
  }

  public async extendSubscriber(id: string, days = 30): Promise<Result<boolean>> {
    const sub = this.subscribers.find(s => s.id === id);
    if (sub) {
      sub.subscriptionStatus = 'ACTIVE';
      sub.expiryDate = new Date(Date.now() + days * 86400000).toISOString();
    }
    return ok(true);
  }

  public async getFailedTransactions(): Promise<Result<FailedTransaction[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ok([...this.failedTransactions]);
  }

  public async retryTransaction(id: string): Promise<Result<boolean>> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const tx = this.failedTransactions.find(t => t.id === id);
    if (!tx) return ok(false);

    if (tx.retries >= 2) {
      this.failedTransactions = this.failedTransactions.filter(t => t.id !== id);
    } else {
      tx.retries += 1;
    }
    return ok(true);
  }

  public async getWithdrawalRequests(): Promise<Result<LegacyWithdrawalRequest[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ok([...this.withdrawalRequests]);
  }

  public async updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<LegacyWithdrawalRequest>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const req = this.withdrawalRequests.find(w => w.id === id);
    if (!req) {
      return fail(new NotFoundError(`Withdrawal request with ID ${id} not found.`));
    }

    req.status = status;
    return ok({ ...req });
  }

  public async getWithdrawals(q: WithdrawalQuery): Promise<Result<Page<WithdrawalRequest>>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const toStatus = (s: LegacyWithdrawalRequest['status']): WithdrawalRequest['status'] =>
      s === 'approved' ? 'COMPLETED' : s === 'rejected' ? 'FAILED' : 'PENDING';
    const rows: WithdrawalRequest[] = this.withdrawalRequests
      .filter((w) => q.status === 'ALL' || toStatus(w.status) === q.status)
      .map((w, i) => ({
        id: w.id,
        craftsmanName: w.name,
        craftsmanProfileId: `craft-mock-${i}`,
        method: w.bank,
        amount: w.amount,
        status: toStatus(w.status),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        referenceId: `#TX-${w.id}`,
      }));
    return ok({ items: rows.slice((q.page - 1) * q.limit, q.page * q.limit), total: rows.length, page: q.page, limit: q.limit });
  }

  public async approveWithdrawal(id: string): Promise<Result<boolean>> {
    const res = await this.updateWithdrawalStatus(id, 'approved');
    return res.success ? ok(true) : fail(res.error);
  }

  public async rejectWithdrawal(id: string): Promise<Result<boolean>> {
    const res = await this.updateWithdrawalStatus(id, 'rejected');
    return res.success ? ok(true) : fail(res.error);
  }

  public async retryWithdrawal(id: string): Promise<Result<boolean>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const req = this.withdrawalRequests.find(w => w.id === id);
    if (req) req.status = 'pending';
    return ok(true);
  }

  public async deleteSubscriptionPlan(id: string): Promise<Result<boolean>> {
    this.plans = this.plans.filter(p => p.id !== id);
    return ok(true);
  }

  public async getSubscriptionRequests(): Promise<Result<SubscriptionRequestItem[]>> {
    return ok([]);
  }

  public async approveSubscriptionRequest(): Promise<Result<boolean>> {
    return ok(true);
  }

  public async rejectSubscriptionRequest(): Promise<Result<boolean>> {
    return ok(true);
  }

  public async getBitSettings(): Promise<Result<Record<string, string>>> {
    return ok({
      BIT_PHONE_NUMBER: '+972 54 888 9999',
      BIT_RECIPIENT_NAME: 'Sonaa Services (صنّاع)',
      BIT_INSTRUCTIONS_EN: 'Send payment via Bit app.',
      BIT_INSTRUCTIONS_AR: 'قم بتحويل قيمة الاشتراك عبر تطبيق Bit.',
    });
  }

  public async updateBitSettings(settings: Record<string, string>): Promise<Result<Record<string, string>>> {
    return ok(settings);
  }
}
export default MockPaymentRepository;
