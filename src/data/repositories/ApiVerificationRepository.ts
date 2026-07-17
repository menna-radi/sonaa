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
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.verificationQueue);
      
      const mapped: VerificationRequest[] = (response.submissions || []).map((r: any, index: number) => {
        const craftsman = r.craftsmanProfile;
        const name = craftsman ? `${craftsman.firstName} ${craftsman.lastName}` : 'Unknown Craftsman';
        return {
          id: r.id,
          name,
          role: craftsman?.title || 'Craftsman',
          submittedAgo: 'Recently',
          avatar: craftsman?.avatarUrl || undefined,
          verificationId: `#VR-${r.id.substring(0, 4)}`,
          faceScore: Math.round((r.faceMatchScore || 0.9) * 100),
          docsCount: `${r.completedStepsCount || 3}/7`,
          risk: r.faceMatchScore && r.faceMatchScore < 0.7 ? 'High' : 'Low',
          status: r.status === 'FLAGGED' ? 'flagged' : (index % 2 === 0 ? 'pending' : 'today'),
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
      await apiClient.post<void>(API_ENDPOINTS.admin.verificationModerate, {
        requestId,
        decision,
        moderatorNotes,
      });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiVerificationRepository;
