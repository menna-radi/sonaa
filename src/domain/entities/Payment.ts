export interface PaymentSummary {
  gmvMtd: number;
  gmvChangePct?: number | null;
  netRevenue: number;
  revenueChangePct?: number | null;
  takeRate: number;
  takeRateChangePct?: number | null;
  pendingPayouts: number;
  pendingCraftsmenCount: number;
  mrr: number;
}

export interface WithdrawalRequest {
  id: string;
  craftsmanName: string;
  craftsmanProfileId?: string;
  method: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  referenceId?: string;
}

export interface WithdrawalQuery {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'ALL';
  page: number;
  limit: number;
}

/** @deprecated Removed in T-F040: legacy payout shapes kept for the old payments UI. */
export interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  key?: string;
  durationMonths?: number;
  price: number;
  featuresEn?: string[];
  featuresAr?: string[];
  isPopular?: boolean;
  subscribersCount: number;
}

/** @deprecated Removed in T-F040. */
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

/** @deprecated Removed in T-F040: use WithdrawalRequest instead. */
export interface LegacyWithdrawalRequest {
  id: string;
  name: string;
  bank: string;
  timeAgo: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}
