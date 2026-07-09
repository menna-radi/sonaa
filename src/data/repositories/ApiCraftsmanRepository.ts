import { CraftsmanRepository } from '../../domain/repositories/CraftsmanRepository';
import { Craftsman } from '../../domain/entities/Craftsman';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError, UnknownError } from '../../core/errors/AppError';

interface ApiCraftsmanDTO {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  locationCity: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  yearsExperience: number;
}

interface PaginatedCraftsmenResponse {
  results: ApiCraftsmanDTO[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}

export class ApiCraftsmanRepository implements CraftsmanRepository {
  public async getCraftsmen(): Promise<Result<Craftsman[]>> {
    try {
      const response = await apiClient.get<PaginatedCraftsmenResponse>(API_ENDPOINTS.craftsmen.list);
      
      const mapped: Craftsman[] = response.results.map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        trade: c.title,
        rating: c.rating,
        reviewsCount: c.totalReviews,
        jobsCount: 0, // Missing field in backend API response
        trustScore: 100, // Missing field in backend API response
        status: c.isAvailable ? 'online' : 'offline', // status mapping based on availability
        joinedDate: '—', // Missing field in backend API response
        idNumber: '—', // Missing field in backend API response
        responseTimeMin: 0, // Missing field in backend API response
        verifications: {
          nationalId: false, // Missing field in backend API response
          selfieMatch: false, // Missing field in backend API response
          tradeLicense: false, // Missing field in backend API response
          bankIban: false, // Missing field in backend API response
          backgroundCheck: false, // Missing field in backend API response
          insurance: false, // Missing field in backend API response
        },
        earnings30Days: 0, // Missing field in backend API response
        earningsChangePct: 0, // Missing field in backend API response
        earningsSparkline: [], // Missing field in backend API response
      }));

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async suspendCraftsman(_id: string): Promise<Result<Craftsman>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async banCraftsman(_id: string): Promise<Result<Craftsman>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }
}
export default ApiCraftsmanRepository;
