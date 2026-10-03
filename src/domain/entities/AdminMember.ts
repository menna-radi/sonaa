export type AdminMemberStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  title: string;
  status: AdminMemberStatus;
  createdAt: string;
  isSelf: boolean;
}
