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

export interface PaymentRepository {
  getPaymentSummary(): Promise<Result<PaymentSummary>>;
  getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>>;
  getFailedTransactions(): Promise<Result<FailedTransaction[]>>;
  retryTransaction(id: string): Promise<Result<boolean>>;
  getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>>;
  updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>>;
}
