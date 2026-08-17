import { Result } from '../../core/result/Result';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
} from '../entities/Payment';

export type {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
};

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
  getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>>;
  createSubscriptionPlan(data: any): Promise<Result<SubscriptionPlan>>;
  updateSubscriptionPlan(id: string, data: any): Promise<Result<SubscriptionPlan>>;
  deleteSubscriptionPlan(id: string): Promise<Result<boolean>>;
  getSubscriptionRequests(statusFilter?: string): Promise<Result<SubscriptionRequestItem[]>>;
  approveSubscriptionRequest(requestId: string): Promise<Result<boolean>>;
  rejectSubscriptionRequest(requestId: string, reason: string): Promise<Result<boolean>>;
  getBitSettings(): Promise<Result<Record<string, string>>>;
  updateBitSettings(settings: Record<string, string>): Promise<Result<Record<string, string>>>;
  getSubscribers(): Promise<Result<Subscriber[]>>;
  cancelSubscriber(id: string): Promise<Result<boolean>>;
  extendSubscriber(id: string, days?: number): Promise<Result<boolean>>;
  getFailedTransactions(): Promise<Result<FailedTransaction[]>>;
  retryTransaction(id: string): Promise<Result<boolean>>;
  getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>>;
  updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>>;
}
