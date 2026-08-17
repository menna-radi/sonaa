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
  total: number;
  page: number;
  limit: number;
  items: any[];
}

export class ApiCraftsmanRepository implements CraftsmanRepository {
  private mapBackendCraftsmanToDomain(c: any): Craftsman {
    let status: Craftsman['status'] = 'offline';
    if (c.user?.status === 'SUSPENDED' || c.user?.status === 'BLOCKED') {
      status = 'suspended';
    } else {
      status = c.isAvailable ? 'online' : 'offline';
    }

    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      trade: c.title || 'Craftsman',
      avatarUrl: c.avatarUrl || undefined,
      rating: Number(c.rating || 5),
      reviewsCount: c.completedTasksCount || 0,
      jobsCount: c.completedTasksCount || 0,
      trustScore: Math.round((c.trustScore || 1.0) * 100),
      status,
      joinedDate: c.user?.createdAt ? new Date(c.user.createdAt).toLocaleDateString() : '—',
      idNumber: c.user?.phoneNumber || '—',
      responseTimeMin: c.responseTimeMinutes || 15,
      verifications: {
        nationalId: !!c.isVerifiedId,
        selfieMatch: !!c.isVerifiedSelfie,
        tradeLicense: !!c.isVerifiedCert,
        bankIban: !!c.isVerifiedBankIban,
        backgroundCheck: !!c.isVerifiedBackground,
        insurance: !!c.isInsured,
      },
      earnings30Days: 0,
      earningsChangePct: 0,
      earningsSparkline: [],
    };
  }

  public async getCraftsmen(): Promise<Result<Craftsman[]>> {
    try {
      const response = await apiClient.get<PaginatedCraftsmenResponse>(API_ENDPOINTS.craftsmen.list);
      const domainCraftsmen = (response.items || []).map(item => this.mapBackendCraftsmanToDomain(item));
      return ok(domainCraftsmen);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async suspendCraftsman(id: string, reason?: string): Promise<Result<Craftsman>> {
    try {
      await apiClient.put<any>(API_ENDPOINTS.craftsmen.suspend(id), { reason });
      const listResult = await this.getCraftsmen();
      if (listResult.success) {
        const found = listResult.data.find(c => c.id === id);
        if (found) return ok(found);
      }
      return fail(new UnknownError('Failed to retrieve updated craftsman profile after suspension.'));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async unsuspendCraftsman(id: string): Promise<Result<Craftsman>> {
    try {
      await apiClient.put<any>(API_ENDPOINTS.craftsmen.unsuspend(id));
      const listResult = await this.getCraftsmen();
      if (listResult.success) {
        const found = listResult.data.find(c => c.id === id);
        if (found) return ok(found);
      }
      return fail(new UnknownError('Failed to retrieve updated craftsman profile after unsuspension.'));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async banCraftsman(id: string): Promise<Result<Craftsman>> {
    try {
      await apiClient.put<any>(API_ENDPOINTS.craftsmen.ban(id));
      const listResult = await this.getCraftsmen();
      if (listResult.success) {
        const found = listResult.data.find(c => c.id === id);
        if (found) return ok(found);
      }
      return fail(new UnknownError('Failed to retrieve updated craftsman profile after banning.'));
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async toggleVerificationItem(id: string, itemKey: string, approved: boolean): Promise<Result<Craftsman>> {
    try {
      await apiClient.post<any>(API_ENDPOINTS.craftsmen.toggleVerificationItem(id), { itemKey, approved });
      const listResult = await this.getCraftsmen();
      if (listResult.success) {
        const found = listResult.data.find(c => c.id === id);
        if (found) return ok(found);
      }
      return fail(new UnknownError('Failed to retrieve updated craftsman profile after verification update.'));
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiCraftsmanRepository;
