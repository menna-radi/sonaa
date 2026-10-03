export type UserRole = 'CUSTOMER' | 'CRAFTSMAN' | 'ADMIN';
export type UserAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  rating?: number | null;
  createdAt?: string;
  /** Only present when the backend returns account status (B22). */
  status?: UserAccountStatus;
}
