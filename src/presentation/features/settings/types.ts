export type SettingsTabKey =
  | 'roles'
  | 'appearance'
  | 'security'
  | 'notifications'
  | 'platform'
  | 'audit_logs';

export interface TeamRole {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  userCount: number;
  color: string;
  permissions: Record<string, boolean>;
}

export const INITIAL_ROLES: TeamRole[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    nameAr: 'مدير عام',
    description: 'Full access · All resources',
    descriptionAr: 'صلاحيات كاملة · جميع الموارد',
    userCount: 2,
    color: '#171717',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': true, 'ban-users': true,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': true, 'view-earnings': true,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': true, 'refund-tasks': true,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': true, 'manage-plans': true,
      'manage-roles': true, 'api-access': true, 'audit-logs': true, 'platform-config': true,
    },
  },
  {
    id: 'operations-lead',
    name: 'Operations Lead',
    nameAr: 'مدير العمليات',
    description: 'Read all · Manage tasks, craftsmen',
    descriptionAr: 'قراءة الكل · إدارة المهام والحرفيين',
    userCount: 4,
    color: '#404040',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': true, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': true, 'refund-tasks': false,
      'view-revenue': true, 'approve-payouts': false, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': false, 'api-access': false, 'audit-logs': true, 'platform-config': false,
    },
  },
  {
    id: 'moderator',
    name: 'Moderator',
    nameAr: 'مشرف محتوى',
    description: 'Verification queue · Reports · Chat moderation',
    descriptionAr: 'طابور التحقق · التقارير · إدارة الدردشة',
    userCount: 12,
    color: '#737373',
    permissions: {
      'view-users': true, 'edit-users': true, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': true, 'suspend-craftsmen': false, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': true, 'resolve-disputes': false, 'refund-tasks': false,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': true, 'api-access': true, 'audit-logs': false, 'platform-config': false,
    },
  },
  {
    id: 'finance',
    name: 'Finance',
    nameAr: 'المالية',
    description: 'Payments · Payouts · Subscriptions',
    descriptionAr: 'المدفوعات · الحسابات · الاشتراكات',
    userCount: 3,
    color: '#737373',
    permissions: {
      'view-users': true, 'edit-users': false, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': false, 'suspend-craftsmen': false, 'view-earnings': true,
      'view-tasks': true, 'freeze-tasks': false, 'resolve-disputes': false, 'refund-tasks': true,
      'view-revenue': true, 'approve-payouts': true, 'issue-refunds': true, 'manage-plans': true,
      'manage-roles': false, 'api-access': false, 'audit-logs': true, 'platform-config': false,
    },
  },
  {
    id: 'support-agent',
    name: 'Support Agent',
    nameAr: 'الدعم الفني',
    description: 'Read users · Reply tickets',
    descriptionAr: 'قراءة بيانات المستخدمين · الرد على التذاكر',
    userCount: 18,
    color: '#a3a3a3',
    permissions: {
      'view-users': true, 'edit-users': false, 'suspend-users': false, 'ban-users': false,
      'view-profiles': true, 'approve-verifications': false, 'suspend-craftsmen': false, 'view-earnings': false,
      'view-tasks': true, 'freeze-tasks': false, 'resolve-disputes': false, 'refund-tasks': false,
      'view-revenue': false, 'approve-payouts': false, 'issue-refunds': false, 'manage-plans': false,
      'manage-roles': false, 'api-access': false, 'audit-logs': false, 'platform-config': false,
    },
  },
];

export const PERMISSION_GROUPS = [
  {
    label: 'Users',
    labelAr: 'المستخدمين',
    perms: [
      { key: 'view-users', label: 'View users', labelAr: 'عرض المستخدمين' },
      { key: 'edit-users', label: 'Edit users', labelAr: 'تعديل بيانات المستخدمين' },
      { key: 'suspend-users', label: 'Suspend users', labelAr: 'تعليق الحسابات' },
      { key: 'ban-users', label: 'Ban users', labelAr: 'حظر المستخدمين' },
    ],
  },
  {
    label: 'Craftsmen',
    labelAr: 'الحرفيين',
    perms: [
      { key: 'view-profiles', label: 'View profiles', labelAr: 'عرض الملفات' },
      { key: 'approve-verifications', label: 'Approve verifications', labelAr: 'الموافقة على التحقق' },
      { key: 'suspend-craftsmen', label: 'Suspend craftsmen', labelAr: 'تعليق الحرفيين' },
      { key: 'view-earnings', label: 'View earnings', labelAr: 'عرض الأرباح' },
    ],
  },
  {
    label: 'Tasks',
    labelAr: 'المهام',
    perms: [
      { key: 'view-tasks', label: 'View tasks', labelAr: 'عرض المهام' },
      { key: 'freeze-tasks', label: 'Freeze tasks', labelAr: 'تجميد المهام' },
      { key: 'resolve-disputes', label: 'Resolve disputes', labelAr: 'فض النزاعات' },
      { key: 'refund-tasks', label: 'Refund tasks', labelAr: 'استرداد المبالغ' },
    ],
  },
  {
    label: 'Finance',
    labelAr: 'المالية',
    perms: [
      { key: 'view-revenue', label: 'View revenue', labelAr: 'عرض الإيرادات' },
      { key: 'approve-payouts', label: 'Approve payouts', labelAr: 'الموافقة على المستحقات' },
      { key: 'issue-refunds', label: 'Issue refunds', labelAr: 'إصدار المستردات' },
      { key: 'manage-plans', label: 'Manage plans', labelAr: 'إدارة الباقات' },
    ],
  },
  {
    label: 'System',
    labelAr: 'النظام',
    perms: [
      { key: 'manage-roles', label: 'Manage roles', labelAr: 'إدارة الأدوار' },
      { key: 'api-access', label: 'API access', labelAr: 'الوصول للـ API' },
      { key: 'audit-logs', label: 'Audit logs', labelAr: 'سجلات التدقيق' },
      { key: 'platform-config', label: 'Platform config', labelAr: 'تهيئة المنصة' },
    ],
  },
];
