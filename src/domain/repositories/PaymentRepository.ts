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
  customerProfileId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    role: string;
  };
  plan: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  autoRenew: boolean;
  startDate: string;
  endDate?: string;
}

export interface PaymentRepository {
  getPaymentSummary(): Promise<Result<PaymentSummary>>;
  getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>>;
  createSubscriptionPlan(data: Partial<SubscriptionPlan>): Promise<Result<SubscriptionPlan>>;
  getSubscribers(): Promise<Result<Subscriber[]>>;
  cancelSubscriber(id: string): Promise<Result<boolean>>;
  extendSubscriber(id: string, days?: number): Promise<Result<boolean>>;
  getFailedTransactions(): Promise<Result<FailedTransaction[]>>;
  retryTransaction(id: string): Promise<Result<boolean>>;
  getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>>;
  updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>>;
}
