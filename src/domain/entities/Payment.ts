export interface PaymentSummary {
  gmvMtd: number;
  gmvChangePct: number;
  netRevenue: number;
  revenueChangePct: number;
  takeRate: number;
  takeRateChangePct: number;
  pendingPayouts: number;
  pendingCraftsmenCount: number;
  mrr: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  subscribersCount: number;
}

export interface FailedTransaction {
  id: string;
  name: string;
  txId: string;
  bank: string;
  timeAgo: string;
  amount: number;
  reasonKey: string;
  retries: number;
}

export interface WithdrawalRequest {
  id: string;
  name: string;
  bank: string;
  timeAgo: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}
