export interface CraftsmanVerifications {
  nationalId: boolean;
  selfieMatch: boolean;
  tradeLicense: boolean;
  bankIban: boolean;
  backgroundCheck: boolean;
  insurance: boolean;
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
  status: 'online' | 'offline' | 'busy' | 'flagged' | 'suspended';
  joinedDate: string;
  idNumber: string;
  responseTimeMin: number;
  verifications: CraftsmanVerifications;
  earnings30Days: number;
  earningsChangePct: number;
  earningsSparkline: number[];
}
export default Craftsman;
