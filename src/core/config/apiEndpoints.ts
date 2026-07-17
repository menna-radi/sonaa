import { ENV } from './env';

export const API_BASE_URL = ENV.API_BASE_URL;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me', // documented as missing but kept here as key
  },
  metrics: {
    list: '/admin/overview-stats',
    update: (id: string) => `/metrics/${id}`,
    categoryVolumes: '/metrics/category-volumes',
    pendingReports: '/metrics/pending-reports',
    verificationSubmissions: '/metrics/verification-submissions',
    cohortData: '/metrics/cohort-data',
  },
  tasks: {
    list: '/admin/tasks',
    freeze: (id: string) => `/admin/tasks/${id}/freeze`,
    unfreeze: (id: string) => `/admin/tasks/${id}/unfreeze`,
  },
  categories: {
    list: '/admin/categories',
    create: '/admin/categories',
    update: (id: string) => `/admin/categories/${id}`,
    subcategories: (catId: string) => `/admin/categories/${catId}/subcategories`,
    createSubcategory: (catId: string) => `/admin/categories/${catId}/subcategories`,
    updateVisibility: (id: string) => `/admin/categories/${id}/visibility`,
    subcategoryVisibility: (subId: string) => `/admin/categories/subcategories/${subId}/visibility`,
    fields: (id: string) => `/admin/categories/${id}/fields`,
    createField: (id: string) => `/admin/categories/${id}/fields`,
    toggleFieldRequired: (id: string) => `/admin/fields/${id}/toggle-required`,
    deleteField: (id: string) => `/admin/fields/${id}`,
    moveSubcategory: (id: string) => `/admin/categories/subcategories/${id}/move`,
  },
  craftsmen: {
    list: '/admin/craftsmen',
    suspend: (id: string) => `/admin/craftsmen/${id}/suspend`,
    ban: (id: string) => `/admin/craftsmen/${id}/ban`,
    toggleVerificationItem: (id: string) => `/admin/craftsmen/${id}/verify/item`,
  },
  payments: {
    summary: '/admin/payments/summary',
    plans: '/admin/payments/plans',
    failedTransactions: '/admin/payments',
    retryTransaction: (id: string) => `/admin/payments/failed-transactions/${id}/retry`,
    withdrawalRequests: '/admin/payments/withdrawal-requests',
    updateWithdrawalStatus: (id: string) => `/admin/payments/withdrawal-requests/${id}/status`,
  },
  systemSettings: '/settings',
  admin: {
    overviewStats: '/admin/overview-stats',
    verificationQueue: '/admin/verification/queue',
    verificationModerate: '/admin/verification/moderate',
    craftsmen: '/admin/craftsmen',
    tasks: '/admin/tasks',
    disputes: '/admin/disputes',
    resolveDispute: (id: string) => `/admin/disputes/${id}/resolve`,
    payments: '/admin/payments',
    liveActivity: '/admin/live-activity',
    ads: '/admin/ads',
    updateAdStatus: (id: string) => `/admin/ads/${id}/status`,
    broadcasts: '/admin/notifications/broadcasts',
    sendBroadcast: '/admin/notifications/broadcast',
    categories: '/admin/categories',
    deleteCategory: (id: string) => `/admin/categories/${id}`,
    subcategories: (id: string) => `/admin/categories/${id}/subcategories`,
    createSubcategory: (id: string) => `/admin/categories/${id}/subcategories`,
    deleteSubcategory: (subId: string) => `/admin/categories/subcategories/${subId}`,
    auditLogs: '/admin/audit-logs',
    reports: '/admin/reports',
  }
};
export default API_ENDPOINTS;
