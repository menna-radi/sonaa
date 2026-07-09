import { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import type {
  PaymentSummary,
  SubscriptionPlan,
  FailedTransaction,
  WithdrawalRequest
} from '../../../../domain/repositories/PaymentRepository';

export const usePayments = () => {
  const { dependencies } = useDependencies();
  const { paymentRepository } = dependencies;

  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [failedTransactions, setFailedTransactions] = useState<FailedTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadPaymentsData = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    try {
      const [summaryRes, plansRes, failedRes, withdrawalRes] = await Promise.all([
        paymentRepository.getPaymentSummary(),
        paymentRepository.getSubscriptionPlans(),
        paymentRepository.getFailedTransactions(),
        paymentRepository.getWithdrawalRequests()
      ]);

      if (summaryRes.success && plansRes.success && failedRes.success && withdrawalRes.success) {
        setSummary(summaryRes.data);
        setPlans(plansRes.data);
        setFailedTransactions(failedRes.data);
        setWithdrawalRequests(withdrawalRes.data);
      } else {
        const firstError = 
          (!summaryRes.success ? summaryRes.error : null) ||
          (!plansRes.success ? plansRes.error : null) ||
          (!failedRes.success ? failedRes.error : null) ||
          (!withdrawalRes.success ? withdrawalRes.error : null);
        setError(firstError?.message || 'Connection to payments node lost.');
      }
    } catch (err: unknown) {
      console.error('Failed to load payments telemetry nodes:', err);
      const errMsg = err instanceof Error ? err.message : 'Connection to payments node lost.';
      setError(errMsg);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [paymentRepository]);

  const handleRetry = useCallback(async (id: string) => {
    setRetryingId(id);
    try {
      const result = await paymentRepository.retryTransaction(id);
      if (result.success && result.data) {
        // Refresh failed transactions and summary
        const failedRes = await paymentRepository.getFailedTransactions();
        if (failedRes.success) {
          setFailedTransactions(failedRes.data);
        } else {
          setError(failedRes.error.message || 'Failed to refresh failed transactions.');
        }
      } else if (!result.success) {
        setError(result.error.message || 'Retry command failed.');
      }
    } catch (err: unknown) {
      console.error(`Failed to retry transaction ${id}:`, err);
      const errMsg = err instanceof Error ? err.message : 'Retry command failed.';
      setError(errMsg);
    } finally {
      setRetryingId(null);
    }
  }, [paymentRepository]);

  const handleUpdateWithdrawalStatus = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    try {
      const result = await paymentRepository.updateWithdrawalStatus(id, status);
      if (result.success) {
        setWithdrawalRequests(prev => prev.map(w => w.id === id ? result.data : w));
      } else {
        setError(result.error.message || 'Update payout status failed.');
      }
    } catch (err: unknown) {
      console.error(`Failed to update withdrawal status for request ${id}:`, err);
      const errMsg = err instanceof Error ? err.message : 'Update payout status failed.';
      setError(errMsg);
    }
  }, [paymentRepository]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (active) {
        await loadPaymentsData(true);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [loadPaymentsData]);

  return {
    summary,
    plans,
    failedTransactions,
    withdrawalRequests,
    loading,
    error,
    retryingId,
    refresh: () => loadPaymentsData(true),
    onRetry: handleRetry,
    onApprove: (id: string) => handleUpdateWithdrawalStatus(id, 'approved'),
    onReject: (id: string) => handleUpdateWithdrawalStatus(id, 'rejected')
  };
};

export default usePayments;
