import { Result } from '../../core/result/Result';
import type { Page } from '../../data/mappers/pageMapper';
import {
  PaymentSummary,
  WithdrawalRequest,
  WithdrawalQuery,
  SubscriptionPlan,
  FailedTransaction,
  LegacyWithdrawalRequest,
} from '../entities/Payment';

/** @deprecated Removed in T-F040: legacy payout types kept for the old payments UI. */
export type { PaymentSummary, SubscriptionPlan, FailedTransaction, WithdrawalRequest, LegacyWithdrawalRequest };

export interface Subscriber {
  id: string;
  craftsmanName?: string;
  craftsmanTitle?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
  };
  subscriptionStatus: string;
  startDate?: string;
  expiryDate?: string;
  isAllowedToAcceptTasks?: boolean;
}

export interface SubscriptionRequestItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  craftsmanTitle: string;
  avatarUrl?: string;
  planTitle: string;
  durationMonths: number;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentProofUrl: string;
  notes?: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  chatRoomId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface PaymentRepository {
  getPaymentSummary(): Promise<Result<PaymentSummary>>;
  getWithdrawals(q: WithdrawalQuery): Promise<Result<Page<WithdrawalRequest>>>;
  approveWithdrawal(id: string): Promise<Result<boolean>>;
  rejectWithdrawal(id: string): Promise<Result<boolean>>;
  retryWithdrawal(id: string): Promise<Result<boolean>>;

  /** @deprecated Removed in T-F040. */
  getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>>;
  /** @deprecated Removed in T-F040. */
  createSubscriptionPlan(data: Record<string, unknown>): Promise<Result<SubscriptionPlan>>;
  /** @deprecated Removed in T-F040. */
  updateSubscriptionPlan(id: string, data: Record<string, unknown>): Promise<Result<SubscriptionPlan>>;
  /** @deprecated Removed in T-F040. */
  deleteSubscriptionPlan(id: string): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  getSubscriptionRequests(statusFilter?: string): Promise<Result<SubscriptionRequestItem[]>>;
  /** @deprecated Removed in T-F040. */
  approveSubscriptionRequest(requestId: string): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  rejectSubscriptionRequest(requestId: string, reason: string): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  getBitSettings(): Promise<Result<Record<string, string>>>;
  /** @deprecated Removed in T-F040. */
  updateBitSettings(settings: Record<string, string>): Promise<Result<Record<string, string>>>;
  /** @deprecated Removed in T-F040. */
  getSubscribers(): Promise<Result<Subscriber[]>>;
  /** @deprecated Removed in T-F040. */
  cancelSubscriber(id: string): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  extendSubscriber(id: string, days?: number): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  getFailedTransactions(): Promise<Result<FailedTransaction[]>>;
  /** @deprecated Removed in T-F040. */
  retryTransaction(id: string): Promise<Result<boolean>>;
  /** @deprecated Removed in T-F040. */
  getWithdrawalRequests(): Promise<Result<LegacyWithdrawalRequest[]>>;
  /** @deprecated Removed in T-F040. */
  updateWithdrawalStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<Result<LegacyWithdrawalRequest>>;
}
