import type { Result } from '../../core/result/Result';
import { ok, fail } from '../../core/result/Result';
import { ConflictError, NotFoundError } from '../../core/errors/AppError';
import type { Page } from '../mappers/pageMapper';
import type { BillingRepository } from '../../domain/repositories/BillingRepository';
import type * as B from '../../domain/entities/Billing';

/** In-memory twin of ApiBillingRepository for VITE_USE_MOCK=true. */
export class MockBillingRepository implements BillingRepository {
  private plans: B.SubscriptionPlan[] = [
    {
      id: 'plan-1',
      key: 'PLAN_3M',
      nameEn: '3 Month Standard Pass',
      nameAr: 'باقة الثلاثة أشهر القياسية',
      durationMonths: 3,
      price: 420,
      currency: 'ILS',
      featuresEn: ['Unlimited tasks', 'Direct chat'],
      featuresAr: ['مهام غير محدودة', 'محادثة مباشرة'],
      isPopular: false,
      isActive: true,
      subscribersCount: 2,
      pendingRequests: 1,
    },
    {
      id: 'plan-2',
      key: 'PLAN_6M',
      nameEn: '6 Months Pro Business',
      nameAr: 'اشتراك 6 أشهر للمحترفين',
      durationMonths: 6,
      price: 750,
      currency: 'ILS',
      featuresEn: ['Priority listing', 'Unlimited tasks'],
      featuresAr: ['أولوية في البحث', 'مهام غير محدودة'],
      isPopular: true,
      isActive: true,
      subscribersCount: 3,
      pendingRequests: 1,
    },
    {
      id: 'plan-3',
      key: 'PLAN_12M',
      nameEn: '1 Year Ultimate Pass',
      nameAr: 'اشتراك سنوي شامل',
      durationMonths: 12,
      price: 1200,
      currency: 'ILS',
      featuresEn: ['Gold badge', 'VIP support'],
      featuresAr: ['شارة ذهبية', 'دعم VIP'],
      isPopular: false,
      isActive: false,
      subscribersCount: 0,
      pendingRequests: 0,
    },
  ];

  private requests: B.SubscriptionRequest[] = [
    {
      id: 'req-1',
      userId: 'user-1',
      userName: 'Ahmad Haddad',
      userPhone: '+972541111111',
      craftsmanTitle: 'Electrician',
      planTitle: '6 Months Pro Business',
      durationMonths: 6,
      price: 750,
      currency: 'ILS',
      paymentMethod: 'BIT',
      paymentProofUrl: '/receipts/req-1.png',
      status: 'PENDING_VERIFICATION',
      createdAt: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 'req-2',
      userId: 'user-2',
      userName: 'Sara Nasser',
      userPhone: '+972542222222',
      craftsmanTitle: 'Plumber',
      planTitle: '3 Month Standard Pass',
      durationMonths: 3,
      price: 420,
      currency: 'ILS',
      paymentMethod: 'BIT',
      paymentProofUrl: '/receipts/req-2.png',
      status: 'PENDING_VERIFICATION',
      createdAt: '2026-09-29T11:00:00.000Z',
    },
    {
      id: 'req-3',
      userId: 'user-3',
      userName: 'Omar Farouk',
      craftsmanTitle: 'Carpenter',
      planTitle: '6 Months Pro Business',
      durationMonths: 6,
      price: 750,
      currency: 'ILS',
      paymentMethod: 'BIT',
      paymentProofUrl: '/receipts/req-3.png',
      status: 'APPROVED',
      createdAt: '2026-09-20T09:00:00.000Z',
    },
    {
      id: 'req-4',
      userId: 'user-4',
      userName: 'Lina Qasim',
      craftsmanTitle: 'Painter',
      planTitle: '3 Month Standard Pass',
      durationMonths: 3,
      price: 420,
      currency: 'ILS',
      paymentMethod: 'BIT',
      paymentProofUrl: '/receipts/req-4.png',
      status: 'REJECTED',
      rejectionReason: 'Receipt unreadable',
      createdAt: '2026-09-18T09:00:00.000Z',
    },
  ];

  private subscribers: B.Subscriber[] = [
    {
      id: 'craft-1',
      name: 'Ahmad Haddad',
      title: 'Electrician',
      subscriptionStatus: 'ACTIVE',
      expiryDate: '2027-03-01T00:00:00.000Z',
      freeTasksRemaining: 0,
      billingModel: 'SUBSCRIPTION',
      commissionLocked: false,
      isAllowedToAcceptTasks: true,
    },
    {
      id: 'craft-2',
      name: 'Sara Nasser',
      title: 'Plumber',
      subscriptionStatus: 'EXPIRED',
      freeTasksRemaining: 2,
      billingModel: null,
      commissionLocked: false,
      isAllowedToAcceptTasks: true,
    },
    {
      id: 'craft-3',
      name: 'Omar Farouk',
      title: 'Carpenter',
      subscriptionStatus: 'ACTIVE',
      expiryDate: '2027-03-15T00:00:00.000Z',
      freeTasksRemaining: 0,
      billingModel: 'COMMISSION',
      commissionLocked: true,
      isAllowedToAcceptTasks: false,
      commissionDue: 336,
    },
    {
      id: 'craft-4',
      name: 'Lina Qasim',
      title: 'Painter',
      subscriptionStatus: 'EXPIRED',
      expiryDate: '2026-08-01T00:00:00.000Z',
      freeTasksRemaining: 0,
      billingModel: 'SUBSCRIPTION',
      commissionLocked: false,
      isAllowedToAcceptTasks: false,
    },
    {
      id: 'craft-5',
      name: 'Khalid Mansour',
      title: 'AC Technician',
      subscriptionStatus: 'ACTIVE',
      expiryDate: '2026-12-01T00:00:00.000Z',
      freeTasksRemaining: 1,
      billingModel: 'SUBSCRIPTION',
      commissionLocked: false,
      isAllowedToAcceptTasks: true,
    },
    {
      id: 'craft-6',
      name: 'Rami Khalil',
      title: 'Mason',
      subscriptionStatus: 'ACTIVE',
      expiryDate: '2027-01-10T00:00:00.000Z',
      freeTasksRemaining: 0,
      billingModel: 'COMMISSION',
      commissionLocked: false,
      isAllowedToAcceptTasks: true,
    },
  ];

  private commissionPayments: B.CommissionPayment[] = [
    {
      id: 'cpay-1',
      craftsmanProfileId: 'craft-3',
      craftsmanName: 'Omar Farouk',
      craftsmanTitle: 'Carpenter',
      commissionLocked: true,
      amount: 336,
      paymentProofUrl: '/receipts/cpay-1.png',
      status: 'PENDING',
      createdAt: '2026-09-27T10:00:00.000Z',
    },
    {
      id: 'cpay-2',
      craftsmanProfileId: 'craft-6',
      craftsmanName: 'Rami Khalil',
      craftsmanTitle: 'Mason',
      commissionLocked: false,
      amount: 120,
      paymentProofUrl: '/receipts/cpay-2.png',
      status: 'PENDING',
      createdAt: '2026-09-29T12:00:00.000Z',
    },
    {
      id: 'cpay-3',
      craftsmanProfileId: 'craft-6',
      craftsmanName: 'Rami Khalil',
      craftsmanTitle: 'Mason',
      commissionLocked: false,
      amount: 96,
      paymentProofUrl: '/receipts/cpay-3.png',
      status: 'APPROVED',
      reviewedAt: '2026-09-20T10:00:00.000Z',
      createdAt: '2026-09-19T10:00:00.000Z',
    },
  ];

  private ledger: B.CommissionLedgerEntry[] = [
    {
      id: 'led-1',
      taskId: 'task-1',
      taskDisplayId: 'SN-0001',
      craftsmanProfileId: 'craft-3',
      craftsmanName: 'Omar Farouk',
      amount: 200,
      rate: 0.08,
      status: 'DUE',
      createdAt: '2026-09-25T10:00:00.000Z',
    },
    {
      id: 'led-2',
      taskId: 'task-2',
      taskDisplayId: 'SN-0002',
      craftsmanProfileId: 'craft-3',
      craftsmanName: 'Omar Farouk',
      amount: 136,
      rate: 0.08,
      status: 'DUE',
      createdAt: '2026-09-26T10:00:00.000Z',
    },
    {
      id: 'led-3',
      taskId: 'task-3',
      taskDisplayId: 'SN-0003',
      craftsmanProfileId: 'craft-6',
      craftsmanName: 'Rami Khalil',
      amount: 120,
      rate: 0.08,
      status: 'DUE',
      createdAt: '2026-09-28T10:00:00.000Z',
    },
    {
      id: 'led-4',
      taskId: 'task-4',
      taskDisplayId: 'SN-0004',
      craftsmanProfileId: 'craft-6',
      craftsmanName: 'Rami Khalil',
      amount: 96,
      rate: 0.08,
      status: 'PAID',
      paymentId: 'cpay-3',
      createdAt: '2026-09-18T10:00:00.000Z',
      paidAt: '2026-09-20T10:00:00.000Z',
    },
    {
      id: 'led-5',
      taskId: 'task-5',
      taskDisplayId: 'SN-0005',
      craftsmanProfileId: 'craft-6',
      craftsmanName: 'Rami Khalil',
      amount: 64,
      rate: 0.08,
      status: 'PAID',
      paymentId: 'cpay-3',
      createdAt: '2026-09-17T10:00:00.000Z',
      paidAt: '2026-09-20T10:00:00.000Z',
    },
  ];

  private bit: B.BitSettings = {
    phoneNumber: '+972 54 929 3073',
    recipientName: 'Sonaa Services',
    instructionsEn: 'Open Bit and send the exact subscription amount to the number above.',
    instructionsAr: 'افتح تطبيق Bit وأرسل قيمة الاشتراك بدقة إلى الرقم أعلاه.',
  };

  private platform: B.PlatformSettings = { freeTasksCount: 3, commissionRate: 0.08, autoVerifyCraftsmen: true };

  private async delay(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  private slice<T>(rows: T[], page: number, limit: number): Page<T> {
    return { items: rows.slice((page - 1) * limit, page * limit), total: rows.length, page, limit };
  }

  private searchHay(r: B.SubscriptionRequest, q: string | undefined): boolean {
    if (!q) return true;
    const needle = q.trim().toLowerCase();
    return [r.userName, r.planTitle, r.userPhone].some((h) => (h || '').toLowerCase().includes(needle));
  }

  async getPlans(): Promise<Result<B.SubscriptionPlan[]>> {
    await this.delay();
    return ok(this.plans.map((p) => ({ ...p })));
  }

  async createPlan(input: B.PlanInput): Promise<Result<B.SubscriptionPlan>> {
    await this.delay();
    if (this.plans.some((p) => p.key === input.key.toUpperCase())) {
      return fail(new ConflictError('A plan with this key already exists'));
    }
    const plan: B.SubscriptionPlan = {
      ...input,
      key: input.key.toUpperCase(),
      id: `plan-${Date.now()}`,
      currency: 'ILS',
      subscribersCount: 0,
      pendingRequests: 0,
    };
    this.plans.push(plan);
    return ok({ ...plan });
  }

  async updatePlan(id: string, input: Partial<B.PlanInput>): Promise<Result<B.SubscriptionPlan>> {
    await this.delay();
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) {
      return fail(new NotFoundError('Plan not found'));
    }
    Object.assign(plan, input);
    return ok({ ...plan });
  }

  async deletePlan(id: string): Promise<Result<boolean>> {
    await this.delay();
    const idx = this.plans.findIndex((p) => p.id === id);
    if (idx < 0) return fail(new NotFoundError('Plan not found'));
    const referenced = this.requests.some((r) => r.planTitle === this.plans[idx].nameEn);
    if (referenced) {
      this.plans[idx].isActive = false;
      return ok(true);
    }
    this.plans.splice(idx, 1);
    return ok(true);
  }

  async getRequests(
    q: B.ListQuery & { status: B.SubscriptionRequestStatus | 'ALL' }
  ): Promise<Result<Page<B.SubscriptionRequest>>> {
    await this.delay();
    const rows = this.requests.filter(
      (r) => (q.status === 'ALL' || r.status === q.status) && this.searchHay(r, q.search)
    );
    return ok(this.slice(rows, q.page, q.limit));
  }

  async approveRequest(id: string): Promise<Result<boolean>> {
    await this.delay();
    const req = this.requests.find((r) => r.id === id);
    if (!req) return fail(new NotFoundError('Request not found'));
    req.status = 'APPROVED';
    return ok(true);
  }

  async rejectRequest(id: string, reason: string): Promise<Result<boolean>> {
    await this.delay();
    const req = this.requests.find((r) => r.id === id);
    if (!req) return fail(new NotFoundError('Request not found'));
    req.status = 'REJECTED';
    req.rejectionReason = reason;
    return ok(true);
  }

  async getSubscribers(
    q: B.ListQuery & { filter: 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired' }
  ): Promise<Result<Page<B.Subscriber>>> {
    await this.delay();
    const isActive = (s: B.Subscriber) =>
      s.subscriptionStatus === 'ACTIVE' && (!s.expiryDate || new Date(s.expiryDate).getTime() > Date.now());
    const rows = this.subscribers.filter((s) => {
      if (q.filter === 'active' && !isActive(s)) return false;
      if (q.filter === 'free' && !(s.freeTasksRemaining > 0)) return false;
      if (q.filter === 'commission' && s.billingModel !== 'COMMISSION') return false;
      if (q.filter === 'locked' && !s.commissionLocked) return false;
      if (q.filter === 'expired' && isActive(s)) return false;
      if (q.search) {
        const needle = q.search.trim().toLowerCase();
        if (![s.name, s.phone, s.email].some((h) => (h || '').toLowerCase().includes(needle))) return false;
      }
      return true;
    });
    return ok(this.slice(rows, q.page, q.limit));
  }

  async extendSubscriber(id: string, days: number): Promise<Result<boolean>> {
    await this.delay();
    const sub = this.subscribers.find((s) => s.id === id);
    if (!sub) return fail(new NotFoundError('Subscriber not found'));
    const base = sub.expiryDate && new Date(sub.expiryDate).getTime() > Date.now() ? new Date(sub.expiryDate) : new Date();
    sub.expiryDate = new Date(base.getTime() + days * 86400000).toISOString();
    sub.subscriptionStatus = 'ACTIVE';
    return ok(true);
  }

  async cancelSubscriber(id: string): Promise<Result<boolean>> {
    await this.delay();
    const sub = this.subscribers.find((s) => s.id === id);
    if (!sub) return fail(new NotFoundError('Subscriber not found'));
    sub.subscriptionStatus = 'EXPIRED';
    sub.expiryDate = new Date().toISOString();
    return ok(true);
  }

  async setFreeTasks(id: string, freeTasksRemaining: number): Promise<Result<boolean>> {
    await this.delay();
    const sub = this.subscribers.find((s) => s.id === id);
    if (!sub) return fail(new NotFoundError('Subscriber not found'));
    sub.freeTasksRemaining = freeTasksRemaining;
    return ok(true);
  }

  async getCommissionPayments(
    q: B.ListQuery & { status: B.CommissionPaymentStatus | 'ALL' }
  ): Promise<Result<Page<B.CommissionPayment>>> {
    await this.delay();
    const rows = this.commissionPayments.filter((p) => {
      if (q.status !== 'ALL' && p.status !== q.status) return false;
      if (q.search) {
        const needle = q.search.trim().toLowerCase();
        if (![p.craftsmanName, p.phone, p.email].some((h) => (h || '').toLowerCase().includes(needle))) return false;
      }
      return true;
    });
    return ok(this.slice(rows, q.page, q.limit));
  }

  async approveCommissionPayment(id: string): Promise<Result<{ unlocked: boolean; settledEntries: number }>> {
    await this.delay();
    const payment = this.commissionPayments.find((p) => p.id === id);
    if (!payment) return fail(new NotFoundError('Payment not found'));
    payment.status = 'APPROVED';
    payment.reviewedAt = new Date().toISOString();
    let settledEntries = 0;
    for (const e of this.ledger) {
      if (e.craftsmanProfileId === payment.craftsmanProfileId && e.status === 'DUE') {
        e.status = 'PAID';
        e.paidAt = new Date().toISOString();
        e.paymentId = payment.id;
        settledEntries += 1;
      }
    }
    const remaining = this.ledger.some(
      (e) => e.craftsmanProfileId === payment.craftsmanProfileId && e.status === 'DUE'
    );
    let unlocked = false;
    if (!remaining) {
      const sub = this.subscribers.find((s) => s.id === payment.craftsmanProfileId);
      if (sub?.commissionLocked) {
        sub.commissionLocked = false;
        unlocked = true;
      }
    }
    return ok({ unlocked, settledEntries });
  }

  async rejectCommissionPayment(id: string, reason: string): Promise<Result<boolean>> {
    await this.delay();
    const payment = this.commissionPayments.find((p) => p.id === id);
    if (!payment) return fail(new NotFoundError('Payment not found'));
    payment.status = 'REJECTED';
    payment.notes = reason;
    return ok(true);
  }

  async getCommissionLedger(
    q: B.ListQuery & { status: B.CommissionLedgerStatus | 'ALL' }
  ): Promise<Result<Page<B.CommissionLedgerEntry> | null>> {
    await this.delay();
    const rows = this.ledger.filter((e) => q.status === 'ALL' || e.status === q.status);
    const page = this.slice(rows, q.page, q.limit);
    const due = this.ledger.filter((e) => e.status === 'DUE').reduce((n, e) => n + e.amount, 0);
    const paid = this.ledger.filter((e) => e.status === 'PAID').reduce((n, e) => n + e.amount, 0);
    return ok({ ...page, totals: { due, paid } });
  }

  async getBitSettings(): Promise<Result<B.BitSettings>> {
    await this.delay();
    return ok({ ...this.bit });
  }

  async updateBitSettings(s: B.BitSettings): Promise<Result<B.BitSettings>> {
    await this.delay();
    this.bit = { ...s };
    return ok({ ...this.bit });
  }

  async getPlatformSettings(): Promise<Result<B.PlatformSettings>> {
    await this.delay();
    return ok({ ...this.platform });
  }

  async updatePlatformSettings(s: Partial<B.PlatformSettings>): Promise<Result<B.PlatformSettings>> {
    await this.delay();
    this.platform = { ...this.platform, ...s };
    return ok({ ...this.platform });
  }

  async getSummary(): Promise<Result<B.BillingSummary | null>> {
    await this.delay();
    return ok({
      pendingReceipts: this.requests.filter((r) => r.status === 'PENDING_VERIFICATION').length,
      pendingCommissionPayments: this.commissionPayments.filter((p) => p.status === 'PENDING').length,
      commissionDueTotal: this.ledger.filter((e) => e.status === 'DUE').reduce((n, e) => n + e.amount, 0),
      lockedCraftsmen: this.subscribers.filter((s) => s.commissionLocked).length,
      activeSubscribers: this.subscribers.filter((s) => s.subscriptionStatus === 'ACTIVE').length,
      pendingWithdrawals: 2,
    });
  }
}
