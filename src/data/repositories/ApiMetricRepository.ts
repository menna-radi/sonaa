import { MetricRepository, CategoryVolume, PendingReport, VerificationSubmission, CohortData } from '../../domain/repositories/MetricRepository';
import { Metric } from '../../domain/entities/Metric';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { MetricMapper } from '../mappers/MetricMapper';
import { MetricDTO } from '../dto/MetricDTO';
import { ApiResponse } from '../../core/network/ApiResponse';
import { AppError, UnknownError } from '../../core/errors/AppError';

export class ApiMetricRepository implements MetricRepository {
  public async getMetrics(): Promise<Result<Metric[]>> {
    return fail(new UnknownError('Overview stats response schema is undocumented in API.'));
  }

  public async updateMetric(_id: string, _value: number): Promise<Result<Metric>> {
    return fail(new UnknownError('Update metric endpoint not supported by backend.'));
  }

  public async getCategoryVolumes(): Promise<Result<CategoryVolume[]>> {
    return fail(new UnknownError('Category volumes endpoint not supported by backend.'));
  }

  public async getPendingReports(): Promise<Result<PendingReport[]>> {
    return fail(new UnknownError('Pending reports endpoint not supported by backend.'));
  }

  public async getVerificationSubmissions(): Promise<Result<VerificationSubmission[]>> {
    return fail(new UnknownError('Verification submissions metrics endpoint not supported by backend.'));
  }

  public async getCohortData(): Promise<Result<CohortData[]>> {
    return fail(new UnknownError('Cohort data endpoint not supported by backend.'));
  }
}
export default ApiMetricRepository;

