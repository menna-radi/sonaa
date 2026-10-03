export interface CraftsmanVerifications {
  nationalId: boolean;
  selfieMatch: boolean;
  tradeLicense: boolean;
  bankIban: boolean;
  backgroundCheck: boolean;
  insurance: boolean;
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface CraftsmanBilling {
  freeTasksRemaining: number;
  billingModel: 'SUBSCRIPTION' | 'COMMISSION' | null;
  commissionLocked: boolean;
  subscriptionStatus: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  subscriptionExpiryDate?: string;
  commissionDue?: number;
}

export interface Craftsman {
  id: string;
  name: string;
  trade: string;
  avatarUrl?: string;
  rating: number;
  reviewsCount: number;
  jobsCount: number;
  trustScore: number;
  status: 'online' | 'offline' | 'busy' | 'flagged' | 'suspended' | 'banned';
  accountStatus: AccountStatus;
  billing: CraftsmanBilling | null;
  isAvailable: boolean;
  isVerifiedId: boolean;
  joinedDate: string;
  idNumber: string;
  responseTimeMin: number;
  verifications: CraftsmanVerifications;
}
export default Craftsman;
