export type DisputeReason = 'SERVICE_QUALITY' | 'OVERCHARGING' | 'NO_SHOW' | 'SAFETY_CONCERN' | 'OTHER';

export type DisputeStatus = 'PENDING' | 'RESOLVED';

export type DisputeResolution = 'REFUND_CLIENT' | 'PAY_CRAFTSMAN';

export interface Dispute {
  id: string;
  taskId: string;
  taskDisplayId: string;
  taskTitle: string;
  customerName: string;
  craftsmanName: string | null;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  adminNotes?: string;
  amount: number;
  createdAt: string;
  resolvedAt?: string;
}
