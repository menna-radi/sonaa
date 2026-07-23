import { Craftsman } from '../entities/Craftsman';
import { Result } from '../../core/result/Result';

export interface CraftsmanRepository {
  getCraftsmen(): Promise<Result<Craftsman[]>>;
  suspendCraftsman(id: string): Promise<Result<Craftsman>>;
  banCraftsman(id: string): Promise<Result<Craftsman>>;
  toggleVerificationItem(id: string, itemKey: string, approved: boolean): Promise<Result<Craftsman>>;
}
