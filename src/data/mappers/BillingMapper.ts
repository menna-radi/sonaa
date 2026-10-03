import type {
  SubscriptionPlan,
  SubscriptionRequest,
  Subscriber,
  CommissionPayment,
  CommissionLedgerEntry,
  BitSettings,
  PlatformSettings,
} from '../../domain/entities/Billing';

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export interface RawPlan {
  id: string;
  key: string;
  nameEn: string;
  nameAr: string;
  durationMonths: number;
  price: number | string;
  featuresEn?: string[];
  featuresAr?: string[];
  isPopular?: boolean;
  isActive?: boolean;
  subscribersCount?: number;
  pendingRequests?: number;
}

export function mapPlan(p: RawPlan): SubscriptionPlan {
  return {
    id: p.id,
    key: p.key,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    durationMonths: num(p.durationMonths, 1),
    price: num(p.price),
    currency: 'ILS',
    featuresEn: arr(p.featuresEn),
    featuresAr: arr(p.featuresAr),
    isPopular: p.isPopular === true,
    isActive: p.isActive !== false,
    subscribersCount: typeof p.subscribersCount === 'number' ? p.subscribersCount : undefined,
    pendingRequests: typeof p.pendingRequests === 'number' ? p.pendingRequests : undefined,
  };
}

export interface RawRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string | null;
  userPhone?: string | null;
  craftsmanTitle?: string;
  avatarUrl?: string | null;
  planId?: string | null;
  planTitle: string;
  durationMonths: number;
  price: number | string;
  currency?: string;
  paymentMethod: string;
  paymentProofUrl: string;
  notes?: string | null;
  status: SubscriptionRequest['status'];
  chatRoomId?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export function mapRequest(r: RawRequest): SubscriptionRequest {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName || '',
    userEmail: r.userEmail ?? undefined,
    userPhone: r.userPhone ?? undefined,
    craftsmanTitle: r.craftsmanTitle || 'Craftsman',
    avatarUrl: r.avatarUrl ?? undefined,
    planTitle: r.planTitle,
    durationMonths: num(r.durationMonths, 1),
    price: num(r.price),
    currency: r.currency || 'ILS',
    paymentMethod: r.paymentMethod,
    paymentProofUrl: r.paymentProofUrl,
    notes: r.notes ?? undefined,
    status: r.status,
    chatRoomId: r.chatRoomId ?? undefined,
    rejectionReason: r.rejectionReason ?? undefined,
    createdAt: r.createdAt,
  };
}

export interface RawSubscriber {
  id: string;
  craftsmanName?: string;
  craftsmanTitle?: string;
  avatarUrl?: string | null;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  subscriptionStatus?: Subscriber['subscriptionStatus'];
  startDate?: string | null;
  expiryDate?: string | null;
  freeTasksRemaining?: number;
  billingModel?: Subscriber['billingModel'];
  commissionLocked?: boolean;
  isAllowedToAcceptTasks?: boolean;
  commissionDue?: number | string;
}

export function mapSubscriber(c: RawSubscriber): Subscriber {
  const first = c.user?.firstName ?? '';
  const last = c.user?.lastName ?? '';
  const full = `${first} ${last}`.trim();
  return {
    id: c.id,
    name: c.craftsmanName || full || '',
    title: c.craftsmanTitle || '',
    email: c.user?.email ?? undefined,
    phone: c.user?.phoneNumber ?? undefined,
    userId: c.user?.id,
    subscriptionStatus: c.subscriptionStatus || 'EXPIRED',
    startDate: c.startDate ?? undefined,
    expiryDate: c.expiryDate ?? undefined,
    freeTasksRemaining: typeof c.freeTasksRemaining === 'number' ? c.freeTasksRemaining : 0,
    billingModel: c.billingModel ?? null,
    commissionLocked: c.commissionLocked === true,
    isAllowedToAcceptTasks: c.isAllowedToAcceptTasks === true,
    commissionDue: c.commissionDue != null ? num(c.commissionDue) : undefined,
  };
}

export interface RawCommissionPayment {
  id: string;
  craftsmanProfileId: string;
  amount: number | string;
  paymentProofUrl: string;
  notes?: string | null;
  status: CommissionPayment['status'];
  reviewedAt?: string | null;
  createdAt: string;
  craftsmanProfile?: {
    id?: string;
    title?: string;
    avatarUrl?: string | null;
    commissionLocked?: boolean;
    user?: {
      id?: string;
      firstName?: string;
      lastName?: string;
      email?: string | null;
      phoneNumber?: string | null;
    } | null;
  } | null;
  ledgerEntries?: Array<{
    id: string;
    taskId: string;
    taskDisplayId?: string;
    amount: number | string;
  }>;
}

export function mapCommissionPayment(p: RawCommissionPayment): CommissionPayment {
  const u = p.craftsmanProfile?.user;
  const name = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
  return {
    id: p.id,
    craftsmanProfileId: p.craftsmanProfileId,
    craftsmanName: name,
    craftsmanTitle: p.craftsmanProfile?.title || '',
    avatarUrl: p.craftsmanProfile?.avatarUrl ?? undefined,
    email: u?.email ?? undefined,
    phone: u?.phoneNumber ?? undefined,
    commissionLocked: p.craftsmanProfile?.commissionLocked === true,
    amount: num(p.amount),
    paymentProofUrl: p.paymentProofUrl,
    notes: p.notes ?? undefined,
    status: p.status,
    reviewedAt: p.reviewedAt ?? undefined,
    createdAt: p.createdAt,
    ledgerEntries: Array.isArray(p.ledgerEntries)
      ? p.ledgerEntries.map((e) => ({ id: e.id, taskDisplayId: e.taskDisplayId, amount: num(e.amount) }))
      : undefined,
  };
}

export interface RawLedgerEntry {
  id: string;
  taskId: string;
  taskDisplayId?: string;
  craftsmanProfileId: string;
  craftsmanName?: string;
  amount: number | string;
  rate: number | string;
  status: CommissionLedgerEntry['status'];
  paymentId?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export function mapLedger(e: RawLedgerEntry): CommissionLedgerEntry {
  return {
    id: e.id,
    taskId: e.taskId,
    taskDisplayId: e.taskDisplayId,
    craftsmanProfileId: e.craftsmanProfileId,
    craftsmanName: e.craftsmanName,
    amount: num(e.amount),
    rate: num(e.rate),
    status: e.status,
    paymentId: e.paymentId ?? undefined,
    createdAt: e.createdAt,
    paidAt: e.paidAt ?? undefined,
  };
}

export function mapBitSettings(raw: Record<string, string>): BitSettings {
  return {
    phoneNumber: raw.BIT_PHONE_NUMBER || '',
    recipientName: raw.BIT_RECIPIENT_NAME || '',
    instructionsEn: raw.BIT_INSTRUCTIONS_EN || '',
    instructionsAr: raw.BIT_INSTRUCTIONS_AR || '',
  };
}

export function mapBitPayload(s: BitSettings): Record<string, string> {
  return {
    BIT_PHONE_NUMBER: s.phoneNumber,
    BIT_RECIPIENT_NAME: s.recipientName,
    BIT_INSTRUCTIONS_EN: s.instructionsEn,
    BIT_INSTRUCTIONS_AR: s.instructionsAr,
  };
}

export function mapPlatformSettings(raw: Record<string, string>, autoVerify: boolean): PlatformSettings {
  const free = Number(raw.FREE_TASKS_COUNT);
  const rate = Number(raw.COMMISSION_RATE);
  return {
    freeTasksCount: Number.isInteger(free) && free >= 0 && free <= 100 ? free : 3,
    commissionRate: Number.isFinite(rate) && rate > 0 && rate < 1 ? rate : 0.08,
    autoVerifyCraftsmen: autoVerify,
  };
}
