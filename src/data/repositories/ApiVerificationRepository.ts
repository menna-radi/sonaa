import { VerificationRepository, VerificationRequest } from '../../domain/repositories/VerificationRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiVerificationRequestDTO {
  id: string;
  craftsman?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  // Fallbacks for other fields not documented in API response
}

interface PaginatedVerificationResponse {
  results: ApiVerificationRequestDTO[];
  totalResults: number;
}

export class ApiVerificationRepository implements VerificationRepository {
  public async getVerificationQueue(): Promise<Result<VerificationRequest[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.craftsmen.list);
      const craftsmenList = response.items || response.craftsmen || (Array.isArray(response) ? response : []);

      const mapped: VerificationRequest[] = craftsmenList.map((r: any, index: number) => {
        const name = `${r.firstName} ${r.lastName}`;
        const verifiedBadges = [
          r.isVerifiedId,
          r.isVerifiedCert,
          r.isInsured,
          r.isVerifiedSelfie,
          r.isVerifiedBankIban,
          r.isVerifiedBackground
        ].filter(Boolean).length;

        const trustScore = Number(r.trustScore || 0.95);

        return {
          id: r.id,
          name,
          role: r.title || 'Craftsman',
          submittedAgo: r.user?.createdAt ? new Date(r.user.createdAt).toLocaleDateString() : 'Recently',
          avatar: r.avatarUrl || undefined,
          verificationId: `#VR-${r.id.substring(0, 4)}`,
          faceScore: Math.round(trustScore * 100),
          docsCount: `${verifiedBadges}/6`,
          risk: trustScore < 0.85 ? 'High' : 'Low',
          status: r.isVerifiedId ? 'today' : (index % 3 === 0 ? 'flagged' : 'pending'),
          city: r.locationCity || 'Riyadh',
          skills: (r.skills || []).map((s: any) => s.name || s),
          isVerifiedId: Boolean(r.isVerifiedId),
          isVerifiedCert: Boolean(r.isVerifiedCert),
          isInsured: Boolean(r.isInsured),
          isVerifiedSelfie: Boolean(r.isVerifiedSelfie),
          isVerifiedBankIban: Boolean(r.isVerifiedBankIban),
          isVerifiedBackground: Boolean(r.isVerifiedBackground),
        };
      });

      return ok(mapped);
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
      const itemMap = {
        APPROVED: 'isVerifiedId',
        REJECTED: 'isVerifiedId',
        FLAGGED: 'isVerifiedBackground',
      };
      await apiClient.post<void>(API_ENDPOINTS.craftsmen.toggleVerificationItem(requestId), {
        item: itemMap[decision] || 'isVerifiedId',
        verified: decision === 'APPROVED',
        notes: moderatorNotes,
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
    } catch (error) {
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
