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
