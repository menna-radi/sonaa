import type { Result } from '../../core/result/Result';
import { ok, fail } from '../../core/result/Result';
import { NotFoundError } from '../../core/errors/AppError';
import type { OfferRepository } from '../../domain/repositories/OfferRepository';
import type { Offer, OfferInput } from '../../domain/entities/Offer';

/** In-memory twin of ApiOfferRepository for VITE_USE_MOCK=true. */
export class MockOfferRepository implements OfferRepository {
  private offers: Offer[] = [
    {
      id: 'offer-1',
      titleEn: 'Winter Heater Check',
      titleAr: 'فحص المدفأة الشتوي',
      subtitleEn: '20% off heater maintenance',
      subtitleAr: 'خصم 20% على صيانة المدافئ',
      buttonTextEn: 'Claim Offer',
      buttonTextAr: 'احصل على العرض',
      imageUrl: '/offers/heater.png',
      bannerType: 'PROMO',
      placement: 'TOP',
      targetType: 'URL',
      targetUrl: 'https://example.com/heater',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'offer-2',
      titleEn: 'Emergency SOS Banner',
      titleAr: 'بانر الطوارئ',
      subtitleEn: 'Always visible in emergencies',
      subtitleAr: 'ظاهر دائمًا في حالات الطوارئ',
      buttonTextEn: 'Get Help',
      buttonTextAr: 'احصل على المساعدة',
      imageUrl: '/offers/sos.png',
      bannerType: 'EMERGENCY_SOS',
      placement: 'FEATURED',
      targetType: 'NONE',
      isActive: true,
      createdAt: '2026-09-05T00:00:00.000Z',
    },
    {
      id: 'offer-3',
      titleEn: 'Plumbing Week',
      titleAr: 'أسبوع السباكة',
      subtitleEn: 'Free inspection with any repair',
      subtitleAr: 'فحص مجاني مع أي إصلاح',
      buttonTextEn: 'Book Now',
      buttonTextAr: 'احجز الآن',
      imageUrl: '/offers/plumbing.png',
      bannerType: 'PROMO',
      placement: 'TOP',
      targetType: 'NONE',
      isActive: false,
      createdAt: '2026-08-20T00:00:00.000Z',
    },
    {
      id: 'offer-4',
      titleEn: 'New Year Sale',
      titleAr: 'تخفيضات السنة الجديدة',
      subtitleEn: 'Starts next month',
      subtitleAr: 'تبدأ الشهر القادم',
      buttonTextEn: 'Learn More',
      buttonTextAr: 'اعرف المزيد',
      imageUrl: '/offers/newyear.png',
      bannerType: 'PROMO',
      placement: 'FEATURED',
      targetType: 'URL',
      targetUrl: 'https://example.com/newyear',
      isActive: true,
      startDate: '2027-01-01T00:00:00.000Z',
      endDate: '2027-01-31T00:00:00.000Z',
      createdAt: '2026-09-10T00:00:00.000Z',
    },
  ];

  private async delay(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
  }

  async list(): Promise<Result<Offer[]>> {
    await this.delay();
    return ok(this.offers.map((o) => ({ ...o })));
  }

  async create(input: OfferInput): Promise<Result<Offer>> {
    await this.delay();
    const offer: Offer = { ...input, id: `offer-${Date.now()}`, createdAt: new Date().toISOString(), isActive: true };
    this.offers.unshift(offer);
    return ok({ ...offer });
  }

  async update(id: string, patch: Partial<OfferInput>): Promise<Result<Offer>> {
    await this.delay();
    const offer = this.offers.find((o) => o.id === id);
    if (!offer) return fail(new NotFoundError('Offer not found'));
    Object.assign(offer, patch);
    return ok({ ...offer });
  }

  async toggle(id: string): Promise<Result<Offer>> {
    await this.delay();
    const offer = this.offers.find((o) => o.id === id);
    if (!offer) return fail(new NotFoundError('Offer not found'));
    offer.isActive = !offer.isActive;
    return ok({ ...offer });
  }

  async remove(id: string): Promise<Result<boolean>> {
    await this.delay();
    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx < 0) return fail(new NotFoundError('Offer not found'));
    this.offers.splice(idx, 1);
    return ok(true);
  }
}
export default MockOfferRepository;
