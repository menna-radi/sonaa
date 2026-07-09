import { Result } from '../../core/result/Result';

export interface Dispute {
  id: string;
  jobId: string;
  customerName: string;
  craftsmanName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  description: string;
}

export interface DisputeRepository {
  getDisputes(): Promise<Result<Dispute[]>>;
  resolveDispute(
    id: string,
    resolution: 'refund_customer' | 'pay_craftsman' | 'split_split',
    notes: string
  ): Promise<Result<boolean>>;
}
