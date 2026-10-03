export type BillingModel = 'SUBSCRIPTION' | 'COMMISSION';
export type CraftsmanSubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
export type SubscriptionRequestStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type CommissionPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CommissionLedgerStatus = 'DUE' | 'PAID';

export interface SubscriptionPlan {
  id: string;
  key: string;
  nameEn: string;
  nameAr: string;
  durationMonths: number;
  price: number;
  currency: 'ILS';
  featuresEn: string[];
  featuresAr: string[];
  isPopular: boolean;
  isActive: boolean;
  subscribersCount?: number;
  pendingRequests?: number;
}

export interface PlanInput {
  key: string;
  nameEn: string;
  nameAr: string;
  durationMonths: number;
  price: number;
  featuresEn: string[];
  featuresAr: string[];
  isPopular: boolean;
  isActive: boolean;
}

export interface SubscriptionRequest {
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
  status: SubscriptionRequestStatus;
  chatRoomId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  userId?: string;
  subscriptionStatus: CraftsmanSubscriptionStatus;
  startDate?: string;
  expiryDate?: string;
  freeTasksRemaining: number;
  billingModel: BillingModel | null;
  commissionLocked: boolean;
  isAllowedToAcceptTasks: boolean;
  commissionDue?: number;
}

export interface CommissionPayment {
  id: string;
  craftsmanProfileId: string;
  craftsmanName: string;
  craftsmanTitle: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  commissionLocked: boolean;
  amount: number;
  paymentProofUrl: string;
  notes?: string;
  status: CommissionPaymentStatus;
  reviewedAt?: string;
  createdAt: string;
  ledgerEntries?: { id: string; taskDisplayId?: string; amount: number }[];
}

export interface CommissionLedgerEntry {
  id: string;
  taskId: string;
  taskDisplayId?: string;
  craftsmanProfileId: string;
  craftsmanName?: string;
  amount: number;
  rate: number;
  status: CommissionLedgerStatus;
  paymentId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface BitSettings {
  phoneNumber: string;
  recipientName: string;
  instructionsEn: string;
  instructionsAr: string;
}

export interface PlatformSettings {
  freeTasksCount: number;
  commissionRate: number;
  autoVerifyCraftsmen: boolean;
}

export interface BillingSummary {
  pendingReceipts: number;
  pendingCommissionPayments: number;
  commissionDueTotal: number;
  lockedCraftsmen: number;
  activeSubscribers: number;
  pendingWithdrawals: number;
}

export interface ListQuery {
  page: number;
  limit: number;
  search?: string;
}
