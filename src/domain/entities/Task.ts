export type TaskStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PRE_CHAT_PENDING'
  | 'CHAT_OPEN'
  | 'AGREEMENT_PENDING'
  | 'IN_PROGRESS'
  | 'WORK_SUBMITTED'
  | 'RATING_PENDING'
  | 'CLOSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'DISPUTED'
  | 'FROZEN';

export type TaskFilter = 'all' | 'live' | 'emergency' | 'disputed' | 'done' | 'cancelled' | 'frozen';

export interface Task {
  id: string;
  displayId: string;
  title: string;
  status: TaskStatus;
  isEmergency: boolean;
  customerName: string;
  craftsmanName: string | null;
  category: string;
  address: string;
  amount: number;
  budgetType: 'SPECIFIC' | 'OPEN';
  distributionType: 'DIRECT' | 'BROADCAST';
  createdAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  freeTaskReserved?: boolean | null;
  cancelReason?: string | null;
  cancelNote?: string | null;
  hasDispute: boolean;
  offersCount?: number;
}

export interface TaskOfferRef {
  id: string;
  craftsman: { id: string; name: string } | null;
  amount: number;
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface TaskAgreementRef {
  id: string;
  finalPrice: number;
  scope: string;
  scheduledAt: string;
  status: string;
  customerConfirmed: boolean;
  craftsmanConfirmed: boolean;
  createdAt: string;
}

export interface TaskDetail {
  task: Task;
  customer: { id: string; name: string; phone?: string } | null;
  craftsman: { id: string; name: string; phone?: string; title?: string } | null;
  offers: TaskOfferRef[];
  agreement: TaskAgreementRef | null;
  workProof: { imageUrls: string[]; submittedAt?: string };
  dispute: unknown | null;
  emergency: unknown | null;
  commission: { amount: number; rate: number; status: string } | null;
  cancel: { reason?: string | null; note?: string | null };
}
