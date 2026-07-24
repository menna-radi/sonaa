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
