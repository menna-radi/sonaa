import { CraftsmanRepository } from '../../domain/repositories/CraftsmanRepository';
import { Craftsman } from '../../domain/entities/Craftsman';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

export class MockCraftsmanRepository implements CraftsmanRepository {
  private craftsmen: Craftsman[] = [
    {
      id: '1',
      name: 'Ahmad Al-Otaibi',
      trade: 'Electrician',
      rating: 4.9,
      reviewsCount: 234,
      jobsCount: 412,
      trustScore: 98,
      status: 'online',
      joinedDate: 'Mar 2023',
      idNumber: 'CR-1001',
      responseTimeMin: 2,
      verifications: {
        nationalId: true,
        selfieMatch: true,
        tradeLicense: true,
        bankIban: true,
        backgroundCheck: true,
        insurance: false,
      },
      earnings30Days: 18420,
      earningsChangePct: 12.4,
      earningsSparkline: [20, 25, 22, 28, 30, 27, 35, 38, 42],
    },
    {
      id: '2',
      name: 'Mohammed Al-Zahrani',
      trade: 'Plumber',
      rating: 4.8,
      reviewsCount: 187,
      jobsCount: 318,
      trustScore: 95,
      status: 'offline',
      joinedDate: 'Jan 2023',
      idNumber: 'CR-1002',
      responseTimeMin: 5,
      verifications: {
        nationalId: true,
        selfieMatch: true,
        tradeLicense: true,
        bankIban: true,
        backgroundCheck: true,
        insurance: true,
      },
      earnings30Days: 12150,
      earningsChangePct: -3.2,
      earningsSparkline: [18, 16, 17, 19, 15, 14, 15, 13, 12],
    },
    {
      id: '3',
      name: 'Saif Al-Qahtani',
      trade: 'HVAC Technician',
      rating: 4.7,
      reviewsCount: 142,
      jobsCount: 256,
      trustScore: 92,
      status: 'busy',
      joinedDate: 'Jun 2023',
      idNumber: 'CR-1003',
      responseTimeMin: 12,
      verifications: {
        nationalId: true,
        selfieMatch: true,
        tradeLicense: true,
        bankIban: false,
        backgroundCheck: true,
        insurance: false,
      },
      earnings30Days: 9800,
      earningsChangePct: 8.7,
      earningsSparkline: [10, 12, 11, 13, 12, 14, 15, 16, 18],
    },
    {
      id: '4',
      name: 'Khalid Al-Ghamdi',
      trade: 'Carpenter',
      rating: 4.5,
      reviewsCount: 98,
      jobsCount: 174,
      trustScore: 88,
      status: 'flagged',
      joinedDate: 'Aug 2023',
      idNumber: 'CR-1004',
      responseTimeMin: 22,
      verifications: {
        nationalId: true,
        selfieMatch: false,
        tradeLicense: false,
        bankIban: true,
        backgroundCheck: false,
        insurance: false,
      },
      earnings30Days: 6200,
      earningsChangePct: -14.5,
      earningsSparkline: [12, 11, 10, 8, 9, 7, 8, 6, 5],
    }
  ];

  public async getCraftsmen(): Promise<Result<Craftsman[]>> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ok([...this.craftsmen]);
  }

  public async suspendCraftsman(id: string): Promise<Result<Craftsman>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.craftsmen.findIndex((c) => c.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Craftsman with ID ${id} not found`));
    }
    this.craftsmen[idx] = {
      ...this.craftsmen[idx],
      status: 'suspended',
    };
    return ok(this.craftsmen[idx]);
  }

  public async banCraftsman(id: string): Promise<Result<Craftsman>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.craftsmen.findIndex((c) => c.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Craftsman with ID ${id} not found`));
    }
    this.craftsmen[idx] = {
      ...this.craftsmen[idx],
      status: 'suspended', // Or flagged/inactive mapping
    };
    return ok(this.craftsmen[idx]);
  }

  public async toggleVerificationItem(id: string, itemKey: string, approved: boolean): Promise<Result<Craftsman>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = this.craftsmen.findIndex((c) => c.id === id);
    if (idx === -1) {
      return fail(new NotFoundError(`Craftsman with ID ${id} not found`));
    }
    this.craftsmen[idx] = {
      ...this.craftsmen[idx],
      verifications: {
        ...this.craftsmen[idx].verifications,
        [itemKey]: approved,
      },
    };
    return ok(this.craftsmen[idx]);
  }
}
export default MockCraftsmanRepository;
