import { Result } from '../../core/result/Result';
import type { Page } from '../../data/mappers/pageMapper';
import { PaymentSummary, WithdrawalRequest, WithdrawalQuery } from '../entities/Payment';

export type { PaymentSummary, WithdrawalRequest };

export interface PaymentRepository {
  getPaymentSummary(): Promise<Result<PaymentSummary>>;
  getWithdrawals(q: WithdrawalQuery): Promise<Result<Page<WithdrawalRequest>>>;
  approveWithdrawal(id: string): Promise<Result<boolean>>;
  rejectWithdrawal(id: string): Promise<Result<boolean>>;
  retryWithdrawal(id: string): Promise<Result<boolean>>;
}
