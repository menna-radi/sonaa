export interface Submission {
  id: string;
  name: string;
  role: string;
  submittedAgo: string;
  avatar?: string;
  idFrontUrl?: string;
  selfieUrl?: string;
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

  // 5-Step Flow Fields
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

export type VerificationTab =
  | 'national_id'
  | 'face_match'
  | 'skills'
  | 'portfolio'
  | 'profile_info'
  | 'review_decision';
