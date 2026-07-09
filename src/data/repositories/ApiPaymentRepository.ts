import { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
} from '../../domain/entities/Payment';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { ApiResponse } from '../../core/network/ApiResponse';
import { AppError } from '../../core/errors/AppError';

export class ApiPaymentRepository implements PaymentRepository {
  public async getPaymentSummary(): Promise<Result<PaymentSummary>> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentSummary>>(API_ENDPOINTS.payments.summary);
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getSubscriptionPlans(): Promise<Result<SubscriptionPlan[]>> {
    try {
      const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>(API_ENDPOINTS.payments.plans);
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getFailedTransactions(): Promise<Result<FailedTransaction[]>> {
    try {
      const response = await apiClient.get<ApiResponse<FailedTransaction[]>>(API_ENDPOINTS.payments.failedTransactions);
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async retryTransaction(id: string): Promise<Result<boolean>> {
    try {
      const response = await apiClient.post<ApiResponse<boolean>>(API_ENDPOINTS.payments.retryTransaction(id));
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async getWithdrawalRequests(): Promise<Result<WithdrawalRequest[]>> {
    try {
      const response = await apiClient.get<ApiResponse<WithdrawalRequest[]>>(API_ENDPOINTS.payments.withdrawalRequests);
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async updateWithdrawalStatus(id: string, status: 'approved' | 'rejected'): Promise<Result<WithdrawalRequest>> {
    try {
      const response = await apiClient.put<ApiResponse<WithdrawalRequest>>(
        API_ENDPOINTS.payments.updateWithdrawalStatus(id),
        { status }
      );
      return ok(response.data);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiPaymentRepository;
