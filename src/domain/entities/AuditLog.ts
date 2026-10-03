export interface AuditLog {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  before: unknown;
  after: unknown;
  createdAt: string;
  actorName: string;
  actorEmail?: string;
  ipAddress?: string;
}
