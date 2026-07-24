import { Result } from '../../core/result/Result';

export interface VerificationRequest {
  id: string;
  name: string;
  role: string;
  submittedAgo: string;
  avatar?: string;
  verificationId: string;
  faceScore: number;
  docsCount: string;
  risk: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'flagged' | 'today';
  city?: string;
  skills?: string[];
  isVerifiedId?: boolean;
  isVerifiedCert?: boolean;
  isInsured?: boolean;
  isVerifiedSelfie?: boolean;
  isVerifiedBankIban?: boolean;
  isVerifiedBackground?: boolean;
  phoneNumber?: string;
  email?: string;
  deviceOs?: string;
  appVersion?: string;
  registeredDate?: string;
}

export interface VerificationRepository {
  getVerificationQueue(): Promise<Result<VerificationRequest[]>>;
  moderateVerification(
    requestId: string,
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED',
    moderatorNotes: string
  ): Promise<Result<boolean>>;
  getAutoVerification(): Promise<Result<{ enabled: boolean }>>;
  toggleAutoVerification(enabled: boolean): Promise<Result<{ enabled: boolean }>>;
}
