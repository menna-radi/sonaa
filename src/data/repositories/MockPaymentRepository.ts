import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
} from '../../domain/entities/Payment';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

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

  private subscribers: any[] = [
    { id: 'sub-1', customerProfileId: 'cust-1', user: { firstName: 'Tariq', lastName: 'Mansoor', email: 'tariq@sonaa.ps', phoneNumber: '+972541112233', role: 'CUSTOMER' }, plan: 'PRO', billingCycle: 'MONTHLY', amount: 49, currency: 'ILS', status: 'ACTIVE', autoRenew: true, startDate: '2026-07-01' },
    { id: 'sub-2', customerProfileId: 'cust-2', user: { firstName: 'Omar', lastName: 'Farooq', email: 'omar@sonaa.ps', phoneNumber: '+972542223344', role: 'CRAFTSMAN' }, plan: 'PRO', billingCycle: 'YEARLY', amount: 490, currency: 'ILS', status: 'ACTIVE', autoRenew: true, startDate: '2026-06-15' },
  ];

  private failedTransactions: FailedTransaction[] = [
    { id: 't1', name: 'Ahmad Al-Otaibi', txId: '#TX-8421', bank: 'Al Rajhi', timeAgo: '12m ago', amount: 4200, reasonKey: 'reason_bank_declined', retries: 1 },
    { id: 't2', name: 'Yousef Al-Harbi', txId: '#TX-8420', bank: 'SNB', timeAgo: '34m ago', amount: 1840, reasonKey: 'reason_insufficient_funds', retries: 2 },
    { id: 't3', name: 'Khalid Al-Qahtani', txId: '#TX-8418', bank: 'Riyad Bank', timeAgo: '1h ago', amount: 8920, reasonKey: 'reason_iban_mismatch', retries: 0 },
    { id: 't4', name: 'Saif Al-Ghamdi', txId: '#TX-8415', bank: 'Alinma', timeAgo: '2h ago', amount: 2480, reasonKey: 'reason_bank_declined', retries: 1 }
  ];

  private withdrawalRequests: WithdrawalRequest[] = [
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

  public async createSubscriptionPlan(data: Partial<SubscriptionPlan>): Promise<Result<SubscriptionPlan>> {
    await new Promise(resolve => setTimeout(resolve, 250));
    const newPlan: SubscriptionPlan = {
      id: `p-${Date.now()}`,
      name: data.name || 'New Plan',
      price: data.price || 99,
      subscribersCount: 0,
    };
    this.plans.push(newPlan);
    return ok(newPlan);
  }

  public async updateSubscriptionPlan(id: string, data: any): Promise<Result<SubscriptionPlan>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const idx = this.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.plans[idx] = { ...this.plans[idx], ...data };
      return ok(this.plans[idx]);
    }
    return fail({ message: 'Plan not found' } as any);
  }

  public async getSubscribers(): Promise<Result<any[]>> {
    return ok([...this.subscribers]);
  }

  public async cancelSubscriber(id: string): Promise<Result<boolean>> {
    const sub = this.subscribers.find(s => s.id === id);
    if (sub) {
      sub.status = 'CANCELLED';
      sub.autoRenew = false;
    }
    return ok(true);
  }

  public async extendSubscriber(id: string, days: number = 30): Promise<Result<boolean>> {
    const sub = this.subscribers.find(s => s.id === id);
    if (sub) {
      sub.status = 'ACTIVE';
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

  public async getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ok([...this.withdrawalRequests]);
  }

  public async updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const req = this.withdrawalRequests.find(w => w.id === id);
    if (!req) {
      return fail(new NotFoundError(`Withdrawal request with ID ${id} not found.`));
    }

    req.status = status;
    return ok({ ...req });
  }

  public async deleteSubscriptionPlan(id: string): Promise<Result<boolean>> {
    this.plans = this.plans.filter(p => p.id !== id);
    return ok(true);
  }

  public async getSubscriptionRequests(): Promise<Result<any[]>> {
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
