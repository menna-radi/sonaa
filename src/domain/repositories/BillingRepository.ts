import type { Result } from '../../core/result/Result';
import type { Page } from '../../data/mappers/pageMapper';
import type * as B from '../entities/Billing';

export interface BillingRepository {
  getPlans(): Promise<Result<B.SubscriptionPlan[]>>;
  createPlan(input: B.PlanInput): Promise<Result<B.SubscriptionPlan>>;
  updatePlan(id: string, input: Partial<B.PlanInput>): Promise<Result<B.SubscriptionPlan>>;
  deletePlan(id: string): Promise<Result<boolean>>;

  getRequests(
    q: B.ListQuery & { status: B.SubscriptionRequestStatus | 'ALL' }
  ): Promise<Result<Page<B.SubscriptionRequest>>>;
  approveRequest(id: string): Promise<Result<boolean>>;
  rejectRequest(id: string, reason: string): Promise<Result<boolean>>;

  getSubscribers(
    q: B.ListQuery & { filter: 'all' | 'active' | 'free' | 'commission' | 'locked' | 'expired' }
  ): Promise<Result<Page<B.Subscriber>>>;
  extendSubscriber(id: string, days: number): Promise<Result<boolean>>;
  cancelSubscriber(id: string): Promise<Result<boolean>>;
  setFreeTasks(id: string, freeTasksRemaining: number): Promise<Result<boolean>>;

  getCommissionPayments(
    q: B.ListQuery & { status: B.CommissionPaymentStatus | 'ALL' }
  ): Promise<Result<Page<B.CommissionPayment>>>;
  approveCommissionPayment(id: string): Promise<Result<{ unlocked: boolean; settledEntries: number }>>;
  rejectCommissionPayment(id: string, reason: string): Promise<Result<boolean>>;
  /** null = backend does not offer the ledger endpoint (B05) → UI hides the tab. */
  getCommissionLedger(
    q: B.ListQuery & { status: B.CommissionLedgerStatus | 'ALL' }
  ): Promise<Result<Page<B.CommissionLedgerEntry> | null>>;

  getBitSettings(): Promise<Result<B.BitSettings>>;
  updateBitSettings(s: B.BitSettings): Promise<Result<B.BitSettings>>;
  getPlatformSettings(): Promise<Result<B.PlatformSettings>>;
  updatePlatformSettings(s: Partial<B.PlatformSettings>): Promise<Result<B.PlatformSettings>>;
  /** null = backend does not offer /admin/counts or summary blocks (B09/B10). */
  getSummary(): Promise<Result<B.BillingSummary | null>>;
}
