import type { Result } from '../../core/result/Result';
import type { Offer, OfferInput } from '../entities/Offer';

export interface OfferRepository {
  list(): Promise<Result<Offer[]>>;
  create(input: OfferInput): Promise<Result<Offer>>;
  update(id: string, patch: Partial<OfferInput>): Promise<Result<Offer>>;
  toggle(id: string): Promise<Result<Offer>>;
  remove(id: string): Promise<Result<boolean>>;
}
