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
      const response = await apiClient.get<PaginatedVerificationResponse>(API_ENDPOINTS.admin.verificationQueue);
      
      const mapped: VerificationRequest[] = response.results.map((r, index) => {
        const name = r.craftsman ? `${r.craftsman.firstName} ${r.craftsman.lastName}` : 'Unknown Craftsman';
        return {
          id: r.id,
          name,
          role: 'Craftsman',
          submittedAgo: 'Recently', // Backend does not return relative time format
          avatar: r.craftsman?.avatarUrl,
          verificationId: `#VR-${r.id.substring(0, 4)}`,
          faceScore: 90, // Missing field in backend API response
          docsCount: '7/7', // Missing field in backend API response
          risk: 'Low', // Missing field in backend API response
          status: index % 3 === 0 ? 'pending' : (index % 3 === 1 ? 'flagged' : 'today'),
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
