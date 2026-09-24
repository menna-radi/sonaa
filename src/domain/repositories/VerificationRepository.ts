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

  // 5-Step Verification Flow
  completedStepsCount?: number;
  totalSteps?: number;
  verificationStatus?: string;

  // Step 1: Personal Info
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  residentialAddress?: string;
  emergencyContactPhone?: string;

  // Step 2: National ID
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  idDocumentType?: string;
  ocrDetectedName?: string;
  ocrConfidence?: number;
  idExpiryDate?: string;

  // Step 3: Selfie & Liveness
  selfieImageUrl?: string;
  faceMatchScore?: number;
  livenessPassed?: boolean;

  // Step 4: Skills & Certifications
  tradeCategory?: string;
  yearsExperience?: number;
  bio?: string;
  certImageUrl?: string;
  certAuthority?: string;
  insuranceLimit?: number;

  // Step 5: Review & Decision
  submittedAt?: string;
  slaDeadline?: string;
  moderatorNotes?: string;
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
