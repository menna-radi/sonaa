import { VerificationRepository, VerificationRequest } from '../../domain/repositories/VerificationRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS, API_BASE_URL } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';
import { storageService } from '../../core/storage/StorageService';

interface ApiSkillDTO {
  name?: string;
  category?: string;
  bio?: string;
}

interface ApiProfileDTO {
  title?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  trustScore?: number | string;
  isVerifiedId?: boolean;
  isVerifiedCert?: boolean;
  isInsured?: boolean;
  isVerifiedSelfie?: boolean;
  isVerifiedBankIban?: boolean;
  isVerifiedBackground?: boolean;
  locationCity?: string;
  yearsExperience?: number;
  bio?: string;
  skills?: ApiSkillDTO[];
  user?: { firstName?: string; lastName?: string; phoneNumber?: string; email?: string; createdAt?: string };
}

interface ApiSubmissionDTO {
  id: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  completedStepsCount?: number;
  submittedAt?: string;
  slaDeadline?: string;
  moderatorNotes?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  residentialAddress?: string;
  emergencyContactPhone?: string;
  idFrontImageUrl?: string;
  idBackImageUrl?: string;
  idDocumentType?: string;
  ocrDetectedName?: string;
  ocrConfidence?: number;
  idExpiryDate?: string;
  selfieImageUrl?: string;
  faceMatchScore?: number | string;
  livenessPassed?: boolean;
  certImageUrl?: string;
  certAuthority?: string;
  insuranceLimit?: number | string;
  craftsmanProfile?: ApiProfileDTO;
}

interface ApiQueueResponse {
  submissions?: ApiSubmissionDTO[];
}

const toPercent = (v?: number | string | null): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  if (Number.isNaN(n)) return undefined;
  return n <= 1 ? Math.round(n * 100) : Math.min(100, Math.round(n));
};

const resolveImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
    const hostBase = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    fullUrl = `${hostBase}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  const token = storageService.getToken();
  if (token && fullUrl.includes('/api/v1/uploads/') && !fullUrl.includes('token=')) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
  }
  return fullUrl;
};

const mapSubmission = (sub: ApiSubmissionDTO): VerificationRequest => {
  const profile = sub.craftsmanProfile ?? {};
  const user = profile.user ?? {};
  const firstName = sub.firstName || profile.firstName || user.firstName || '';
  const lastName = sub.lastName || profile.lastName || user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const trustScore = profile.trustScore !== undefined && profile.trustScore !== null ? Number(profile.trustScore) : undefined;
  const lowTrust = trustScore !== undefined && !Number.isNaN(trustScore) && trustScore < 0.85;
  const isVerified = Boolean(profile.isVerifiedId || sub.status === 'APPROVED');
  const completedSteps = isVerified ? 5 : sub.completedStepsCount ?? 0;
  const faceMatchScore = toPercent(sub.faceMatchScore);

  let status: VerificationRequest['status'] = 'pending';
  if (isVerified) status = 'today';
  else if (sub.status === 'FLAGGED' || lowTrust) status = 'flagged';

  return {
    id: sub.id,
    name: fullName,
    role: profile.title || profile.skills?.[0]?.name || '',
    submittedAgo: '',
    avatar: resolveImageUrl(profile.avatarUrl) || resolveImageUrl(sub.selfieImageUrl),
    verificationId: `#VR-${sub.id.substring(0, 4).toUpperCase()}`,
    faceScore: faceMatchScore ?? 0,
    docsCount: `${completedSteps}/5`,
    risk: lowTrust ? 'High' : 'Low',
    status,
    isVerifiedId: isVerified,
    isVerifiedCert: Boolean(profile.isVerifiedCert || sub.certImageUrl),
    isInsured: Boolean(profile.isInsured),
    isVerifiedSelfie: Boolean(profile.isVerifiedSelfie || sub.selfieImageUrl),
    isVerifiedBankIban: Boolean(profile.isVerifiedBankIban),
    isVerifiedBackground: Boolean(profile.isVerifiedBackground),
    city: profile.locationCity,
    phoneNumber: user.phoneNumber || sub.emergencyContactPhone,
    email: user.email,
    registeredDate: user.createdAt,
    skills: profile.skills?.map((s) => s.name || s.category || '').filter(Boolean) ?? [],

    // 5-Step Flow Fields
    completedStepsCount: completedSteps,
    totalSteps: 5,
    verificationStatus: isVerified ? 'APPROVED' : sub.status,

    // Step 1: Personal Info
    firstName,
    lastName,
    dateOfBirth: sub.dateOfBirth,
    gender: sub.gender,
    nationality: sub.nationality,
    residentialAddress: sub.residentialAddress || profile.locationCity,
    emergencyContactPhone: sub.emergencyContactPhone || user.phoneNumber,

    // Step 2: National ID Document
    idFrontImageUrl: resolveImageUrl(sub.idFrontImageUrl),
    idBackImageUrl: resolveImageUrl(sub.idBackImageUrl),
    idDocumentType: sub.idDocumentType,
    ocrDetectedName: sub.ocrDetectedName,
    ocrConfidence: sub.ocrConfidence,
    idExpiryDate: sub.idExpiryDate,

    // Step 3: Selfie Verification
    selfieImageUrl: resolveImageUrl(sub.selfieImageUrl),
    faceMatchScore,
    livenessPassed: sub.livenessPassed,

    // Step 4: Skills & Certifications
    tradeCategory: profile.skills?.[0]?.category || profile.title,
    yearsExperience: profile.yearsExperience,
    bio: profile.bio || profile.skills?.[0]?.bio,
    certImageUrl: resolveImageUrl(sub.certImageUrl),
    certAuthority: sub.certAuthority,
    insuranceLimit: sub.insuranceLimit ? Number(sub.insuranceLimit) : undefined,

    // Step 5: Review & Decision
    submittedAt: sub.submittedAt,
    slaDeadline: sub.slaDeadline,
    moderatorNotes: sub.moderatorNotes || '',
  };
};

export class ApiVerificationRepository implements VerificationRepository {
  public async getVerificationQueue(): Promise<Result<VerificationRequest[]>> {
    try {
      const queueRes = await apiClient.get<ApiQueueResponse>(`${API_ENDPOINTS.admin.verificationQueue}?status=ALL&limit=100`);
      const submissions = Array.isArray(queueRes?.submissions) ? queueRes.submissions : [];
      return ok(submissions.map(mapSubmission));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async moderateVerification(
    requestId: string,
    decision: 'APPROVED' | 'REJECTED' | 'FLAGGED',
    moderatorNotes: string
  ): Promise<Result<boolean>> {
    try {
      const notes = moderatorNotes?.trim() || 'Approved by admin';
      await apiClient.post<void>(API_ENDPOINTS.admin.verificationModerate, {
        requestId,
        decision,
        moderatorNotes: notes,
      });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
  public async getAutoVerification(): Promise<Result<{ enabled: boolean }>> {
    try {
      const response = await apiClient.get<{ enabled: boolean }>('/admin/settings/auto-verification');
      return ok(response);
    } catch {
      return ok({ enabled: true });
    }
  }

  public async toggleAutoVerification(enabled: boolean): Promise<Result<{ enabled: boolean }>> {
    try {
      const response = await apiClient.put<{ enabled: boolean }>('/admin/settings/auto-verification', { enabled });
      return ok(response);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiVerificationRepository;
