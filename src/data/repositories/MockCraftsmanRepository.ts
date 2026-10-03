import {
  CraftsmanRepository,
  CraftsmenQuery,
  CraftsmenResult,
} from '../../domain/repositories/CraftsmanRepository';
import { Craftsman } from '../../domain/entities/Craftsman';
import { Result, ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';

const base = (
  id: string,
  name: string,
  trade: string,
  extra: Partial<Craftsman> = {}
): Craftsman => ({
  id,
  name,
  trade,
  rating: 4.5,
  reviewsCount: 100,
  jobsCount: 120,
  trustScore: 0.9,
  status: 'online',
  accountStatus: 'ACTIVE',
  billing: {
    freeTasksRemaining: 0,
    billingModel: 'SUBSCRIPTION',
    commissionLocked: false,
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiryDate: '2027-01-01T00:00:00.000Z',
  },
  isAvailable: true,
  isVerifiedId: true,
  joinedDate: '2023-01-01T00:00:00.000Z',
  idNumber: '+972540000000',
  responseTimeMin: 15,
  verifications: {
    nationalId: true,
    selfieMatch: true,
    tradeLicense: true,
    bankIban: true,
    backgroundCheck: true,
    insurance: true,
  },
  ...extra,
});

export class MockCraftsmanRepository implements CraftsmanRepository {
  private craftsmen: Craftsman[] = [
    base('1', 'Ahmad Al-Otaibi', 'Electrician', { rating: 4.9, trustScore: 0.98 }),
    base('2', 'Mohammed Al-Zahrani', 'Plumber', {
      rating: 4.8,
      trustScore: 0.95,
      status: 'offline',
      isAvailable: false,
      isVerifiedId: false,
      verifications: {
        nationalId: true,
        selfieMatch: true,
        tradeLicense: true,
        bankIban: true,
        backgroundCheck: true,
        insurance: true,
      },
    }),
    base('3', 'Saif Al-Qahtani', 'HVAC Technician', {
      rating: 4.7,
      trustScore: 0.92,
      accountStatus: 'SUSPENDED',
      status: 'suspended',
      billing: {
        freeTasksRemaining: 0,
        billingModel: 'COMMISSION',
        commissionLocked: true,
        subscriptionStatus: 'EXPIRED',
      },
    }),
    base('4', 'Khalid Al-Ghamdi', 'Carpenter', {
      rating: 4.5,
      trustScore: 0.88,
      status: 'flagged',
      isAvailable: false,
    }),
  ];

  private async delay(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  public async getCraftsmen(q: CraftsmenQuery): Promise<Result<CraftsmenResult>> {
    await this.delay();
    const needle = (q.q || '').trim().toLowerCase();
    const rows = this.craftsmen.filter((c) => {
      if (q.status === 'verified' && !c.isVerifiedId) return false;
      if (q.status === 'pending' && c.isVerifiedId) return false;
      if (q.status === 'suspended' && c.accountStatus === 'ACTIVE') return false;
      if (needle && !`${c.name} ${c.trade} ${c.id}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const counts = {
      all: this.craftsmen.length,
      verified: this.craftsmen.filter((c) => c.isVerifiedId).length,
      pending: this.craftsmen.filter((c) => !c.isVerifiedId).length,
      suspended: this.craftsmen.filter((c) => c.accountStatus !== 'ACTIVE').length,
    };
    return ok({
      items: rows.slice((q.page - 1) * q.limit, q.page * q.limit).map((c) => ({ ...c })),
      total: rows.length,
      counts,
    });
  }

  private find(id: string): Craftsman | undefined {
    return this.craftsmen.find((c) => c.id === id);
  }

  public async suspendCraftsman(id: string): Promise<Result<boolean>> {
    await this.delay();
    const c = this.find(id);
    if (!c) return fail(new NotFoundError('Craftsman not found'));
    c.accountStatus = 'SUSPENDED';
    c.status = 'suspended';
    return ok(true);
  }

  public async unsuspendCraftsman(id: string): Promise<Result<boolean>> {
    await this.delay();
    const c = this.find(id);
    if (!c) return fail(new NotFoundError('Craftsman not found'));
    c.accountStatus = 'ACTIVE';
    c.status = c.isAvailable ? 'online' : 'offline';
    return ok(true);
  }

  public async banCraftsman(id: string): Promise<Result<boolean>> {
    await this.delay();
    const c = this.find(id);
    if (!c) return fail(new NotFoundError('Craftsman not found'));
    c.accountStatus = 'BLOCKED';
    c.status = 'banned';
    return ok(true);
  }

  public async toggleVerificationItem(id: string, itemKey: string, approved: boolean): Promise<Result<boolean>> {
    await this.delay();
    const c = this.find(id);
    if (!c) return fail(new NotFoundError('Craftsman not found'));
    c.verifications = { ...c.verifications, [itemKey]: approved };
    return ok(true);
  }
}
export default MockCraftsmanRepository;
