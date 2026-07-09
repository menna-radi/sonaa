import { SafetyReportRepository, SafetyReport } from '../../domain/repositories/SafetyReportRepository';
import { Result, fail } from '../../core/result/Result';
import { UnknownError } from '../../core/errors/AppError';

export class ApiSafetyReportRepository implements SafetyReportRepository {
  public async getSafetyReports(): Promise<Result<SafetyReport[]>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }

  public async moderateReport(
    _id: string,
    _action: 'dismiss' | 'suspend' | 'ban',
    _notes?: string
  ): Promise<Result<boolean>> {
    return fail(new UnknownError('Feature not supported by the backend yet'));
  }
}
export default ApiSafetyReportRepository;
