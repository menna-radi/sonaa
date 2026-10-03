/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'he';

export interface TranslationDict {
  [key: string]: {
    en: string;
    ar: string;
    he: string;
  };
}

export const translations: TranslationDict = {
  brand_name: {
    en: 'Arox Admin',
    ar: 'لوحة تحكم AROX',
    he: 'ממשק ניהול AROX'
  },
  login_welcome_title: {
    en: 'Welcome Back',
    ar: 'مرحباً بعودتك',
    he: 'ברוך הבא'
  },
  login_welcome_subtitle: {
    en: 'Sign in to AROX Admin Console',
    ar: 'سجل الدخول إلى لوحة إدارة AROX',
    he: 'היכנס למסוף הניהול של AROX'
  },
  login_label_email: {
    en: 'Email Address',
    ar: 'البريد الإلكتروني',
    he: 'כתובת אימייל'
  },
  login_label_password: {
    en: 'Password',
    ar: 'كلمة المرور',
    he: 'סיסמה'
  },
  login_placeholder_email: {
    en: 'admin@sonaa.com',
    ar: 'admin@sonaa.com',
    he: 'admin@sonaa.com'
  },
  login_placeholder_password: {
    en: '••••••••',
    ar: '••••••••',
    he: '••••••••'
  },
  login_btn_submit: {
    en: 'Sign In',
    ar: 'تسجيل الدخول',
    he: 'התחברות'
  },
  login_err_invalid: {
    en: 'Incorrect email address or password.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    he: 'כתובת האימייל או הסיסמה אינם נכונים.'
  },
  login_err_empty: {
    en: 'Please fill in all credentials.',
    ar: 'يرجى إدخال جميع البيانات المطلوبة.',
    he: 'אנא מלא את כל פרטי ההתחברות.'
  },
  login_hint_credentials: {
    en: 'Sandbox credentials: admin@sonaa.com / admin123',
    ar: 'بيانات الدخول التجريبية: admin@sonaa.com / admin123',
    he: 'פרטי התחברות לדוגמה: admin@sonaa.com / admin123'
  },
  login_brand_headline: {
    en: 'Command center for your marketplace',
    ar: 'مركز قيادة السوق الخاص بك',
    he: 'מרכז הבקרה של השוק שלך'
  },
  login_feat_live: {
    en: 'Real-time activity monitoring',
    ar: 'مراقبة النشاط لحظياً',
    he: 'ניטור פעילות בזמן אמת'
  },
  login_feat_verify: {
    en: 'Craftsman verification queue',
    ar: 'قائمة توثيق الحرفيين',
    he: 'תור אימות בעלי מקצוע'
  },
  login_feat_payments: {
    en: 'Payments, payouts & plans',
    ar: 'المدفوعات والسحوبات والخطط',
    he: 'תשלומים, משיכות ותוכניות'
  },
  sidebar_dashboard: {
    en: 'Overview',
    ar: 'نظرة عامة',
    he: 'סקירה כללית'
  },
  
  // Sidebar
  sec_operations: {
    en: 'Operations',
    ar: 'العمليات',
    he: 'פעולות'
  },
  sec_manage: {
    en: 'Manage',
    ar: 'الإدارة',
    he: 'ניהול'
  },
  sec_insights: {
    en: 'Insights',
    ar: 'الرؤى والتحليلات',
    he: 'תובנות'
  },
  nav_live_activity: {
    en: 'Live Activity',
    ar: 'النشاط المباشر',
    he: 'פעילות חיה'
  },
  nav_users: { en: 'Users', ar: 'المستخدمون', he: 'משתמשים' },
  users_title: { en: 'Users', ar: 'المستخدمون', he: 'משתמשים' },
  users_subtitle: { en: 'Customers, craftsmen and admins on the platform', ar: 'العملاء والحرفيون والمشرفون على المنصة', he: 'לקוחות, בעלי מקצוע ומנהלים בפלטפורמה' },
  users_readonly_note: { en: 'Account status management is not available on this server yet. This list is read-only.', ar: 'إدارة حالة الحساب غير متاحة على الخادم حاليًا. هذه القائمة للقراءة فقط.', he: 'ניהול סטטוס חשבון אינו זמין עדיין בשרת. הרשימה לקריאה בלבד.' },
  users_search_ph: { en: 'Search name, phone or email…', ar: 'ابحث بالاسم أو الهاتف أو البريد…', he: 'חפש שם, טלפון או אימייל…' },
  users_role_filter_all: { en: 'All', ar: 'الكل', he: 'הכול' },
  users_role_filter_customer: { en: 'Customers', ar: 'العملاء', he: 'לקוחות' },
  users_role_filter_craftsman: { en: 'Craftsmen', ar: 'الحرفيون', he: 'בעלי מקצוע' },
  users_role_filter_admin: { en: 'Admins', ar: 'المشرفون', he: 'מנהלים' },
  users_role_customer: { en: 'Customer', ar: 'عميل', he: 'לקוח' },
  users_role_craftsman: { en: 'Craftsman', ar: 'حرفي', he: 'בעל מקצוע' },
  users_role_admin: { en: 'Admin', ar: 'مشرف', he: 'מנהל' },
  users_col_name: { en: 'Name', ar: 'الاسم', he: 'שם' },
  users_col_role: { en: 'Role', ar: 'الدور', he: 'תפקיד' },
  users_col_contact: { en: 'Phone / Email', ar: 'الهاتف / البريد', he: 'טלפון / אימייל' },
  users_col_rating: { en: 'Rating', ar: 'التقييم', he: 'דירוג' },
  users_col_joined: { en: 'Joined', ar: 'تاريخ الانضمام', he: 'הצטרף' },
  users_col_status: { en: 'Account status', ar: 'حالة الحساب', he: 'סטטוס חשבון' },
  users_col_actions: { en: 'Actions', ar: 'الإجراءات', he: 'פעולות' },
  users_empty: { en: 'No users found', ar: 'لا يوجد مستخدمون', he: 'לא נמצאו משתמשים' },
  users_action_suspend: { en: 'Suspend', ar: 'إيقاف', he: 'השהה' },
  users_action_unsuspend: { en: 'Unsuspend', ar: 'إلغاء الإيقاف', he: 'בטל השהיה' },
  users_action_block: { en: 'Block', ar: 'حظر', he: 'חסום' },
  users_confirm_suspend_title: { en: 'Suspend this account?', ar: 'إيقاف هذا الحساب؟', he: 'להשהות חשבון זה?' },
  users_confirm_suspend_body: { en: 'The user will be signed out and unable to use the app until unsuspended:', ar: 'سيتم تسجيل خروج المستخدم ولن يتمكن من استخدام التطبيق حتى إلغاء الإيقاف:', he: 'המשתמש ינותק ולא יוכל להשתמש באפליקציה עד לביטול ההשהיה:' },
  users_confirm_unsuspend_title: { en: 'Unsuspend this account?', ar: 'إلغاء إيقاف هذا الحساب؟', he: 'לבטל השהיית חשבון זה?' },
  users_confirm_unsuspend_body: { en: 'The user will regain access to the app:', ar: 'سيستعيد المستخدم إمكانية الوصول إلى التطبيق:', he: 'המשתמש יקבל שוב גישה לאפליקציה:' },
  users_confirm_block_title: { en: 'Block this account?', ar: 'حظر هذا الحساب؟', he: 'לחסום חשבון זה?' },
  users_confirm_block_body: { en: 'The user will be signed out and blocked from the app:', ar: 'سيتم تسجيل خروج المستخدم وحظره من التطبيق:', he: 'המשתמש ינותק ויחסם מהאפליקציה:' },
  users_toast_status_updated: { en: 'Account status updated', ar: 'تم تحديث حالة الحساب', he: 'סטטוס החשבון עודכן' },
  team_subtitle: { en: 'Admin accounts that can sign in to this dashboard', ar: 'حسابات المشرفين التي يمكنها الدخول إلى لوحة التحكم', he: 'חשבונות מנהלים שיכולים להיכנס ללוח הבקרה' },
  team_unavailable: { en: 'Admin management is not available on this server', ar: 'إدارة المشرفين غير متاحة على هذا الخادم', he: 'ניהול מנהלים אינו זמין בשרת זה' },
  team_unavailable_body: { en: 'Ask your backend team to enable the admin team endpoints.', ar: 'اطلب من فريق الخادم تفعيل واجهات إدارة فريق المشرفين.', he: 'בקשו מצוות השרת להפעיל את ממשקי ניהול צוות המנהלים.' },
  team_empty: { en: 'No admin accounts found', ar: 'لا توجد حسابات مشرفين', he: 'לא נמצאו חשבונות מנהלים' },
  team_you: { en: 'you', ar: 'أنت', he: 'את/ה' },
  team_col_member: { en: 'Member', ar: 'العضو', he: 'חבר צוות' },
  team_col_title: { en: 'Title', ar: 'المسمى الوظيفي', he: 'תפקיד' },
  team_col_status: { en: 'Status', ar: 'الحالة', he: 'סטטוס' },
  team_col_joined: { en: 'Joined', ar: 'تاريخ الانضمام', he: 'הצטרף' },
  team_col_actions: { en: 'Actions', ar: 'الإجراءات', he: 'פעולות' },
  team_action_suspend: { en: 'Suspend', ar: 'تعليق', he: 'השעיה' },
  team_action_reactivate: { en: 'Reactivate', ar: 'إعادة تفعيل', he: 'הפעלה מחדש' },
  team_confirm_suspend_title: { en: 'Suspend this admin?', ar: 'تعليق هذا المشرف؟', he: 'להשעות את המנהל?' },
  team_confirm_suspend_body: { en: 'They will no longer be able to sign in. Account:', ar: 'لن يتمكن من تسجيل الدخول بعد الآن. الحساب:', he: 'לא יוכל להתחבר יותר. חשבון:' },
  team_confirm_reactivate_title: { en: 'Reactivate this admin?', ar: 'إعادة تفعيل هذا المشرف؟', he: 'להפעיל מחדש את המנהל?' },
  team_confirm_reactivate_body: { en: 'They will be able to sign in again. Account:', ar: 'سيتمكن من تسجيل الدخول مجددًا. الحساب:', he: 'יוכל להתחבר שוב. חשבון:' },
  team_toast_status_updated: { en: 'Admin status updated', ar: 'تم تحديث حالة المشرف', he: 'סטטוס המנהל עודכן' },
  team_toast_invited: { en: 'Admin invited', ar: 'تمت دعوة المشرف', he: 'המנהל הוזמן' },
  team_invite_btn: { en: 'Invite admin', ar: 'دعوة مشرف', he: 'הזמנת מנהל' },
  team_invite_title: { en: 'Invite admin', ar: 'دعوة مشرف', he: 'הזמנת מנהל' },
  team_invite_submit: { en: 'Send invite', ar: 'إرسال الدعوة', he: 'שליחת הזמנה' },
  team_field_first_name: { en: 'First name', ar: 'الاسم الأول', he: 'שם פרטי' },
  team_field_last_name: { en: 'Last name', ar: 'اسم العائلة', he: 'שם משפחה' },
  team_field_email: { en: 'Email address', ar: 'البريد الإلكتروني', he: 'כתובת אימייל' },
  team_field_title: { en: 'Job title', ar: 'المسمى الوظيفي', he: 'תפקיד' },
  team_temp_password_title: { en: 'Temporary password', ar: 'كلمة مرور مؤقتة', he: 'סיסמה זמנית' },
  team_temp_password_warning: { en: 'Share securely. It is not shown again.', ar: 'شاركها بشكل آمن. لن تظهر مرة أخرى.', he: 'שתפו באופן מאובטח. הסיסמה לא תוצג שוב.' },
  team_temp_password_for: { en: 'Password for', ar: 'كلمة المرور لـ', he: 'סיסמה עבור' },
  team_temp_password_saved: { en: 'I saved it', ar: 'لقد حفظتها', he: 'שמרתי אותה' },
  team_copy: { en: 'Copy', ar: 'نسخ', he: 'העתקה' },
  team_copied: { en: 'Copied', ar: 'تم النسخ', he: 'הועתק' },
  team_copy_failed: { en: 'Could not copy. Select the password and copy it manually.', ar: 'تعذر النسخ. حدد كلمة المرور وانسخها يدويًا.', he: 'לא ניתן להעתיק. סמנו את הסיסמה והעתיקו ידנית.' },
  nav_craftsmen: {
    en: 'Craftsmen',
    ar: 'الحرفيين',
    he: 'בעלי מקצוע'
  },
  nav_tasks: {
    en: 'Tasks',
    ar: 'المهام',
    he: 'משימות'
  },
  nav_chat: {
    en: 'Live Support & Chat',
    ar: 'الدعم والمحادثات المباشرة',
    he: 'צ׳אט ותמיכה חיה'
  },
  nav_verification: {
    en: 'Verification',
    ar: 'التوثيق',
    he: 'אימות'
  },
  nav_reports: {
    en: 'Reports',
    ar: 'التقارير',
    he: 'דוחות'
  },
  nav_payments: {
    en: 'Payouts & Revenue',
    ar: 'العوائد والإيرادات',
    he: 'תשלומים והכנסות'
  },
  nav_analytics: {
    en: 'Analytics',
    ar: 'التحليلات',
    he: 'ניתוח נתונים'
  },
  nav_broadcast: {
    en: 'Broadcast',
    ar: 'البث',
    he: 'שידור'
  },
  nav_notifications: {
    en: 'Notifications',
    ar: 'الإشعارات',
    he: 'התראות'
  },
  nav_ads: {
    en: 'Ads Dashboard',
    ar: 'لوحة الإعلانات',
    he: 'לוח מודעות'
  },
  nav_campaigns: {
    en: 'Campaigns',
    ar: 'الحملات',
    he: 'קמפיינים'
  },
  nav_offers: {
    en: 'Offers & Banners',
    ar: 'العروض والبانرات',
    he: 'מבצעים ובאנרים'
  },
  sec_growth: {
    en: 'Growth',
    ar: 'النمو',
    he: 'צמיחה'
  },
  nav_scheduled: {
    en: 'Scheduled',
    ar: 'المجدولة',
    he: 'מתוזמן'
  },
  nav_settings: {
    en: 'Settings',
    ar: 'الإعدادات',
    he: 'הגדרות'
  },
  nav_expired: {
    en: 'Expired',
    ar: 'المنتهية',
    he: 'פג תוקף'
  },
  nav_promotions: {
    en: 'Craftsman Promotions',
    ar: 'عروض الحرفيين',
    he: 'מבצעי בעלי מקצוע'
  },
  nav_ad_analytics: {
    en: 'Ad Analytics',
    ar: 'تحليلات الإعلانات',
    he: 'ניתוח מודעות'
  },
  nav_service_management: {
    en: 'Service Management',
    ar: 'إدارة الخدمات',
    he: 'ניהול שירותים'
  },
  payments_title: {
    en: 'Payouts & Revenue',
    ar: 'العوائد والإيرادات',
    he: 'תשלומים והכנסות'
  },
  payments_subtitle: {
    en: 'Platform revenue and craftsman withdrawals',
    ar: 'إيرادات المنصة وسحوبات الحرفيين',
    he: 'הכנסות הפלטפורמה ומשיכות בעלי מקצוע'
  },
  payments_gmv_mtd: {
    en: 'GMV (MTD)',
    ar: 'إجمالي حجم العمليات',
    he: 'נפח עסקאות MTD'
  },
  payments_net_revenue: {
    en: 'Net Revenue',
    ar: 'صافي الإيرادات',
    he: 'רווח נקי'
  },
  payments_take_rate: {
    en: 'Take rate',
    ar: 'نسبة الاقتطاع',
    he: 'שיעור עמלה'
  },
  payments_pending_payouts: {
    en: 'Pending payouts',
    ar: 'المدفوعات المعلقة',
    he: 'תשלומים ממתינים'
  },
  payments_sub_plans: {
    en: 'Subscription Plans',
    ar: 'خطط الاشتراكات',
    he: 'תוכניות מנויים'
  },
  payments_failed_tx: {
    en: 'Failed Transactions',
    ar: 'المعاملات الفاشلة',
    he: 'עסקאות שנכשלו'
  },
  payments_withdrawal_reqs: {
    en: 'Withdrawal Requests',
    ar: 'طلبات السحب المالي',
    he: 'בקשות משיכה'
  },
  payments_reason: {
    en: 'Reason',
    ar: 'السبب',
    he: 'סיבה'
  },
  payments_retries: {
    en: 'Retries',
    ar: 'المحاولات',
    he: 'ניסיונות'
  },
  payments_action: {
    en: 'Action',
    ar: 'الإجراء',
    he: 'פעולה'
  },
  payments_btn_retry: {
    en: 'Retry',
    ar: 'إعادة المحاولة',
    he: 'נסه שוב'
  },
  payments_require_attention: {
    en: 'require attention',
    ar: 'تحتاج إلى اهتمام',
    he: 'דורش טיפול'
  },
  ads_title: {
    en: 'Ads & Promotions',
    ar: 'الإعلانات والعروض',
    he: 'מודעות ומبצעים'
  },
  ads_subtitle: {
    en: 'Manage campaigns, placements and performance',
    ar: 'إدارة الحملات والمواضع والأداء',
    he: 'ניהול קמפיינים, מיקומים וביצועים'
  },
  ads_new_campaign: {
    en: 'New Campaign',
    ar: 'حملة جديدة',
    he: 'קמפיין חדש'
  },
  ads_last_7_days: {
    en: 'Last 7 days',
    ar: 'آخر 7 أيام',
    he: '7 הימים האחרונים'
  },
  ads_export: {
    en: 'Export',
    ar: 'تصدير',
    he: 'ייצוא'
  },
  payments_pending_approval: {
    en: 'pending approval',
    ar: 'تحت الموافقة',
    he: 'ממתין לאישור'
  },
  payments_starter_plan: {
    en: 'Starter',
    ar: 'الباقة الأساسية',
    he: 'בסיסי'
  },
  payments_pro_plan: {
    en: 'Pro',
    ar: 'الباقة الاحترافية',
    he: 'מקצועי'
  },
  payments_pro_plus_plan: {
    en: 'Pro+',
    ar: 'الباقة المتقدمة',
    he: 'מתקדם'
  },
  reason_bank_declined: {
    en: 'Bank declined',
    ar: 'مرفوض من البنك',
    he: 'נדחה ע״י הבנק'
  },
  reason_insufficient_funds: {
    en: 'Insufficient funds',
    ar: 'رصيد غير كافٍ',
    he: 'אין מספיק יתרה'
  },
  reason_iban_mismatch: {
    en: 'IBAN mismatch',
    ar: 'خطأ في الآيبان',
    he: 'שגיאת IBAN'
  },
  payments_craftsmen_count: {
    en: 'craftsmen',
    ar: 'حرفي',
    he: 'בעלי מקצוע'
  },
  payments_view_all: {
    en: 'View all',
    ar: 'عرض الكل',
    he: 'הצג הכל'
  },
  payments_all_requests: {
    en: 'All requests',
    ar: 'جميع الطلبات',
    he: 'כל הבקשות'
  },
  analytics_title: {
    en: 'Analytics & Insights',
    ar: 'التحليلات والرؤى',
    he: 'אנליטיקה ותובנות'
  },
  analytics_subtitle: {
    en: 'Marketplace performance and platform health',
    ar: 'أداء منصة السوق وصحة النظام',
    he: 'ביצועי שוק ובריאות הפלטפורמה'
  },
  tab_analytics_health: {
    en: 'Health',
    ar: 'الأداء',
    he: 'בריאות'
  },
  tab_analytics_cohorts: {
    en: 'Cohorts',
    ar: 'المجموعات',
    he: 'קבוצות'
  },
  tab_analytics_zones: {
    en: 'Zones',
    ar: 'المناطق',
    he: 'אזורים'
  },
  analytics_user_growth: {
    en: 'User Growth',
    ar: 'نمو المستخدمين',
    he: 'צמיחת משתמשים'
  },
  analytics_new_signups: {
    en: 'New signups this week',
    ar: 'المشتركون الجدد هذا الأسبوع',
    he: 'הרשמות חדשות השבוע'
  },
  analytics_active_craftsmen: {
    en: 'Active Craftsmen',
    ar: 'الحرفيين النشطين',
    he: 'בעלי מקצוע פעילים'
  },
  analytics_online_now: {
    en: 'online now',
    ar: 'نشط الآن',
    he: 'מחוברים כעת'
  },
  analytics_marketplace_activity: {
    en: 'Marketplace Activity',
    ar: 'نشاط السوق',
    he: 'פעילות שוק'
  },
  analytics_tasks_last_7d: {
    en: 'Tasks last 7d',
    ar: 'المهام في آخر 7 أيام',
    he: 'משימות ב-7 הימים האחרונים'
  },
  analytics_conversion_rate: {
    en: 'Conversion Rate',
    ar: 'معدل التحويل',
    he: 'שיעור המרה'
  },
  analytics_posted_matched: {
    en: 'Posted → matched',
    ar: 'تم النشر ← تم التوصيل',
    he: 'פורסם ← הותאם'
  },
  analytics_user_growth_cohorts: {
    en: 'User Growth Cohorts',
    ar: 'مجموعات نمو المستخدمين',
    he: 'קבוצות צמיחת משתמשים'
  },
  analytics_weekly_new_returning: {
    en: 'Weekly new vs returning',
    ar: 'المشتركون الجدد مقابل العائدين أسبوعياً',
    he: 'חדשים לעומת חוזרים שבועי'
  },
  analytics_new: {
    en: 'New',
    ar: 'جديد',
    he: 'חדש'
  },
  analytics_returning: {
    en: 'Returning',
    ar: 'عائد',
    he: 'חוזר'
  },
  analytics_high_demand_zones: {
    en: 'High-Demand Zones',
    ar: 'المناطق الأكثر طلباً',
    he: 'אזורי ביקוש גבוה'
  },
  analytics_riyadh_districts: {
    en: 'Jerusalem districts · Last 7 days',
    ar: 'أحياء القدس · آخر 7 أيام',
    he: 'שכונות ירושלים · 7 ימים אחרונים'
  },
  analytics_platform_health: {
    en: 'Platform Health',
    ar: 'صحة وأداء النظام',
    he: 'בריאות הפלטפורמה'
  },
  analytics_operational_kpis: {
    en: 'Operational KPIs vs targets',
    ar: 'المؤشرات التشغيلية مقابل الأهداف',
    he: 'מדדי ביצוע תפעוליים לעומת יעדים'
  },
  analytics_all_healthy: {
    en: 'All systems healthy',
    ar: 'جميع الأنظمة تعمل بشكل سليم',
    he: 'כל המערכות תקינות'
  },
  analytics_tasks_count: {
    en: 'tasks',
    ar: 'مهام',
    he: 'משימות'
  },
  analytics_match_rate: {
    en: 'Task Match Rate',
    ar: 'معدل التوافق والربط',
    he: 'קצב התאמת משימות'
  },
  analytics_below_target: {
    en: 'Below Target',
    ar: 'أقل من الهدف',
    he: 'מתחת ליעד'
  },
  analytics_on_track: {
    en: 'On Track',
    ar: 'ضمن الهدف',
    he: 'במסלול'
  },
  analytics_avg_eta_accuracy: {
    en: 'Avg ETA Accuracy',
    ar: 'دقة تقدير وقت الوصول',
    he: 'דיוק זמן הגעה משוער'
  },
  analytics_customer_satisfaction: {
    en: 'Customer Satisfaction',
    ar: 'رضا العملاء',
    he: 'שביעות רצון לקוחות'
  },
  analytics_craftsman_utilization: {
    en: 'Craftsman Utilization',
    ar: 'نسبة إشغال الحرفيين',
    he: 'ניצול בעלי מקצוע'
  },
  analytics_dispute_rate: {
    en: 'Dispute Rate',
    ar: 'معدل النزاعات',
    he: 'שיעור מחלוקות'
  },
  analytics_refund_rate: {
    en: 'Refund Rate',
    ar: 'معدل الاسترجاع',
    he: 'שיעור החזרים'
  },
  ad_analytics_page_title: {
    en: 'Advertisement Analytics',
    ar: 'تحليلات الإعلانات',
    he: 'אנליטיקה של מודעות'
  },
  ad_analytics_page_subtitle: {
    en: 'Deep performance insights across sponsored listings and campaigns',
    ar: 'تحليلات أداء إعلانات الحرفيين وعمليات الترويج النشطة',
    he: 'תובנות ביצועים מעמיקות עבור מודעות ומبצעים'
  },
  ad_analytics_all_campaigns: {
    en: 'All Campaigns',
    ar: 'جميع الحملات',
    he: 'כל הקמפיינים'
  },
  ad_analytics_last_30_days: {
    en: 'Last 30 days',
    ar: 'آخر ٣٠ يومًا',
    he: '30 ימים אחרונים'
  },
  ad_analytics_impressions: {
    en: 'Impressions',
    ar: 'عدد مرات الظهور',
    he: 'חשיפות'
  },
  ad_analytics_clicks: {
    en: 'Clicks',
    ar: 'النقرات',
    he: 'קליקים'
  },
  ad_analytics_ctr: {
    en: 'CTR',
    ar: 'نسبة النقر إلى الظهور',
    he: 'שיעור קליקים'
  },
  ad_analytics_conversions: {
    en: 'Conversions',
    ar: 'التحويلات',
    he: 'המרות'
  },
  ad_analytics_revenue: {
    en: 'Revenue',
    ar: 'الإيرادات',
    he: 'הכנסות'
  },
  ad_analytics_trends_title: {
    en: 'Performance Trends',
    ar: 'اتجاهات الأداء',
    he: 'מגמות ביצועים'
  },
  ad_analytics_trends_subtitle: {
    en: 'Toggle metrics to compare',
    ar: 'قم بتبديل المقاييس للمقارنة',
    he: 'החלף מדדים להשוואה'
  },
  ad_analytics_funnel_title: {
    en: 'Conversion Funnel',
    ar: 'قمع التحويل',
    he: 'משפך המרות'
  },
  ad_analytics_funnel_subtitle: {
    en: 'From impression to conversion',
    ar: 'من الظهور إلى التحويل الفعلي',
    he: 'מחשיפה להמרה'
  },
  ad_analytics_comparison_title: {
    en: 'Campaign Comparison',
    ar: 'مقارنة الحملات',
    he: 'השוואת קמפיינים'
  },
  ad_analytics_comparison_subtitle: {
    en: 'Top 5 campaigns by performance',
    ar: 'أفضل ٥ حملات إعلانية حسب الأداء',
    he: '5 קמפיינים מובילים לפי ביצועים'
  },
  ad_analytics_heatmap_title: {
    en: 'Engagement Heatmap',
    ar: 'خريطة التفاعل الحرارية',
    he: 'מפת חום של מעורבות'
  },
  ad_analytics_heatmap_subtitle: {
    en: 'CTR by day of week and hour of day',
    ar: 'نسبة النقر للظهور حسب أيام الأسبوع وساعات اليوم',
    he: 'שיעور קליקים לפי יום בשבוע ושעה ביום'
  },
  ad_analytics_top_ctr: {
    en: 'Top Ads by CTR',
    ar: 'أفضل الإعلانات حسب نسبة النقر',
    he: 'מודעות מובילות לפי שיעور קליקים'
  },
  ad_analytics_top_categories: {
    en: 'Top Categories',
    ar: 'أهم الفئات المروجة',
    he: 'קטגוריות מובילות'
  },
  ad_analytics_top_cities: {
    en: 'Top Cities',
    ar: 'أهم المدن المروجة',
    he: 'ערים מובילות'
  },

  settings_page_title: {
    en: 'Settings',
    ar: 'الإعدادات',
    he: 'הגדרות'
  },
  settings_page_subtitle: {
    en: 'Roles · security · platform configuration',
    ar: 'الأدوار · الأمن والحماية · تهيئة المنصة',
    he: 'תפקידים · אבטחה · תצורת פלטפורמה'
  },
  settings_tab_roles: {
    en: 'Roles & Permissions',
    ar: 'الأدوار والصلاحيات',
    he: 'תפקידים והרשאות'
  },
  settings_tab_security: {
    en: 'Security',
    ar: 'الأمن والحماية',
    he: 'אבטחה'
  },
  settings_tab_notifications: {
    en: 'Notification preferences',
    ar: 'تفضيلات الإشعارات',
    he: 'העדפות התראות'
  },
  settings_tab_platform: {
    en: 'Platform configuration',
    ar: 'تهيئة المنصة',
    he: 'תצורת פלטפורמה'
  },

  broadcast_title: {
    en: 'Broadcast',
    ar: 'البث المباشر',
    he: 'שידור'
  },
  broadcast_subtitle: {
    en: 'Compose and schedule notifications',
    ar: 'إنشاء وجدولة الإشعارات الموجهة للجمهور',
    he: 'יצירה ותזמון התראות ממוקדות'
  },
  broadcast_total_sent: {
    en: 'Total sent · 30d',
    ar: 'إجمالي المرسل · ٣٠ يوم',
    he: 'סה״כ נשלח · 30 יום'
  },
  broadcast_scheduled: {
    en: 'Scheduled',
    ar: 'المجدولة',
    he: 'מתוזמן'
  },
  broadcast_avg_open_rate: {
    en: 'Avg open rate',
    ar: 'متوسط معدل الفتح',
    he: 'שיעור פתיחה ממוצע'
  },
  broadcast_total_reach: {
    en: 'Total reach',
    ar: 'إجمالي التفاعل',
    he: 'סה״כ תפוצה'
  },
  broadcast_new_broadcast: {
    en: 'New broadcast',
    ar: 'بث جديد',
    he: 'שידור חדש'
  },
  broadcast_compose_subtitle: {
    en: 'Compose your message, choose target channels, and schedule delivery.',
    ar: 'قم بصياغة رسالتك، واختيار قنوات الإرسال وجدولة موعد التسليم.',
    he: 'חבר את ההודעה שלך, בחר ערוצי יעד ותזמן מסירה.'
  },
  broadcast_history: {
    en: 'Broadcast history',
    ar: 'سجل البث المباشر',
    he: 'הيסטورיית שידורים'
  },

  // Notifications Labels
  notifications_title: {
    en: 'Notifications',
    ar: 'الإشعارات',
    he: 'התראות'
  },
  notifications_subtitle: {
    en: 'Real-time admin alerts across the platform',
    ar: 'تنبيهات المسؤولين اللحظية عبر المنصة',
    he: 'התראות מנהל בזמן אמת בפלטפורמה'
  },
  btn_preferences: {
    en: 'Preferences',
    ar: 'التفضيلات',
    he: 'העדפות'
  },
  btn_mark_all_read: {
    en: 'Mark all read',
    ar: 'تحديد الكل كمقروء',
    he: 'סמן הכל כנקרא'
  },
  notifications_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  notifications_unread: {
    en: 'Unread',
    ar: 'غير المقروء',
    he: 'לא נקרא'
  },
  notifications_critical: {
    en: 'Critical',
    ar: 'هام جداً',
    he: 'קריטי'
  },
  notifications_categories: {
    en: 'Alert Categories',
    ar: 'فئات التنبيهات',
    he: 'קטגוריות התראה'
  },
  notifications_what_receive: {
    en: 'What you receive',
    ar: 'ما تتلقاه من تنبيهات',
    he: 'מה שאתה מקבל'
  },
  cat_emergency: {
    en: 'High-Priority Alerts',
    ar: 'تنبيهات عالية الأولوية',
    he: 'התראות בעדיפות גבוהה'
  },
  cat_emergency_desc: {
    en: '3 today · Email · SMS · Push',
    ar: '٣ اليوم · بريد · رسائل قصيرة · دفع',
    he: '3 היום · אימייל · SMS · פוש'
  },
  cat_verification: {
    en: 'Verification requests',
    ar: 'طلبات التحقق',
    he: 'בקשות אימות'
  },
  cat_verification_desc: {
    en: '129 pending · Push',
    ar: '١٢٩ قيد الانتظار · دفع',
    he: '129 ממתינים · פוש'
  },
  cat_failed_payments: {
    en: 'Failed payments',
    ar: 'المدفوعات الفاشلة',
    he: 'תשלומים שנכשלו'
  },
  cat_failed_payments_desc: {
    en: '4 today · Email · Push',
    ar: '٤ اليوم · بريد · دفع',
    he: '4 היום · אימייל · פוש'
  },
  cat_fraud: {
    en: 'AI fraud alerts',
    ar: 'تنبيهات الاحتيال بالذكاء الاصطناعي',
    he: 'התראות הונאה בינה מלאכותית'
  },
  cat_fraud_desc: {
    en: '18 active · Push',
    ar: '١٨ نشط · دفع',
    he: '18 פעיל · פוש'
  },
  cat_user_reports: {
    en: 'New user reports',
    ar: 'بلاغات المستخدمين الجديدة',
    he: 'דיווחי משתמשים חדשים'
  },
  cat_user_reports_desc: {
    en: '8 today · Push',
    ar: '٨ اليوم · دفع',
    he: '8 היום · פוש'
  },
  cat_system_health: {
    en: 'System health',
    ar: 'حالة النظام',
    he: 'בריאות המערכת'
  },
  cat_system_health_desc: {
    en: 'All OK · Email only',
    ar: 'الكل يعمل بشكل جيد · بريد فقط',
    he: 'הכל תקין · אימייל בלבד'
  },

  // Overview Labels
  overview_title: {
    en: 'Overview',
    ar: 'نظرة عامة',
    he: 'סקירה כללית'
  },
  overview_subtitle: {
    en: 'Marketplace performance - Jerusalem region',
    ar: 'أداء السوق - منطقة القدس الشريف',
    he: 'ביצועי שוק - אזור ירושלים'
  },
  btn_export: {
    en: 'Export',
    ar: 'تصدير البيانات',
    he: 'יצוא'
  },
  btn_save_draft: {
    en: 'Preview & Draft',
    ar: 'معاينة ومسودة',
    he: 'תצוגה מקדימה וטיוטה'
  },
  btn_send_now: {
    en: 'Send now',
    ar: 'إرسال الآن',
    he: 'שלח כעת'
  },
  last_7_days: {
    en: 'Last 7 days',
    ar: 'آخر 7 أيام',
    he: '7 הימים האחרונים'
  },

  // Metrics
  metrics_total_users: {
    en: 'Total Users',
    ar: 'إجمالي المستخدمين',
    he: 'סה״כ משתמשים'
  },
  metrics_active_craftsmen: {
    en: 'Active Craftsmen',
    ar: 'الحرفيين النشطين',
    he: 'בעלי מקצוע פעילים'
  },
  metrics_active_tasks: {
    en: 'Active Tasks',
    ar: 'المهام النشطة',
    he: 'משימות פעילות'
  },
  metrics_revenue_mtd: {
    en: 'Revenue MTD',
    ar: 'الأرباح (شهرياً)',
    he: 'הכנסות (מתחילת החודש)'
  },
  metrics_emergency_reqs: {
    en: 'Emergency Reqs',
    ar: 'طلبات الطوارئ',
    he: 'בקשות חירום'
  },
  metrics_verification_reqs: {
    en: 'Verification Reqs',
    ar: 'طلبات التوثيق المعلقة',
    he: 'בקשות אימות'
  },
  metrics_online_now: {
    en: 'online now',
    ar: 'متصل الآن',
    he: 'מחובר עכשיו'
  },

  // Needs Attention
  sec_needs_attention: {
    en: 'Needs attention',
    ar: 'تحتاج إلى اهتمام',
    he: 'דורש טיפול'
  },
  emergency_requests_title: {
    en: 'Emergency requests',
    ar: 'طلبات الطوارئ',
    he: 'בקשות חירום'
  },
  verification_queue_title: {
    en: 'Verification queue',
    ar: 'صف التحقق المعلق',
    he: 'תור אימות'
  },
  emergency_sub: {
    en: '+23% vs yesterday',
    ar: '+23% مقارنة بالأمس',
    he: '+23% לעומת אתמול'
  },
  verification_sub: {
    en: 'Avg SLA 3h 12m',
    ar: 'متوسط وقت الاستجابة 3 ساعات و12 دقيقة',
    he: 'זמן תגובה ממוצע 3 שעות ו-12 דק׳'
  },

  // Categories
  cat_plumbing: {
    en: 'Plumbing',
    ar: 'السباكة',
    he: 'אינסטלציה'
  },
  cat_electrical: {
    en: 'Electrical',
    ar: 'الكهرباء',
    he: 'חשמל'
  },
  cat_ac_repair: {
    en: 'AC Repair',
    ar: 'تصليح التكييف',
    he: 'תיקון מזגנים'
  },
  cat_painting: {
    en: 'Painting',
    ar: 'الدهان والطلاء',
    he: 'צביעה'
  },
  cat_cleaning: {
    en: 'Cleaning',
    ar: 'التنظيف',
    he: 'ניקיון'
  },

  // Reports
  report_service_dispute: {
    en: 'Service Dispute',
    ar: 'خلاف على الخدمة',
    he: 'מחלוקת שירות'
  },
  report_payment_issue: {
    en: 'Payment Issue',
    ar: 'مشكلة في الدفع',
    he: 'בעיית תשלום'
  },
  report_quality_concern: {
    en: 'Quality Concern',
    ar: 'مخاوف بشأن الجودة',
    he: 'בעיית איכות'
  },
  report_no_show: {
    en: 'No-show',
    ar: 'عدم الحضور',
    he: 'אי הגעה'
  },
  report_inappropriate_conduct: {
    en: 'Inappropriate Conduct',
    ar: 'سلوك غير لائق',
    he: 'התנהגות בלתי הולמת'
  },
  time_14m: {
    en: '14m ago',
    ar: 'منذ 14 دقيقة',
    he: 'לפני 14 דק׳'
  },
  time_42m: {
    en: '42m ago',
    ar: 'منذ 42 دقيقة',
    he: 'לפני 42 דק׳'
  },
  time_1h: {
    en: '1h ago',
    ar: 'منذ ساعة',
    he: 'לפני שעה'
  },
  time_2h: {
    en: '2h ago',
    ar: 'منذ ساعتين',
    he: 'לפني שעתיים'
  },
  time_3h: {
    en: '3h ago',
    ar: 'منذ 3 ساعات',
    he: 'לפני 3 שעות'
  },
  time_8m: {
    en: '8m ago',
    ar: 'منذ 8 دقائق',
    he: 'לפני 8 דק׳'
  },
  time_21m: {
    en: '21m ago',
    ar: 'منذ 21 دقيقة',
    he: 'לפני 21 דק׳'
  },
  time_34m: {
    en: '34m ago',
    ar: 'منذ 34 دقيقة',
    he: 'לפני 34 דק׳'
  },
  time_52m: {
    en: '52m ago',
    ar: 'منذ 52 دقيقة',
    he: 'לפני 52 דק׳'
  },
  time_recent: {
    en: 'Recent',
    ar: 'مؤخراً',
    he: 'לאחרונה'
  },

  // Roles
  role_electrician: {
    en: 'Electrician',
    ar: 'فني كهرباء',
    he: 'חשמלאי'
  },
  role_plumber: {
    en: 'Plumber',
    ar: 'سباك',
    he: 'אינסטלטור'
  },
  role_ac_tech: {
    en: 'AC Tech',
    ar: 'فني تكييف',
    he: 'טכנאי מזגנים'
  },
  role_carpenter: {
    en: 'Carpenter',
    ar: 'نجار',
    he: 'נגר'
  },
  role_painter: {
    en: 'Painter',
    ar: 'دهان',
    he: 'צבע'
  },

  // Buttons & Statuses
  btn_review: {
    en: 'Review',
    ar: 'مراجعة',
    he: 'סקירה'
  },
  btn_logout: {
    en: 'Sign Out',
    ar: 'خروج',
    he: 'התנתק'
  },
  btn_refresh: {
    en: 'Refresh Telemetry',
    ar: 'تحديث البيانات',
    he: 'רענן טלמטריה'
  },
  btn_simulate_error: {
    en: 'Simulate Failure',
    ar: 'محاكاة فشل النظام',
    he: 'סמל כישלון מערכת'
  },
  status_loading: {
    en: 'Polling system nodes...',
    ar: 'جاري استعلام عقد النظام...',
    he: 'דוגם צמתי מערכת...'
  },
  status_error: {
    en: 'Fatal: Connection to telemetry node lost.',
    ar: 'خطأ فادح: انقطع الاتصال بعقدة النظام.',
    he: 'שגיאה חמوره: החיבור לצומת הטלמטריה אבד.'
  },
  
  // Dashboard Widget Titles
  sec_revenue_analytics: {
    en: 'Revenue Analytics',
    ar: 'تحليلات الإيرادات',
    he: 'ניתוח הכנסות'
  },
  sec_top_categories: {
    en: 'Top Categories',
    ar: 'الفئات الأعلى طلباً',
    he: 'קטגוריות מובילות'
  },
  sec_by_volume: {
    en: 'By volume',
    ar: 'حسب حجم العمليات',
    he: 'לפי נפח'
  },
  sec_marketplace_growth: {
    en: 'Marketplace Growth',
    ar: 'نمو منصة السوق',
    he: 'צמיחת שוק'
  },
  sec_weekly_cohort: {
    en: 'Weekly cohort velocity',
    ar: 'سرعة نمو المجموعات الأسبوعية',
    he: 'מהירות קבוצה שבועית'
  },
  sec_pending_reports: {
    en: 'Pending Reports',
    ar: 'التقارير المعلقة',
    he: 'דוחות ממתינים'
  },
  sec_recent_verification: {
    en: 'Recent Verification Submissions',
    ar: 'طلبات التوثيق الأخيرة',
    he: 'הגשות אימות אחרונות'
  },
  sec_awaiting_moderator: {
    en: 'Awaiting moderator review',
    ar: 'في انتظار مراجعة المشرف',
    he: 'ממתין לבדיקת מנהל'
  },

  // Service Indicators
  system_healthy: {
    en: 'All healthy',
    ar: 'كل الأنظمة سليمة',
    he: 'הכל תקין'
  },
  api_gateway: {
    en: 'API Gateway',
    ar: 'بوابة البرمجة',
    he: 'שער API'
  },
  payments_service: {
    en: 'Payments',
    ar: 'خدمة الدفع',
    he: 'תשלומים'
  },
  notifications_service: {
    en: 'Notifications',
    ar: 'خدمة الإشعارات',
    he: 'התראות'
  },
  geo_service: {
    en: 'Geo Services',
    ar: 'الخدمات الجغرافية',
    he: 'שירותי מיקום'
  },

  // Mobile Bottom Tab Labels
  tab_overview: {
    en: 'Overview',
    ar: 'نظرة عامة',
    he: 'סקירה כללית'
  },
  tab_activity: {
    en: 'Activity',
    ar: 'النشاط',
    he: 'פעילות'
  },
  tab_verify: {
    en: 'Verify',
    ar: 'التوثيق',
    he: 'אימות'
  },
  tab_tasks: {
    en: 'Tasks',
    ar: 'المهام',
    he: 'משימות'
  },
  tab_payouts: {
    en: 'Payouts',
    ar: 'السحوبات',
    he: 'תשלומים'
  },
  tab_alerts: {
    en: 'Alerts',
    ar: 'التنبيهات',
    he: 'התראות'
  },
  mobile_badge_live: {
    en: 'LIVE',
    ar: 'مباشر',
    he: 'חי'
  },
  mobile_badge_sos: {
    en: 'SOS',
    ar: 'طوارئ',
    he: 'חירום'
  },
  eta_now: {
    en: 'NOW',
    ar: 'الآن',
    he: 'עכשיו'
  },
  eta_done: {
    en: 'Done',
    ar: 'مكتمل',
    he: 'בוצע'
  },
  eta_mins: {
    en: 'min',
    ar: 'دقيقة',
    he: 'דק׳'
  },
  language: {
    en: 'Language',
    ar: 'اللغة',
    he: 'שפה'
  },

  mode_live_api: {
    en: 'Live API',
    ar: 'خادم مباشر',
    he: 'API פעיל'
  },
  mode_mock: {
    en: 'Sandbox Mock',
    ar: 'بيئة تجريبية',
    he: 'סימולטור'
  },
  tooltip_architecture: {
    en: 'Clean architecture isolates Domain rules from Presentation components.',
    ar: 'الهيكل النظيف يعزل قواعد المجال (Domain) عن مكونات العرض (Presentation).',
    he: 'ארכיטקטורה נקייה מבודדת את כללי הדומיין מרכיבי המצגת.'
  },
  dashboard_title: {
    en: 'Overview',
    ar: 'نظرة عامة',
    he: 'סקירה כללית'
  },
  subtitle: {
    en: 'Marketplace performance - Jerusalem region',
    ar: 'أداء السوق - منطقة القدس',
    he: 'ביצועי שוק - אזור ירושלים'
  },
  search_placeholder: {
    en: 'Search users, tasks, transactions...',
    ar: 'ابحث عن المستخدمين، المهام، المعاملات...',
    he: 'חפש משתמשים, משימות, עסקאות...'
  },
  search_placeholder_short: {
    en: 'Search…',
    ar: 'بحث…',
    he: 'חיפוש…'
  },
  tasks_title: {
    en: 'Tasks',
    ar: 'المهام',
    he: 'משימות'
  },
  tasks_subtitle: {
    en: 'Monitor live tasks, freeze suspicious activity, resolve disputes',
    ar: 'مراقبة المهام المباشرة، وتجميد الأنشطة المشبوهة، وحل النزاعات',
    he: 'עקוב אחר משימות חיים, הקפאת פעילות חשודה, פתרון מחלוקות'
  },
  tasks_mobile_subtitle: {
    en: 'Monitor & resolve disputes',
    ar: 'مراقبة وحل النزاعات',
    he: 'עקוב ופתור מחלוקות'
  },
  active_tasks_lbl: {
    en: 'Active tasks',
    ar: 'المهام النشطة',
    he: 'משימות פעילות'
  },
  frozen_lbl: {
    en: 'Frozen',
    ar: 'مجمدة',
    he: 'קפוא'
  },
  completed_today_lbl: {
    en: 'Completed today',
    ar: 'اكتملت اليوم',
    he: 'הושלמו היום'
  },
  all_filter: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  live_filter: {
    en: 'Live',
    ar: 'مباشر',
    he: 'חי'
  },
  completed_filter: {
    en: 'Completed',
    ar: 'اكتملت',
    he: 'הושלם'
  },
  search_tasks_placeholder: {
    en: 'Search by task ID...',
    ar: 'ابحث برقم المهمة...',
    he: 'חפש לפי מזהה משימה...'
  },
  emergency_lbl: {
    en: 'Emergency',
    ar: 'طوارئ',
    he: 'חירום'
  },
  disputed_lbl: {
    en: 'Disputed',
    ar: 'نزاع',
    he: 'במחלוקת'
  },
  task_header_task: {
    en: 'Task',
    ar: 'المهمة',
    he: 'משימה'
  },
  task_header_customer: {
    en: 'Customer',
    ar: 'العميل',
    he: 'לקוח'
  },
  task_header_craftsman: {
    en: 'Craftsman',
    ar: 'الحرفي',
    he: 'בעל מקצוע'
  },
  task_header_zone: {
    en: 'Zone',
    ar: 'المنطقة',
    he: 'אזור'
  },
  task_header_budget: {
    en: 'Budget',
    ar: 'الميزانية',
    he: 'תקציב'
  },
  task_header_eta: {
    en: 'ETA',
    ar: 'الزمن المتوقع',
    he: 'זמן הגעה'
  },
  task_header_status: {
    en: 'Status',
    ar: 'الحالة',
    he: 'סטטוס'
  },
  task_header_actions: {
    en: 'Actions',
    ar: 'الإجراءات',
    he: 'פעולות'
  },
  status_in_progress: {
    en: 'In Progress',
    ar: 'قيد التنفيذ',
    he: 'בתהליך'
  },
  status_emergency: {
    en: 'Emergency',
    ar: 'طوارئ',
    he: 'חירום'
  },
  status_disputed: {
    en: 'Disputed',
    ar: 'متنازع عليه',
    he: 'بمحلוקת'
  },
  status_frozen: {
    en: 'Frozen',
    ar: 'مجمدة',
    he: 'קפוא'
  },
  status_completed: {
    en: 'Completed',
    ar: 'مكتملة',
    he: 'הושלם'
  },
  filters: {
    en: 'Filters',
    ar: 'الفلاتر',
    he: 'מסננים'
  },
  details: {
    en: 'Details',
    ar: 'التفاصيل',
    he: 'פרטים'
  },
  view_details: {
    en: 'View Details',
    ar: 'عرض التفاصيل',
    he: 'הצג פרטים'
  },
  view_all: {
    en: 'View all',
    ar: 'عرض الكل',
    he: 'הצג הכל'
  },
  open_queue: {
    en: 'Open queue',
    ar: 'قائمة الانتظار المفتوحة',
    he: 'תור פתוח'
  },
  require_review: {
    en: 'require review',
    ar: 'تحتاج إلى مراجعة',
    he: 'דורש בדיקה'
  },
  freeze: {
    en: 'Freeze',
    ar: 'تجميد',
    he: 'הקפא'
  },
  unfreeze: {
    en: 'Unfreeze',
    ar: 'إلغاء التجميد',
    he: 'בטל הקפאה'
  },
  emergency_in_progress: {
    en: 'Emergency in progress',
    ar: 'حالة طوارئ قيد التنفيذ',
    he: 'חירום בתהליך'
  },
  bathroom_pipe_burst_sos_text: {
    en: 'Bathroom pipe burst · Hittin · Lina Al-Qahtani triggered SOS 4 min ago. Nearest craftsman: Yousef H. (1.4 km).',
    ar: 'انفجار أنبوب الحمام · حطين · لينا القحطاني أطلقت نداء استغاثة منذ 4 دقائق. أقرب حرفي: يوسف ح. (1.4 كم).',
    he: 'פיצוץ צינור באמבטיה · חיטין · לינה אל-קחטאני הפעילה SOS לפני 4 דקות. בעל המקצוע הקרוב ביותר: יוסף ה. (1.4 ק"מ).'
  },
  view_on_map: {
    en: 'View on map',
    ar: 'عرض على الخريطة',
    he: 'הצג במפה'
  },
  dispatch_backup: {
    en: 'Dispatch backup',
    ar: 'إرسال دعم إضافي',
    he: 'שלח גיבוי'
  },
  dispatch: {
    en: 'Dispatch',
    ar: 'إرسال',
    he: 'שלח'
  },

  // Verification Review Page
  vr_title: {
    en: 'Verification Review',
    ar: 'مراجعة التحقق',
    he: 'בדיקת אימות'
  },
  vr_subtitle: {
    en: 'Moderate craftsman verification submissions',
    ar: 'مراجعة طلبات التوثيق للحرفيين',
    he: 'בדיקת הגשות אימות של בעלי מקצוע'
  },
  vr_in_queue: {
    en: 'in queue',
    ar: 'في قائمة الانتظار',
    he: 'בתור'
  },
  vr_avg_sla: {
    en: 'Avg SLA',
    ar: 'متوسط وقت المعالجة',
    he: 'זמן ממוצע'
  },
  vr_review_queue: {
    en: 'Review Queue',
    ar: 'قائمة المراجعة',
    he: 'תור בדיקה'
  },
  vr_awaiting_mod: {
    en: 'Awaiting moderation',
    ar: 'في انتظار المراجعة',
    he: 'ממתין לאישור'
  },
  vr_submitted: {
    en: 'Submitted',
    ar: 'تقديم',
    he: 'הוגש'
  },
  vr_flag: {
    en: 'Flag',
    ar: 'الإبلاغ',
    he: 'סמן'
  },
  vr_reject: {
    en: 'Reject',
    ar: 'رفض',
    he: 'דחה'
  },
  vr_approve_all: {
    en: 'Approve all',
    ar: 'قبول الكل',
    he: 'אשר הכל'
  },
  vr_tab_profile_info: {
    en: 'Profile Info',
    ar: 'الملف الشخصي',
    he: 'פרופיל אישי'
  },
  vr_tab_national_id: {
    en: 'National ID',
    ar: 'الهوية الوطنية',
    he: 'תעודת זהות'
  },
  vr_tab_face_match: {
    en: 'Face match',
    ar: 'تطابق الوجه',
    he: 'זיהוי פנים'
  },
  vr_tab_portfolio: {
    en: 'Portfolio',
    ar: 'معرض الأعمال',
    he: 'תיק עבודות'
  },
  vr_tab_skills: {
    en: 'Skills',
    ar: 'المهارات',
    he: 'מיומנויות'
  },
  vr_front_side: {
    en: 'Front side',
    ar: 'الوجه الأمامي',
    he: 'צד קדמי'
  },
  vr_back_side: {
    en: 'Back side',
    ar: 'الوجه الخلفي',
    he: 'צד אחורי'
  },
  vr_doc_type: {
    en: 'Document type',
    ar: 'نوع الوثيقة',
    he: 'סוג מסמך'
  },
  vr_detected_name: {
    en: 'Detected name',
    ar: 'الاسم المستخرج',
    he: 'שם שזוהה'
  },
  vr_ocr_confidence: {
    en: 'OCR confidence',
    ar: 'دقة التعرف الضوئي',
    he: 'דיוק OCR'
  },
  vr_expiry: {
    en: 'Expiry',
    ar: 'تاريخ الانتهاء',
    he: 'תאריך פקיעה'
  },
  vr_moderator_notes: {
    en: 'Moderator notes',
    ar: 'ملاحظات المشرف',
    he: 'הערות מנהל'
  },
  vr_notes_placeholder: {
    en: 'Add a note for the audit log...',
    ar: 'أضف ملاحظة لسجل المراجعة...',
    he: 'הוסף הערה ליומן הביקורת...'
  },
  vr_id_photo: {
    en: 'ID photo',
    ar: 'صورة الهوية',
    he: 'תמונת מזהה'
  },
  vr_selfie_liveness: {
    en: 'Selfie · liveness check',
    ar: 'صورة شخصية · التحقق من الحيوية',
    he: 'סלפי · בדיקת חיות'
  },
  vr_face_match_score: {
    en: 'Face match score',
    ar: 'نسبة تطابق الوجه',
    he: 'ציון התאמת פנים'
  },
  vr_portfolio_subtitle: {
    en: 'Portfolio submissions · 6 photos',
    ar: 'معرض الأعمال · 6 صور',
    he: 'הגשות תיק עבודות · 6 תמונות'
  },
  vr_skills_certifications: {
    en: 'Skills & certifications',
    ar: 'المهارات والشهادات',
    he: 'מיומנויות והסמכות'
  },
  vr_badge_verified: {
    en: 'Verified',
    ar: 'موثق',
    he: 'מאומת'
  },
  vr_badge_missing: {
    en: 'Missing',
    ar: 'مفقود',
    he: 'חסר'
  },
  vr_skill_plumbing_cert: {
    en: 'TVTC Plumbing Certificate · 2021',
    ar: 'شهادة سباكة من المؤسسة العامة · 2021',
    he: 'תעודת אינסטלציה TVTC · 2021'
  },
  vr_skill_sce_license: {
    en: 'Engineers Association - Jerusalem · License',
    ar: 'نقابة المهندسين - القدس · ترخيص',
    he: 'איגוד המהנדסים - ירושלים · רישיון'
  },
  vr_skill_experience: {
    en: 'Pipe burst emergency · 12 years experience',
    ar: 'طوارئ انفجار الأنابيب · خبرة 12 سنة',
    he: 'חירום פיצוץ צינור · 12 שנות ניסיון'
  },
  vr_skill_insurance: {
    en: 'Insurance coverage · 500K ILS liability',
    ar: 'التغطية التأمينية · مسؤولية 500 ألف شيكل',
    he: 'כיסוי ביטוחי · אחריות של 500 אלף ש"ח'
  },
  vr_pending: {
    en: 'Pending',
    ar: 'قيد الانتظار',
    he: 'ממתין'
  },
  vr_flagged: {
    en: 'Flagged',
    ar: 'مبلّغ عنها',
    he: 'מסומן'
  },
  vr_today: {
    en: 'Today',
    ar: 'اليوم',
    he: 'היום'
  },
  vr_back_queue: {
    en: 'Back to Queue',
    ar: 'العودة إلى القائمة',
    he: 'חזור לרשימה'
  },
  vr_risk: {
    en: 'Risk',
    ar: 'المخاطر',
    he: 'סיכון'
  },
  vr_face: {
    en: 'Face',
    ar: 'الوجه',
    he: 'פנים'
  },
  vr_docs: {
    en: 'Docs',
    ar: 'الوثائق',
    he: 'מסמכים'
  },
  reports_title: {
    en: 'Reports & Moderation',
    ar: 'التقارير والإشراف',
    he: 'דוחות ופיקוח'
  },
  reports_subtitle: {
    en: 'AI-flagged risk · user reports · safety management',
    ar: 'مخاطر محددة بالذكاء الاصطناعي · تقارير المستخدمين · إدارة السلامة',
    he: 'סיכון מסומן ב-AI · דיווחי משתמשים · ניהול בטיחות'
  },
  reports_ai_detection_on: {
    en: 'AI Detection · ON',
    ar: 'كشف الذكاء الاصطناعي · مفعل',
    he: 'זיהוי AI · פעיל'
  },
  reports_ai_detection_off: {
    en: 'AI Detection · OFF',
    ar: 'كشف الذكاء الاصطناعي · معطل',
    he: 'זיהוי AI · כבוי'
  },
  reports_open_reports: {
    en: 'Open reports',
    ar: 'التقارير المفتوحة',
    he: 'דוחות פתוחים'
  },
  reports_high_severity_sub: {
    en: '12 high severity',
    ar: '12 شديدة الأهمية',
    he: '12 בחומרה גבוהה'
  },
  reports_fraud_signals: {
    en: 'Fraud signals',
    ar: 'إشارات الاحتيال',
    he: 'אותות הונאה'
  },
  reports_ai_detected_sub: {
    en: 'AI-detected',
    ar: 'تم كشفها بالذكاء الاصطناعي',
    he: 'זוהה על ידי AI'
  },
  reports_fake_accounts: {
    en: 'Fake accounts',
    ar: 'الحسابات المزيفة',
    he: 'חשבונות מזויפים'
  },
  reports_pending_review_sub: {
    en: 'pending review',
    ar: 'قيد المراجعة',
    he: 'ממתין לסקירה'
  },
  reports_risk_score_avg: {
    en: 'Risk score (avg)',
    ar: 'متوسط درجة المخاطر',
    he: 'ציון סיכון (ממוצע)'
  },
  reports_platform_wide_sub: {
    en: 'platform-wide',
    ar: 'على مستوى المنصة',
    he: 'בכל הפלטפורמה'
  },
  reports_severity_high: {
    en: 'high',
    ar: 'مرتفع',
    he: 'גבוהה'
  },
  reports_severity_medium: {
    en: 'medium',
    ar: 'متوسط',
    he: 'בינונית'
  },
  reports_severity_low: {
    en: 'low',
    ar: 'منخفض',
    he: 'נמוכה'
  },
  reports_ai: {
    en: 'AI',
    ar: 'ذكاء اصطناعي',
    he: 'AI'
  },
  reports_desc: {
    en: 'Description',
    ar: 'الوصف',
    he: 'תיאור'
  },
  reports_reporter: {
    en: 'Reporter',
    ar: 'المبلغ',
    he: 'מדווח'
  },
  reports_subject: {
    en: 'Subject',
    ar: 'الموضوع/المبلغ عنه',
    he: 'נושא'
  },
  reports_dismiss: {
    en: 'Dismiss',
    ar: 'صرف النظر',
    he: 'התעלם'
  },
  reports_suspend: {
    en: 'Suspend',
    ar: 'تعليق الحساب',
    he: 'השעיה'
  },
  reports_ban: {
    en: 'Ban',
    ar: 'حظر',
    he: 'חסימה'
  },
  reports_chat: {
    en: 'Chat',
    ar: 'المحادثة',
    he: "צ'אט"
  },
  reports_versus: {
    en: 'vs',
    ar: 'ضد',
    he: 'נגד'
  },
  reports_risk_score_title: {
    en: 'AI Risk Score',
    ar: 'درجة مخاطر الذكاء الاصطناعي',
    he: 'ציון סיכון AI'
  },
  reports_notes_label: {
    en: 'Moderator notes',
    ar: 'ملاحظات المشرف',
    he: 'הערות מנהל'
  },
  reports_notes_placeholder: {
    en: 'Add note for audit log...',
    ar: 'أضف ملاحظة لسجل المراجعة...',
    he: 'הוסף הערה ליומן הביקורת...'
  },
  reports_back_queue: {
    en: 'Back to Queue',
    ar: 'العودة إلى القائمة',
    he: 'חזור לרשימה'
  },
  reports_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  reports_filter_fraud: {
    en: 'Fraud',
    ar: 'احتيال',
    he: 'הונאה'
  },
  reports_filter_fake_accounts: {
    en: 'Fake accounts',
    ar: 'حسابات مزيفة',
    he: 'חשבונות מזויפים'
  },
  reports_filter_chats: {
    en: 'Chats',
    ar: 'المحادثات',
    he: 'צ׳אטים'
  },
  reports_filter_ai_alerts: {
    en: 'AI Alerts',
    ar: 'تنبيهات الذكاء الاصطناعي',
    he: 'התראות AI'
  },
  reports_filter_spam: {
    en: 'Spam',
    ar: 'محتوى غير مرغوب',
    he: 'ספאם'
  },
  promotions_title: {
    en: 'Craftsman Promotions',
    ar: 'عروض الحرفيين',
    he: 'מבצעי בעלי מקצוע'
  },
  promotions_subtitle: {
    en: 'Manage sponsored listings, featured profiles and custom tiers',
    ar: 'إدارة الإعلانات الممولة والملفات المميزة وفئات الترويج',
    he: 'נהל רשימות ממומנות, פרופילים מומלצים ודרגות מותאמות אישית'
  },
  promotions_new_promotion: {
    en: 'New Promotion',
    ar: 'عرض جديد',
    he: 'מבצע חדש'
  },
  promotions_active_sponsorships: {
    en: 'Active Sponsorships',
    ar: 'العقود النشطة',
    he: 'חסויות פעילות'
  },
  promotions_featured_profiles: {
    en: 'Featured Profiles',
    ar: 'الحسابات المميزة',
    he: 'פרופילים מומלצים'
  },
  promotions_boost_revenue_mtd: {
    en: 'Boost Revenue (MTD)',
    ar: 'إيرادات الترويج (هذا الشهر)',
    he: 'הכנסות מקידום (חודשי)'
  },
  promotions_avg_boost_lift: {
    en: 'Avg Boost Lift',
    ar: 'متوسط نسبة النمو',
    he: 'שיפור ממוצע בקידום'
  },
  promotions_packages_title: {
    en: 'Promotion Packages',
    ar: 'باقات الترويج',
    he: 'חבילות קידום'
  },
  promotions_packages_subtitle: {
    en: 'Subscription tiers available to craftsmen to boost their visibility.',
    ar: 'باقات الاشتراك المتاحة للحرفيين لزيادة ظهورهم في المنصة.',
    he: 'דרגות מנוי הזמינות לבעלי מקצוע כדי להגביר את הנראות שלהם.'
  },
  promotions_active_sponsored_title: {
    en: 'Active Sponsored Craftsmen',
    ar: 'الحرفيين النشطين الممولين',
    he: 'בעלי מקצוע ממומנים פעילים'
  },
  promotions_active_sponsored_subtitle: {
    en: 'Currently boosted profiles across categories and cities.',
    ar: 'الملفات الشخصية المروجة حالياً في مختلف الفئات والمدن.',
    he: 'פרופילים מקודמים כרגע בקטגוריות וערים שונות.'
  },
  promotions_features_title: {
    en: 'Promotion Features',
    ar: 'مميزات الترويج',
    he: 'תכונות קידום'
  },
  promotions_features_subtitle: {
    en: 'Globally enable or disable available promotion features.',
    ar: 'تفعيل أو تعطيل مميزات الترويج المتاحة بشكل عام على المنصة.',
    he: 'הפעל או השבת תכונות קידום זמינות באופן גלובלי.'
  },
  promotions_search_placeholder: {
    en: 'Search craftsmen, categories, packages...',
    ar: 'ابحث عن الحرفيين، الفئات، الباقات...',
    he: 'חפש בעלי מקצוע, קטגוריות, חבילות...'
  },
  promotions_view_all: {
    en: 'View all',
    ar: 'عرض الكل',
    he: 'הצג הכל'
  },
  promotions_edit_package: {
    en: 'Edit Package',
    ar: 'تعديل الباقة',
    he: 'ערוך חבילה'
  },
  promotions_edit_modal_title: {
    en: 'Edit Package Rates',
    ar: 'تعديل أسعار الباقة',
    he: 'ערוך תעריפי חבילה'
  },
  promotions_save_changes: {
    en: 'Save Changes',
    ar: 'حفظ التغييرات',
    he: 'שמור שינויים'
  },
  promotions_cancel: {
    en: 'Cancel',
    ar: 'إلغاء',
    he: 'ביטול'
  },
  promotions_craftsman: {
    en: 'Craftsman',
    ar: 'الحرفي',
    he: 'בעל מקצוע'
  },
  promotions_category: {
    en: 'Category',
    ar: 'الفئة',
    he: 'קטגוריה'
  },
  promotions_city: {
    en: 'City',
    ar: 'المدينة',
    he: 'עיר'
  },
  promotions_package: {
    en: 'Package',
    ar: 'الباقة',
    he: 'חבילה'
  },
  promotions_days_left: {
    en: 'Days Left',
    ar: 'الأيام المتبقية',
    he: 'ימים שנותרו'
  },
  promotions_views: {
    en: 'Views',
    ar: 'المشاهدات',
    he: 'צפיות'
  },
  promotions_clicks: {
    en: 'Clicks',
    ar: 'النقرات',
    he: 'קליקים'
  },
  promotions_conv: {
    en: 'Conv.',
    ar: 'نسبة التحويل',
    he: 'יחס המרה'
  },
  promotions_active: {
    en: 'Active',
    ar: 'نشط',
    he: 'פעיל'
  },
  promotions_inactive: {
    en: 'Inactive',
    ar: 'غير نشط',
    he: 'לא פעיל'
  },
  val_required: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
    he: 'שדה זה נדרש'
  },
  val_min_len: {
    en: 'Minimum {n} characters',
    ar: 'الحد الأدنى {n} أحرف',
    he: 'מינימום {n} תווים'
  },
  val_max_len: {
    en: 'Maximum {n} characters',
    ar: 'الحد الأقصى {n} أحرف',
    he: 'מקסימום {n} תווים'
  },
  val_positive: {
    en: 'Must be greater than 0',
    ar: 'يجب أن يكون أكبر من 0',
    he: 'חייב להיות גדול מ-0'
  },
  val_int: {
    en: 'Must be a whole number',
    ar: 'يجب أن يكون رقمًا صحيحًا',
    he: 'חייב להיות מספר שלם'
  },
  val_range: {
    en: 'Must be between {n}',
    ar: 'يجب أن يكون بين {n}',
    he: 'חייב להיות בין {n}'
  },
  val_url: {
    en: 'Enter a valid http(s) link',
    ar: 'أدخل رابط http(s) صالحًا',
    he: 'הזן קישור http(s) תקין'
  },
  val_email: {
    en: 'Enter a valid email',
    ar: 'أدخل بريدًا إلكترونيًا صالحًا',
    he: 'הזן כתובת אימייל תקינה'
  },
  val_phone: {
    en: 'Enter a valid phone number',
    ar: 'أدخل رقم هاتف صالحًا',
    he: 'הזן מספר טלפון תקין'
  },
  val_key_format: {
    en: 'Use 3–32 capital letters, digits or _',
    ar: 'استخدم 3–32 حرفًا كبيرًا أو أرقامًا أو _',
    he: 'השתמש ב-3–32 אותיות גדולות, ספרות או _'
  },
  val_date_order: {
    en: 'End must be after start',
    ar: 'يجب أن تكون النهاية بعد البداية',
    he: 'הסיום חייב להיות אחרי ההתחלה'
  },
  val_future: {
    en: 'Must be in the future',
    ar: 'يجب أن يكون في المستقبل',
    he: 'חייב להיות בעתיד'
  },
  val_max_items: {
    en: 'At most {n} items',
    ar: 'بحد أقصى {n} عناصر',
    he: 'לכל היותר {n} פריטים'
  },
  val_letter: {
    en: 'Must contain a letter',
    ar: 'يجب أن يحتوي على حرف',
    he: 'חייב להכיל אות'
  },
  val_digit: {
    en: 'Must contain a digit',
    ar: 'يجب أن يحتوي على رقم',
    he: 'חייב להכיל ספרה'
  },
  val_match: {
    en: 'Passwords do not match',
    ar: 'كلمتا المرور غير متطابقتين',
    he: 'הסיסמאות אינן תואמות'
  },
  err_generic: {
    en: 'Something went wrong. Please try again.',
    ar: 'حدث خطأ ما. حاول مرة أخرى.',
    he: 'משהו השתבש. נסה שוב.'
  },
  err_network: {
    en: 'Network error. Please check your connection.',
    ar: 'خطأ في الشبكة. تحقق من اتصالك.',
    he: 'שגיאת רשת. בדוק את החיבור.'
  },
  err_timeout: {
    en: 'Request timed out. Please try again.',
    ar: 'انتهت مهلة الطلب. حاول مرة أخرى.',
    he: 'הבקשה נכשלה. נסה שוב.'
  },
  err_server: {
    en: 'Server error. Please try again later.',
    ar: 'خطأ في الخادم. حاول لاحقًا.',
    he: 'שגיאת שרת. נסה שוב מאוחר יותר.'
  },
  err_forbidden: {
    en: 'You do not have permission to perform this action.',
    ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.',
    he: 'אין לך הרשאה לבצע פעולה זו.'
  },
  err_session_expired: {
    en: 'Session expired. Please log in again.',
    ar: 'انتهت الجلسة. سجل الدخول مرة أخرى.',
    he: 'ההפעלה פגה. התחבר שוב.'
  },
  err_not_found: {
    en: 'The requested item was not found.',
    ar: 'العنصر المطلوب غير موجود.',
    he: 'הפריט המבוקש לא נמצא.'
  },
  err_conflict: {
    en: 'This action conflicts with the current state. Please refresh and try again.',
    ar: 'يتعارض هذا الإجراء مع الحالة الحالية. حدّث الصفحة وحاول مرة أخرى.',
    he: 'הפעולה מתנגשת עם המצב הנוכחי. רענן ונסה שוב.'
  },
  err_duplicate: {
    en: 'An item with these details already exists.',
    ar: 'يوجد عنصر بهذه التفاصيل مسبقًا.',
    he: 'פריט עם פרטים אלה כבר קיים.'
  },
  err_commission_debt: {
    en: "Settle the craftsman's outstanding commission first.",
    ar: 'سدّد عمولة الحرفي المستحقة أولًا.',
    he: 'שלם תחילה את העמלה המגיעה.'
  },
  err_request_already_approved: {
    en: 'This request has already been reviewed.',
    ar: 'تمت مراجعة هذا الطلب مسبقًا.',
    he: 'הבקשה כבר נבדקה.'
  },
  err_free_tasks_range: {
    en: 'Free tasks must be a whole number from 0 to 100.',
    ar: 'يجب أن تكون المهام المجانية رقمًا صحيحًا من 0 إلى 100.',
    he: 'משימות חינם חייבות להיות מספר שלם מ-0 עד 100.'
  },
  err_ledger_mismatch: {
    en: 'The payment no longer matches its outstanding commission entries.',
    ar: 'الدفعة لم تعد تطابق قيود العمولة المستحقة.',
    he: 'התשלום אינו תואם עוד את רשומות העמלה.'
  },
  err_verification_not_reviewable: {
    en: 'This request cannot be reviewed in its current state.',
    ar: 'لا يمكن مراجعة هذا الطلب في حالته الحالية.',
    he: 'לא ניתן לבדוק בקשה זו במצבה הנוכחי.'
  },
  err_verification_incomplete: {
    en: 'Verification evidence is incomplete.',
    ar: 'أدلة التحقق غير مكتملة.',
    he: 'ראיות האימות אינן שלמות.'
  },
  // Verification review
  vr_meta_queue: { en: '{n} in queue', ar: '{n} في الانتظار', he: '{n} בתור' },
  vr_meta_auto_on: { en: 'Auto-verification: Active', ar: 'التحقق التلقائي: مفعّل', he: 'אימות אוטומטי: פעיל' },
  vr_meta_auto_off: { en: 'Auto-verification: Disabled', ar: 'التحقق التلقائي: معطّل', he: 'אימות אוטומטי: כבוי' },
  vr_sla_left: { en: 'SLA {n}h left', ar: 'متبقي {n} ساعة للاتفاقية', he: 'נותרו {n} שעות ל-SLA' },
  vr_btn_queue: { en: 'Queue', ar: 'الطابور', he: 'תור' },
  vr_queue_eyebrow: { en: 'Review queue', ar: 'طابور المراجعة', he: 'תור בדיקה' },
  vr_queue_title: { en: 'Awaiting moderation', ar: 'بانتظار المراجعة', he: 'ממתין לבדיקה' },
  vr_tab_pending: { en: 'Pending', ar: 'معلق', he: 'ממתין' },
  vr_tab_flagged: { en: 'Flagged', ar: 'مُعلَّم', he: 'מסומן' },
  vr_tab_approved: { en: 'Approved', ar: 'معتمد', he: 'מאושר' },
  vr_tab_all: { en: 'All', ar: 'الكل', he: 'הכל' },
  vr_queue_clear_title: { en: 'Queue is clear', ar: 'الطابور فارغ', he: 'התור ריק' },
  vr_queue_clear_auto: {
    en: 'All applications processed. Real-time auto-verification is currently active.',
    ar: 'تمت معالجة جميع الطلبات. التحقق التلقائي الفوري مفعّل حاليًا.',
    he: 'כל הבקשות טופלו. האימות האוטומטי בזמן אמת פעיל כעת.'
  },
  vr_queue_clear_manual: {
    en: 'No craftsman submissions awaiting moderator decision.',
    ar: 'لا توجد طلبات حرفيين بانتظار قرار المشرف.',
    he: 'אין בקשות של בעלי מקצוע הממתינות להחלטת מנהל.'
  },
  vr_high_risk: { en: 'High risk', ar: 'خطورة عالية', he: 'סיכון גבוה' },
  vr_page_of: { en: 'Page {n}', ar: 'صفحة {n}', he: 'עמוד {n}' },
  vr_btn_prev: { en: 'Previous', ar: 'السابق', he: 'הקודם' },
  vr_btn_next: { en: 'Next', ar: 'التالي', he: 'הבא' },
  vr_role_default: { en: 'Craftsman', ar: 'حرفي', he: 'בעל מקצוע' },
  vr_submitted_at: { en: 'Submitted {when}', ar: 'قُدّم {when}', he: 'הוגש {when}' },
  vr_id_label: { en: 'ID #{id}', ar: 'المعرّف #{id}', he: 'מזהה #{id}' },
  vr_btn_flag: { en: 'Flag', ar: 'تعليم', he: 'סימון' },
  vr_btn_reject: { en: 'Reject', ar: 'رفض', he: 'דחייה' },
  vr_btn_approve_all: { en: 'Approve all', ar: 'موافقة على الكل', he: 'אישור הכל' },
  vr_approve_title: { en: 'Approve {name}', ar: 'الموافقة على {name}', he: 'אישור {name}' },
  vr_approve_body: {
    en: 'Approving activates this craftsman on the platform. All verification badges will be granted:',
    ar: 'تفعّل الموافقة هذا الحرفي على المنصة. سيتم منح جميع شارات التحقق:',
    he: 'האישור מפעיל את בעל המקצוע בפלטפורמה. כל תגי האימות יוענקו:'
  },
  vr_badge_id: { en: 'National ID', ar: 'الهوية الوطنية', he: 'תעודת זהות' },
  vr_badge_cert: { en: 'Trade certificate', ar: 'شهادة المهنة', he: 'תעודת מקצוע' },
  vr_badge_selfie: { en: 'Selfie / face match', ar: 'السيلفي / مطابقة الوجه', he: 'סלפי / התאמת פנים' },
  vr_badge_background: { en: 'Background check', ar: 'الفحص الأمني', he: 'בדיקת רקע' },
  vr_badge_insured: { en: 'Insurance', ar: 'التأمين', he: 'ביטוח' },
  vr_approve_confirm: { en: 'Approve submission', ar: 'الموافقة على الطلب', he: 'אשר בקשה' },
  vr_reject_title: { en: 'Reject {name}', ar: 'رفض {name}', he: 'דחיית {name}' },
  vr_reject_body: {
    en: 'Please provide a reason for rejecting this verification request. This note will be recorded in the audit log.',
    ar: 'يرجى ذكر سبب رفض طلب التحقق هذا. سيتم تسجيل هذه الملاحظة في سجل التدقيق.',
    he: 'נא לציין סיבה לדחיית בקשת האימות. ההערה תירשם ביומן הביקורת.'
  },
  vr_reject_confirm: { en: 'Reject submission', ar: 'رفض الطلب', he: 'דחה בקשה' },
  vr_reject_placeholder: {
    en: 'Explain why this submission is rejected (e.g. blurry ID photo)…',
    ar: 'اشرح سبب رفض الطلب (مثل: صورة الهوية غير واضحة)…',
    he: 'הסבר מדוע הבקשה נדחית (למשל: תמונת תעודה מטושטשת)…'
  },
  vr_flag_title: { en: 'Flag {name}', ar: 'تعليم {name}', he: 'סימון {name}' },
  vr_flag_body: {
    en: 'Flagging marks this submission for suspicious activity or secondary escalation.',
    ar: 'يؤدي التعليم إلى وسم الطلب للاشتباه بنشاط مريب أو للتصعيد الثانوي.',
    he: 'הסימון מסמן בקשה זו בשל פעילות חשודה או להסלמה נוספת.'
  },
  vr_flag_confirm: { en: 'Flag submission', ar: 'تعليم الطلب', he: 'סמן בקשה' },
  vr_flag_placeholder: {
    en: 'Reason for flagging (e.g. mismatched document numbers)…',
    ar: 'سبب التعليم (مثل: أرقام المستندات غير متطابقة)…',
    he: 'סיבת הסימון (למשל: מספרי מסמכים לא תואמים)…'
  },
  vr_toast_approved: { en: '{name} approved', ar: 'تمت الموافقة على {name}', he: '{name} אושר' },
  vr_toast_rejected: { en: '{name} rejected', ar: 'تم رفض {name}', he: '{name} נדחה' },
  vr_toast_flagged: { en: '{name} flagged', ar: 'تم تعليم {name}', he: '{name} סומן' },
  vr_incomplete_title: {
    en: 'Incomplete verification evidence',
    ar: 'أدلة التحقق غير مكتملة',
    he: 'ראיות אימות חסרות'
  },
  vr_no_selection_title: { en: 'No submission selected', ar: 'لم يتم اختيار طلب', he: 'לא נבחרה בקשה' },
  vr_no_selection_desc: {
    en: 'Select an application from the review queue to inspect documents.',
    ar: 'اختر طلبًا من طابور المراجعة لفحص المستندات.',
    he: 'בחר בקשה מתור הבדיקה כדי לעיין במסמכים.'
  },
  vr_drawer_title: { en: 'Review queue', ar: 'طابور المراجعة', he: 'תור בדיקה' },
  vr_step_national_id: { en: 'National ID', ar: 'الهوية الوطنية', he: 'תעודת זהות' },
  vr_step_face_match: { en: 'Face Match', ar: 'مطابقة الوجه', he: 'התאמת פנים' },
  vr_step_skills: { en: 'Trade & Skills', ar: 'المهنة والمهارات', he: 'מקצוע ומיומנויות' },
  vr_step_portfolio: { en: 'Portfolio', ar: 'معرض الأعمال', he: 'תיק עבודות' },
  vr_step_profile_info: { en: 'Personal Info', ar: 'المعلومات الشخصية', he: 'פרטים אישיים' },
  vr_step_review_decision: { en: 'Audit & Notes', ar: 'التدقيق والملاحظات', he: 'ביקורת והערות' },
  vr_missing_evidence: { en: 'Missing verification evidence', ar: 'أدلة التحقق ناقصة', he: 'ראיות אימות חסרות' },
  vr_audit_eyebrow: { en: 'Compliance audit', ar: 'تدقيق الامتثال', he: 'ביקורת תאימות' },
  vr_audit_title: { en: '5-step verification audit checklist', ar: 'قائمة تدقيق التحقق من 5 خطوات', he: 'רשימת ביקורת אימות בת 5 שלבים' },
  vr_audit_1: { en: 'Personal details & contact', ar: 'البيانات الشخصية والاتصال', he: 'פרטים אישיים ויצירת קשר' },
  vr_audit_2: { en: 'National ID identification', ar: 'تحديد الهوية الوطنية', he: 'זיהוי תעודת זהות' },
  vr_audit_3: { en: 'Biometric face match & liveness', ar: 'مطابقة الوجه البيومترية والحيوية', he: 'התאמת פנים וחיות ביומטרית' },
  vr_audit_4: { en: 'Trade specialization & skills', ar: 'التخصص المهني والمهارات', he: 'התמחות מקצועית ומיומנויות' },
  vr_audit_5: { en: 'Compliance moderation status', ar: 'حالة مراجعة الامتثال', he: 'סטטוס בדיקת תאימות' },
  vr_audit_match: { en: '{n}% match score', ar: 'نسبة المطابقة {n}%', he: 'ציון התאמה {n}%' },
  vr_audit_selfie_uploaded: { en: 'Selfie uploaded', ar: 'تم رفع السيلفي', he: 'סלפי הועלה' },
  vr_audit_years: { en: '{n} yrs exp', ar: '{n} سنوات خبرة', he: '{n} שנות ניסיון' },
  vr_audit_awaiting: { en: 'Awaiting decision', ar: 'بانتظار القرار', he: 'ממתין להחלטה' },
  vr_state_verified: { en: 'Verified', ar: 'تم التحقق', he: 'מאומת' },
  vr_state_pending: { en: 'Pending', ar: 'معلق', he: 'ממתין' },
  vr_state_pending_review: { en: 'Pending review', ar: 'بانتظار المراجعة', he: 'ממתין לבדיקה' },
  vr_notes_eyebrow: { en: 'Audit log', ar: 'سجل التدقيق', he: 'יומן ביקורת' },
  vr_notes_title: { en: 'Moderator notes', ar: 'ملاحظات المشرف', he: 'הערות מנהל' },
  vr_notes_required_hint: {
    en: 'A note is required to reject or flag a submission.',
    ar: 'الملاحظة مطلوبة لرفض الطلب أو تعليمه.',
    he: 'נדרשת הערה כדי לדחות או לסמן בקשה.'
  },
  vr_preset_1: {
    en: 'Verified national ID and selfie match successfully.',
    ar: 'تم التحقق من الهوية الوطنية وتطابق السيلفي بنجاح.',
    he: 'תעודת הזהות אומתה והסלפי תואם בהצלחה.'
  },
  vr_preset_2: {
    en: 'ID document photo is blurry; please re-upload clear photos.',
    ar: 'صورة وثيقة الهوية غير واضحة؛ يرجى إعادة رفع صور واضحة.',
    he: 'תמונת תעודת הזהות מטושטשת; נא להעלות תמונות ברורות.'
  },
  vr_preset_3: {
    en: 'Selfie does not match photo on national ID card.',
    ar: 'السيلفي لا يطابق الصورة على بطاقة الهوية الوطنية.',
    he: 'הסלפי אינו תואם לתמונה בתעודת הזהות.'
  },
  vr_preset_4: {
    en: 'Trade certification verified with local licensing board.',
    ar: 'تم التحقق من شهادة المهنة لدى جهة الترخيص المحلية.',
    he: 'תעודת המקצוע אומתה מול רשות הרישוי המקומית.'
  },
  vr_preset_5: {
    en: 'Applicant approved for marketplace dispatch.',
    ar: 'تمت الموافقة على المتقدم للعمل في المنصة.',
    he: 'המועמד אושר לשיבוץ בפלטפורמה.'
  },
  vr_doc_zoom: { en: 'Zoom {title}', ar: 'تكبير {title}', he: 'הגדל {title}' },
  vr_doc_load_failed: { en: 'Failed to load image', ar: 'فشل تحميل الصورة', he: 'טעינת התמונה נכשלה' },
  vr_doc_none: { en: 'No document uploaded', ar: 'لم يتم رفع مستند', he: 'לא הועלה מסמך' },
  vr_doc_none_hint: { en: '{name} has not submitted this photo yet.', ar: 'لم يقدّم {name} هذه الصورة بعد.', he: '{name} עדיין לא הגיש תמונה זו.' },
  vr_id_front: { en: 'Front side', ar: 'الوجه الأمامي', he: 'צד קדמי' },
  vr_id_back: { en: 'Back side', ar: 'الوجه الخلفي', he: 'צד אחורי' },
  vr_field_doc_type: { en: 'Document type', ar: 'نوع المستند', he: 'סוג מסמך' },
  vr_field_detected_name: { en: 'Detected name', ar: 'الاسم المكتشف', he: 'שם שזוהה' },
  vr_field_expiry: { en: 'Expiry date', ar: 'تاريخ الانتهاء', he: 'תאריך תפוגה' },
  vr_field_ocr: { en: 'OCR confidence', ar: 'دقة القراءة الآلية', he: 'רמת ביטחון OCR' },
  vr_field_doc_status: { en: 'Document status', ar: 'حالة المستند', he: 'סטטוס מסמך' },
  vr_field_city: { en: 'City / district', ar: 'المدينة / المنطقة', he: 'עיר / אזור' },
  vr_match_label: { en: 'Biometric face match confidence', ar: 'نسبة ثقة مطابقة الوجه', he: 'רמת ביטחון התאמת פנים' },
  vr_match_value: { en: '{n}% match', ar: 'مطابقة {n}%', he: 'התאמה {n}%' },
  vr_liveness_ok: { en: 'Liveness confirmed', ar: 'تم تأكيد الحيوية', he: 'חיות אושרה' },
  vr_liveness_no: { en: 'Liveness unverified', ar: 'الحيوية غير مؤكدة', he: 'חיות לא אומתה' },
  vr_face_id_photo: { en: 'ID card photo (reference)', ar: 'صورة بطاقة الهوية (مرجع)', he: 'תמונת תעודת זהות (ייחוס)' },
  vr_face_selfie: { en: 'Live camera selfie', ar: 'سيلفي من الكاميرا', he: 'סלפי מהמצלמה' },
  vr_face_liveness_check: { en: 'Liveness check', ar: 'فحص الحيوية', he: 'בדיקת חיות' },
  vr_face_passed: { en: 'Passed', ar: 'ناجح', he: 'עבר' },
  vr_skills_trade: { en: 'Primary trade', ar: 'المهنة الأساسية', he: 'מקצוע עיקרי' },
  vr_skills_years: { en: 'Years of experience', ar: 'سنوات الخبرة', he: 'שנות ניסיון' },
  vr_skills_years_value: { en: '{n} years', ar: '{n} سنوات', he: '{n} שנים' },
  vr_skills_board: { en: 'Licensing board', ar: 'جهة الترخيص', he: 'רשות הרישוי' },
  vr_skills_insurance: { en: 'Insurance limit', ar: 'حد التأمين', he: 'תקרת ביטוח' },
  vr_skills_chips_title: { en: 'Specialized skills & competencies', ar: 'المهارات والكفاءات المتخصصة', he: 'מיומנויות וכישורים מקצועיים' },
  vr_skills_bio_title: { en: 'Craftsman bio', ar: 'نبذة عن الحرفي', he: 'אודות בעל המקצוע' },
  vr_skills_cert_title: { en: 'Vocational trade certificate / license', ar: 'شهادة / رخصة المهنة', he: 'תעודת / רישיון מקצוע' },
  vr_skills_cert_authority: { en: 'Issuing authority', ar: 'الجهة المصدرة', he: 'רשות מנפיקה' },
  vr_skills_cert_trade: { en: 'Trade category', ar: 'فئة المهنة', he: 'קטגוריית מקצוע' },
  vr_cred_title: { en: 'Credentials & compliance checklist', ar: 'قائمة الاعتماد والامتثال', he: 'רשימת הסמכות ותאימות' },
  vr_cred_id: { en: 'National ID identity', ar: 'هوية البطاقة الوطنية', he: 'זהות תעודת זהות' },
  vr_cred_license: { en: 'Vocational trade license', ar: 'رخصة مزاولة المهنة', he: 'רישיון מקצוע' },
  vr_cred_insurance: { en: 'Liability insurance', ar: 'تأمين المسؤولية', he: 'ביטוח אחריות' },
  vr_cred_liveness: { en: 'Live biometrics liveness', ar: 'الحيوية البيومترية المباشرة', he: 'חיות ביומטרית' },
  vr_cred_background: { en: 'Security background check', ar: 'الفحص الأمني', he: 'בדיקת רקע ביטחונית' },
  vr_portfolio_title: { en: "{name}'s portfolio", ar: 'معرض أعمال {name}', he: 'תיק העבודות של {name}' },
  vr_portfolio_desc: {
    en: 'Craftsman project samples and past work evidence',
    ar: 'نماذج مشاريع الحرفي وأدلة أعماله السابقة',
    he: 'דוגמאות פרויקטים וראיות לעבודות קודמות'
  },
  vr_portfolio_empty_title: { en: 'No portfolio images uploaded', ar: 'لم يتم رفع صور لمعرض الأعمال', he: 'לא הועלו תמונות תיק עבודות' },
  vr_portfolio_empty_desc: {
    en: 'This craftsman has not attached project portfolio photos to their verification submission.',
    ar: 'لم يرفق هذا الحرفي صور مشاريع مع طلب التحقق.',
    he: 'בעל המקצוע לא צירף תמונות פרויקטים לבקשת האימות.'
  },
  vr_portfolio_piece: { en: 'Portfolio piece {n}', ar: 'عمل {n} من المعرض', he: 'פריט {n} בתיק העבודות' },
  vr_portfolio_zoom: { en: 'Zoom portfolio photo', ar: 'تكبير صورة المعرض', he: 'הגדל תמונת תיק עבודות' },
  vr_profile_title: { en: 'Personal & contact information', ar: 'المعلومات الشخصية والاتصال', he: 'פרטים אישיים ופרטי קשר' },
  vr_profile_name: { en: 'Full legal name', ar: 'الاسم القانوني الكامل', he: 'שם משפטי מלא' },
  vr_profile_phone: { en: 'Phone number', ar: 'رقم الهاتف', he: 'מספר טלפון' },
  vr_profile_email: { en: 'Email address', ar: 'البريد الإلكتروني', he: 'כתובת דוא״ל' },
  vr_profile_dob: { en: 'Date of birth', ar: 'تاريخ الميلاد', he: 'תאריך לידה' },
  vr_profile_nationality: { en: 'Nationality', ar: 'الجنسية', he: 'לאום' },
  vr_profile_address: { en: 'Residential address', ar: 'عنوان السكن', he: 'כתובת מגורים' },
  vr_profile_emergency: { en: 'Emergency contact', ar: 'جهة اتصال الطوارئ', he: 'איש קשר לחירום' },
  vr_profile_diag_title: { en: 'Registration details', ar: 'تفاصيل التسجيل', he: 'פרטי הרשמה' },
  vr_profile_registered: { en: 'Registration date', ar: 'تاريخ التسجيل', he: 'תאריך הרשמה' },
  vr_profile_verification_id: { en: 'Verification ID', ar: 'معرّف التحقق', he: 'מזהה אימות' },
  err_generic_title: {
    en: 'Something went wrong',
    ar: 'حدث خطأ ما',
    he: 'משהו השתבש'
  },
  btn_retry: {
    en: 'Retry',
    ar: 'إعادة المحاولة',
    he: 'נסה שוב'
  },
  btn_cancel: {
    en: 'Cancel',
    ar: 'إلغاء',
    he: 'ביטול'
  },
  btn_save: {
    en: 'Save',
    ar: 'حفظ',
    he: 'שמירה'
  },
  status_unknown: {
    en: 'Unknown',
    ar: 'غير معروف',
    he: 'לא ידוע'
  },
  status_pending_verification: {
    en: 'Pending verification',
    ar: 'بانتظار التحقق',
    he: 'ממתין לאימות'
  },
  status_approved: {
    en: 'Approved',
    ar: 'معتمد',
    he: 'מאושר'
  },
  status_rejected: {
    en: 'Rejected',
    ar: 'مرفوض',
    he: 'נדחה'
  },
  status_cancelled: {
    en: 'Cancelled',
    ar: 'ملغي',
    he: 'מבוטל'
  },
  status_under_investigation: {
    en: 'Under investigation',
    ar: 'قيد التحقيق',
    he: 'בבדיקה'
  },
  status_dismissed: {
    en: 'Dismissed',
    ar: 'مستبعد',
    he: 'נדחה'
  },
  status_resolved: {
    en: 'Resolved',
    ar: 'تم الحل',
    he: 'נפתר'
  },
  status_scheduled: {
    en: 'Scheduled',
    ar: 'مجدول',
    he: 'מתוזמן'
  },
  status_ended: {
    en: 'Ended',
    ar: 'منتهٍ',
    he: 'הסתיים'
  },
  status_paused: {
    en: 'Paused',
    ar: 'متوقف مؤقتًا',
    he: 'מושהה'
  },
  status_sent: {
    en: 'Sent',
    ar: 'مُرسل',
    he: 'נשלח'
  },
  status_failed: {
    en: 'Failed',
    ar: 'فشل',
    he: 'נכשל'
  },
  status_suspended: {
    en: 'Suspended',
    ar: 'موقوف',
    he: 'מושהה'
  },
  status_blocked: {
    en: 'Blocked',
    ar: 'محظور',
    he: 'חסום'
  },
  status_active: {
    en: 'Active',
    ar: 'نشط',
    he: 'פעיל'
  },
  status_expired: {
    en: 'Expired',
    ar: 'منتهٍ',
    he: 'פג'
  },
  status_locked: {
    en: 'Locked',
    ar: 'مقفل',
    he: 'נעול'
  },
  status_free: {
    en: 'Free',
    ar: 'مجاني',
    he: 'חינם'
  },
  status_commission: {
    en: 'Commission',
    ar: 'عمولة',
    he: 'עמלה'
  },
  status_subscription: {
    en: 'Subscription',
    ar: 'اشتراك',
    he: 'מנוי'
  },
  status_accepted: {
    en: 'Accepted',
    ar: 'مقبول',
    he: 'התקבל'
  },
  status_pre_chat_pending: {
    en: 'Awaiting chat',
    ar: 'بانتظار المحادثة',
    he: "ממתין לצ'אט"
  },
  status_chat_open: {
    en: 'Chat open',
    ar: 'المحادثة مفتوحة',
    he: "הצ'אט פתוח"
  },
  status_agreement_pending: {
    en: 'Agreement pending',
    ar: 'بانتظار الاتفاق',
    he: 'ממתין להסכם'
  },
  status_work_submitted: {
    en: 'Work submitted',
    ar: 'تم تسليم العمل',
    he: 'העבודה הוגשה'
  },
  status_rating_pending: {
    en: 'Rating pending',
    ar: 'بانتظار التقييم',
    he: 'ממתין לדירוג'
  },
  status_closed: {
    en: 'Closed',
    ar: 'مغلق',
    he: 'סגור'
  },
  status_due: {
    en: 'Due',
    ar: 'مستحق',
    he: 'לתשלום'
  },
  status_paid: {
    en: 'Paid',
    ar: 'مدفوع',
    he: 'שולם'
  },
  status_pending: {
    en: 'Pending',
    ar: 'معلق',
    he: 'ממתין'
  },
  status_error_title: {
    en: 'Could not load data',
    ar: 'تعذر تحميل البيانات',
    he: 'לא ניתן לטעון נתונים'
  },
  btn_sync: {
    en: 'Refresh',
    ar: 'تحديث',
    he: 'רענן'
  },
  range_last_7d: {
    en: 'Last 7 days',
    ar: 'آخر 7 أيام',
    he: '7 הימים האחרונים'
  },
  range_last_30d: {
    en: 'Last 30 days',
    ar: 'آخر 30 يومًا',
    he: '30 הימים האחרונים'
  },
  range_last_90d: {
    en: 'Last 90 days',
    ar: 'آخر 90 يومًا',
    he: '90 הימים האחרונים'
  },
  rev_gmv: {
    en: 'GMV',
    ar: 'إجمالي قيمة البضائع',
    he: 'GMV'
  },
  rev_take_rate: {
    en: 'Take rate',
    ar: 'معدل العمولة',
    he: 'שיעור עמלה'
  },
  rev_avg_order: {
    en: 'Avg order',
    ar: 'متوسط الطلب',
    he: 'הזמנה ממוצעת'
  },
  rev_disputes: {
    en: 'Disputes',
    ar: 'النزاعات',
    he: 'סכסוכים'
  },
  rev_no_data: {
    en: 'No revenue data yet',
    ar: 'لا توجد بيانات إيرادات بعد',
    he: 'אין עדיין נתוני הכנסות'
  },
  rev_subtitle: {
    en: 'Live platform revenue',
    ar: 'إيرادات المنصة المباشرة',
    he: 'הכנסות הפלטפורמה בזמן אמת'
  },
  unit_tasks: {
    en: 'tasks',
    ar: 'مهام',
    he: 'משימות'
  },
  updated: {
    en: 'Updated',
    ar: 'آخر تحديث',
    he: 'עודכן'
  },
  empty_pending_reports: {
    en: 'No pending reports',
    ar: 'لا توجد بلاغات معلقة',
    he: 'אין דיווחים ממתינים'
  },
  empty_verification: {
    en: 'Verification queue is empty',
    ar: 'قائمة التحقق فارغة',
    he: 'תור האימות ריק'
  },
  page_failed_title: {
    en: 'Page failed to load',
    ar: 'تعذر تحميل الصفحة',
    he: 'הדף נכשל בטעינה'
  },
  page_failed_body: {
    en: 'This section could not be loaded. If you use an ad-blocker, allow this site and try again.',
    ar: 'تعذر تحميل هذا القسم. إذا كنت تستخدم مانع إعلانات، اسمح بهذا الموقع وحاول مرة أخرى.',
    he: 'לא ניתן לטעון חלק זה. אם אתה משתמש בחוסם פרסומות, אפשר אתר זה ונסה שוב.'
  },
  sec_pending_disputes: {
    en: 'Pending disputes',
    ar: 'النزاعات المعلقة',
    he: 'סכסוכים ממתינים'
  },
  empty_pending_disputes: {
    en: 'No pending disputes',
    ar: 'لا توجد نزاعات معلقة',
    he: 'אין סכסוכים ממתינים'
  },
  nav_customers: {
    en: 'Customers',
    ar: 'العملاء',
    he: 'לקוחות'
  },
  range_7d: {
    en: '7D',
    ar: '7 أيام',
    he: '7 ימים'
  },
  range_30d: {
    en: '30D',
    ar: '30 يومًا',
    he: '30 ימים'
  },
  range_90d: {
    en: '90D',
    ar: '90 يومًا',
    he: '90 ימים'
  },
  overview_billing_title: {
    en: 'Billing snapshot',
    ar: 'لمحة عن الفوترة',
    he: 'מצב חיובים'
  },
  billing_kpi_pending_receipts: {
    en: 'Pending receipts',
    ar: 'إيصالات معلقة',
    he: 'קבלות ממתינות'
  },
  billing_kpi_commission_due: {
    en: 'Commission due',
    ar: 'العمولة المستحقة',
    he: 'עמלה לתשלום'
  },
  billing_kpi_locked: {
    en: 'Locked craftsmen',
    ar: 'حرفيون مقفلون',
    he: 'בעלי מקצוע נעולים'
  },
  payments_kpi_pending_withdrawals: {
    en: 'Pending withdrawals',
    ar: 'سحوبات معلقة',
    he: 'משיכות ממתינות'
  },
  nav_billing: {
    en: 'Billing',
    ar: 'الفوترة',
    he: 'חיוב'
  },
  sec_money: {
    en: 'Money',
    ar: 'الأموال',
    he: 'כספים'
  },
  billing_title: {
    en: 'Billing',
    ar: 'الفوترة',
    he: 'חיוב'
  },
  billing_subtitle: {
    en: 'Craftsman receipts, commission, subscribers and plans',
    ar: 'إيصالات الحرفيين والعمولة والمشتركين والباقات',
    he: 'קבלות, עמלות, מנויים וחבילות של בעלי מקצוע'
  },
  billing_tab_receipts: {
    en: 'Receipts',
    ar: 'الإيصالات',
    he: 'קבלות'
  },
  billing_tab_commission: {
    en: 'Commission',
    ar: 'العمولة',
    he: 'עמלה'
  },
  billing_tab_subscribers: {
    en: 'Subscribers',
    ar: 'المشتركون',
    he: 'מנויים'
  },
  billing_tab_plans: {
    en: 'Plans',
    ar: 'الباقات',
    he: 'חבילות'
  },
  billing_tab_settings: {
    en: 'Settings',
    ar: 'الإعدادات',
    he: 'הגדרות'
  },
  billing_kpi_pending_commission: {
    en: 'Pending commission',
    ar: 'عمولة معلقة',
    he: 'עמלה ממתינה'
  },
  coming_soon: {
    en: 'Coming soon',
    ar: 'قريبًا',
    he: 'בקרוב'
  },
  billing_approve_title: {
    en: 'Approve this receipt?',
    ar: 'الموافقة على هذا الإيصال؟',
    he: 'לאשר קבלה זו?'
  },
  billing_approve_body: {
    en: 'Confirm the Bit transfer for',
    ar: 'تأكيد تحويل Bit لـ',
    he: 'אשר את העברת Bit עבור'
  },
  billing_reject_title: {
    en: 'Reject this receipt?',
    ar: 'رفض هذا الإيصال؟',
    he: 'לדחות קבלה זו?'
  },
  billing_reject_body: {
    en: 'The craftsman will need to submit a valid receipt.',
    ar: 'سيحتاج الحرفي إلى تقديم إيصال صالح.',
    he: 'בעל המקצוע יצטרך להגיש קבלה תקינה.'
  },
  billing_reject_reason_ph: {
    en: 'Tell the craftsman why (shown in the app)',
    ar: 'أخبر الحرفي بالسبب (يظهر في التطبيق)',
    he: 'הסבר לבעל המקצוע מדוע (מוצג באפליקציה)'
  },
  billing_approve: {
    en: 'Approve',
    ar: 'موافقة',
    he: 'אישור'
  },
  billing_reject: {
    en: 'Reject',
    ar: 'رفض',
    he: 'דחייה'
  },
  billing_chat: {
    en: 'Chat',
    ar: 'محادثة',
    he: "צ'אט"
  },
  billing_open_commission: {
    en: 'Open commission',
    ar: 'فتح العمولة',
    he: 'פתח עמלה'
  },
  billing_receipts_search_ph: {
    en: 'Search name, phone or plan…',
    ar: 'ابحث بالاسم أو الهاتف أو الباقة…',
    he: 'חפש שם, טלפון או חבילה…'
  },
  billing_plan_months: {
    en: 'mo',
    ar: 'شهر',
    he: "חוד'"
  },
  billing_col_craftsman: {
    en: 'Craftsman',
    ar: 'الحرفي',
    he: 'בעל מקצוע'
  },
  billing_col_plan: {
    en: 'Plan',
    ar: 'الباقة',
    he: 'חבילה'
  },
  billing_col_amount: {
    en: 'Amount',
    ar: 'المبلغ',
    he: 'סכום'
  },
  billing_col_submitted: {
    en: 'Submitted',
    ar: 'تاريخ التقديم',
    he: 'הוגש'
  },
  billing_col_receipt: {
    en: 'Receipt',
    ar: 'الإيصال',
    he: 'קבלה'
  },
  billing_col_status: {
    en: 'Status',
    ar: 'الحالة',
    he: 'סטטוס'
  },
  billing_col_actions: {
    en: 'Actions',
    ar: 'إجراءات',
    he: 'פעולות'
  },
  billing_filter_pending_verification: {
    en: 'Pending',
    ar: 'معلقة',
    he: 'ממתין'
  },
  billing_filter_approved: {
    en: 'Approved',
    ar: 'معتمدة',
    he: 'מאושר'
  },
  billing_filter_rejected: {
    en: 'Rejected',
    ar: 'مرفوضة',
    he: 'נדחה'
  },
  billing_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  empty_receipts_pending: {
    en: 'No receipts waiting for review',
    ar: 'لا توجد إيصالات بانتظار المراجعة',
    he: 'אין קבלות הממתינות לבדיקה'
  },
  toast_receipt_approved: {
    en: 'Receipt approved.',
    ar: 'تمت الموافقة على الإيصال.',
    he: 'הקבלה אושרה.'
  },
  toast_receipt_rejected: {
    en: 'Receipt rejected.',
    ar: 'تم رفض الإيصال.',
    he: 'הקבלה נדחתה.'
  },
  commission_approve_body: {
    en: 'Confirms the Bit transfer of {amount}. The linked commission is marked paid. The craftsman is unlocked only if nothing else is due.',
    ar: 'يؤكد تحويل Bit بمبلغ {amount}. تُسجَّل العمولة المرتبطة مدفوعة. يُفتح حساب الحرفي فقط إذا لم يتبقَّ شيء مستحق.',
    he: 'מאשר את העברת Bit בסך {amount}. העמלה המקושרת תסומן כמשולמת. החשבון ייפתח רק אם לא נותר חוב.'
  },
  commission_reject_body: {
    en: 'The commission stays due and the craftsman stays locked.',
    ar: 'تبقى العمولة مستحقة ويبقى حساب الحرفي مقفلًا.',
    he: 'העמלה נשארת לתשלום והחשבון נשאר נעול.'
  },
  commission_ledger_unavailable: {
    en: 'Ledger entries are unavailable.',
    ar: 'قيود الدفتر غير متوفرة.',
    he: 'רשומות הספר אינן זמינות.'
  },
  commission_filter_pending: {
    en: 'Pending',
    ar: 'معلقة',
    he: 'ממתין'
  },
  commission_filter_approved: {
    en: 'Approved',
    ar: 'معتمدة',
    he: 'מאושר'
  },
  commission_filter_rejected: {
    en: 'Rejected',
    ar: 'مرفوضة',
    he: 'נדחה'
  },
  commission_seg_receipts: {
    en: 'Receipts',
    ar: 'الإيصالات',
    he: 'קבלות'
  },
  commission_seg_ledger: {
    en: 'Ledger',
    ar: 'الدفتر',
    he: 'ספר'
  },
  commission_lock_state: {
    en: 'Lock state',
    ar: 'حالة القفل',
    he: 'מצב נעילה'
  },
  commission_unlocked: {
    en: 'Unlocked',
    ar: 'مفتوح',
    he: 'פתוח'
  },
  commission_linked_entries: {
    en: 'Linked entries',
    ar: 'القيود المرتبطة',
    he: 'רשומות מקושרות'
  },
  billing_commission_search_ph: {
    en: 'Search craftsman…',
    ar: 'ابحث عن حرفي…',
    he: 'חפש בעל מקצוע…'
  },
  billing_details: {
    en: 'Details',
    ar: 'التفاصيل',
    he: 'פרטים'
  },
  billing_col_phone: {
    en: 'Phone',
    ar: 'الهاتف',
    he: 'טלפון'
  },
  billing_col_notes: {
    en: 'Notes',
    ar: 'ملاحظات',
    he: 'הערות'
  },
  empty_commission: {
    en: 'No commission receipts',
    ar: 'لا توجد إيصالات عمولة',
    he: 'אין קבלות עמלה'
  },
  toast_commission_approved: {
    en: 'Commission payment approved.',
    ar: 'تمت الموافقة على دفعة العمولة.',
    he: 'תשלום העמלה אושר.'
  },
  toast_commission_unlocked: {
    en: 'Commission settled. The craftsman is unlocked.',
    ar: 'تمت تسوية العمولة. تم فتح حساب الحرفي.',
    he: 'העמלה סולקה. החשבון נפתח.'
  },
  toast_commission_rejected: {
    en: 'Commission payment rejected.',
    ar: 'تم رفض دفعة العمولة.',
    he: 'תשלום העמלה נדחה.'
  },
  toast_craftsman_suspended: {
    en: 'Craftsman suspended.',
    ar: 'تم إيقاف الحرفي.',
    he: 'בעל המקצוע הושהה.'
  },
  toast_craftsman_unsuspended: {
    en: 'Craftsman reactivated.',
    ar: 'تمت إعادة تفعيل الحرفي.',
    he: 'בעל המקצוע הופעל מחדש.'
  },
  toast_craftsman_banned: {
    en: 'Craftsman banned.',
    ar: 'تم حظر الحرفي.',
    he: 'בעל המקצוע נחסם.'
  },
  toast_task_frozen: {
    en: 'Task frozen.',
    ar: 'تم تجميد المهمة.',
    he: 'המשימה הוקפאה.'
  },
  toast_task_unfrozen: {
    en: 'Task unfrozen.',
    ar: 'تم إلغاء تجميد المهمة.',
    he: 'המשימה הופשרה.'
  },
  toast_backup_dispatched: {
    en: 'Backup craftsman dispatched.',
    ar: 'تم إرسال حرفي بديل.',
    he: 'נשלח בעל מקצוע גיבוי.'
  },
  subscribers_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  subscribers_filter_active: {
    en: 'Active',
    ar: 'نشطون',
    he: 'פעילים'
  },
  subscribers_filter_free: {
    en: 'Free tasks',
    ar: 'مهام مجانية',
    he: 'משימות חינם'
  },
  subscribers_filter_commission: {
    en: 'Commission',
    ar: 'عمولة',
    he: 'עמלה'
  },
  subscribers_filter_locked: {
    en: 'Locked',
    ar: 'مقفلون',
    he: 'נעולים'
  },
  subscribers_filter_expired: {
    en: 'Expired',
    ar: 'منتهية',
    he: 'פג'
  },
  subscribers_col_billing: {
    en: 'Billing',
    ar: 'الفوترة',
    he: 'חיוב'
  },
  subscribers_col_subscription: {
    en: 'Subscription',
    ar: 'الاشتراك',
    he: 'מנוי'
  },
  subscribers_col_free: {
    en: 'Free tasks',
    ar: 'مهام مجانية',
    he: 'משימות חינם'
  },
  subscribers_col_accept: {
    en: 'Accepts work',
    ar: 'يقبل العمل',
    he: 'מקבל עבודה'
  },
  subscribers_no_plan: {
    en: 'No plan chosen',
    ar: 'لم تُختر باقة',
    he: 'לא נבחרה חבילה'
  },
  subscribers_can_accept: {
    en: 'Can accept tasks',
    ar: 'يمكنه قبول المهام',
    he: 'יכול לקבל משימות'
  },
  subscribers_cannot_accept: {
    en: 'Cannot accept tasks',
    ar: 'لا يمكنه قبول المهام',
    he: 'לא יכול לקבל משימות'
  },
  subscribers_open_craftsman: {
    en: 'Open craftsman',
    ar: 'فتح ملف الحرفي',
    he: 'פתח בעל מקצוע'
  },
  subscribers_extend_title: {
    en: 'Extend subscription',
    ar: 'تمديد الاشتراك',
    he: 'הארך מנוי'
  },
  subscribers_extend_days: {
    en: 'Extra days',
    ar: 'أيام إضافية',
    he: 'ימים נוספים'
  },
  subscribers_extend_result: {
    en: 'New expiry date',
    ar: 'تاريخ الانتهاء الجديد',
    he: 'תאריך סיום חדש'
  },
  subscribers_free_title: {
    en: 'Grant free tasks',
    ar: 'منح مهام مجانية',
    he: 'הענק משימות חינם'
  },
  subscribers_free_count: {
    en: 'Free tasks left',
    ar: 'المهام المجانية المتبقية',
    he: 'משימות חינם שנותרו'
  },
  subscribers_free_default: {
    en: 'Platform default is',
    ar: 'الافتراضي للمنصة هو',
    he: 'ברירת המחדל היא'
  },
  subscribers_free_of: {
    en: 'of {n}',
    ar: 'من {n}',
    he: 'מתוך {n}'
  },
  subscribers_cancel_title: {
    en: 'Cancel subscription?',
    ar: 'إلغاء الاشتراك؟',
    he: 'לבטל מנוי?'
  },
  subscribers_cancel_body: {
    en: 'The subscription expires immediately. The craftsman keeps any remaining free tasks.',
    ar: 'ينتهي الاشتراك فورًا. يحتفظ الحرفي بأي مهام مجانية متبقية.',
    he: 'המנוי פג מיד. בעל המקצוע שומר משימות חינם שנותרו.'
  },
  billing_plan_days_short: {
    en: 'd left',
    ar: 'يوم متبقٍ',
    he: 'ימים נותרו'
  },
  billing_subscribers_search_ph: {
    en: 'Search name, phone or email…',
    ar: 'ابحث بالاسم أو الهاتف أو البريد…',
    he: 'חפש שם, טלפון או אימייל…'
  },
  empty_subscribers: {
    en: 'No subscribers found',
    ar: 'لا يوجد مشتركون',
    he: 'לא נמצאו מנויים'
  },
  toast_subscriber_extended: {
    en: 'Subscription extended.',
    ar: 'تم تمديد الاشتراك.',
    he: 'המנוי הוארך.'
  },
  toast_subscriber_cancelled: {
    en: 'Subscription cancelled.',
    ar: 'تم إلغاء الاشتراك.',
    he: 'המנוי בוטל.'
  },
  toast_free_tasks_updated: {
    en: 'Free tasks updated.',
    ar: 'تم تحديث المهام المجانية.',
    he: 'משימות חינם עודכנו.'
  },
  payments_revenue_title: {
    en: 'Revenue',
    ar: 'الإيرادات',
    he: 'הכנסות'
  },
  payments_kpi_gmv: {
    en: 'GMV (MTD)',
    ar: 'إجمالي القيمة (شهريًا)',
    he: 'GMV (חודשי)'
  },
  payments_kpi_net: {
    en: 'Net revenue (MTD)',
    ar: 'صافي الإيرادات (شهريًا)',
    he: 'הכנסות נטו (חודשי)'
  },
  payments_kpi_take_rate: {
    en: 'Take rate',
    ar: 'معدل العمولة',
    he: 'שיעור עמלה'
  },
  payments_kpi_mrr: {
    en: 'MRR',
    ar: 'الإيراد الشهري المتكرر',
    he: 'הכנסות חודשיות'
  },
  payments_kpi_pending_payouts: {
    en: 'Pending payouts',
    ar: 'مدفوعات معلقة',
    he: 'תשלומים ממתינים'
  },
  withdrawals_tab_pending: {
    en: 'Pending',
    ar: 'معلقة',
    he: 'ממתין'
  },
  withdrawals_tab_completed: {
    en: 'Completed',
    ar: 'مكتملة',
    he: 'הושלם'
  },
  withdrawals_tab_failed: {
    en: 'Failed',
    ar: 'فاشلة',
    he: 'נכשל'
  },
  withdrawals_col_method: {
    en: 'Method',
    ar: 'الطريقة',
    he: 'אמצעי'
  },
  withdrawals_approve_body: {
    en: 'Confirm you transferred {amount} to {method}.',
    ar: 'أكد أنك حوّلت {amount} إلى {method}.',
    he: 'אשר שהעברת {amount} אל {method}.'
  },
  withdrawals_reject_body: {
    en: 'The amount returns to the craftsman balance.',
    ar: 'يعود المبلغ إلى رصيد الحرفي.',
    he: 'הסכום חוזר ליתרת בעל המקצוע.'
  },
  withdrawals_retry_title: {
    en: 'Retry this withdrawal?',
    ar: 'إعادة محاولة هذا السحب؟',
    he: 'לנסות שוב משיכה זו?'
  },
  withdrawals_retry_body: {
    en: 'Retrying re-opens the request. Check that the amount was not already returned to the balance.',
    ar: 'إعادة المحاولة تفتح الطلب من جديد. تحقق من عدم إعادة المبلغ إلى الرصيد مسبقًا.',
    he: 'ניסיון חוזר פותח את הבקשה מחדש. ודא שהסכום לא הוחזר כבר ליתרה.'
  },
  withdrawals_retry: {
    en: 'Retry',
    ar: 'إعادة المحاولة',
    he: 'נסה שוב'
  },
  empty_withdrawals: {
    en: 'No withdrawal requests',
    ar: 'لا توجد طلبات سحب',
    he: 'אין בקשות משיכה'
  },
  btn_export_csv: {
    en: 'Export CSV',
    ar: 'تصدير CSV',
    he: 'ייצוא CSV'
  },
  toast_withdrawal_approved: {
    en: 'Withdrawal approved.',
    ar: 'تمت الموافقة على السحب.',
    he: 'המשיכה אושרה.'
  },
  toast_withdrawal_rejected: {
    en: 'Withdrawal rejected.',
    ar: 'تم رفض السحب.',
    he: 'המשיכה נדחתה.'
  },
  toast_withdrawal_retried: {
    en: 'Withdrawal re-queued.',
    ar: 'أُعيد السحب إلى القائمة.',
    he: 'המשיכה הוחזרה לתור.'
  },
  plans_new: {
    en: 'New plan',
    ar: 'باقة جديدة',
    he: 'חבילה חדשה'
  },
  plans_edit: {
    en: 'Edit plan',
    ar: 'تعديل الباقة',
    he: 'ערוך חבילה'
  },
  plans_delete_title: {
    en: 'Delete this plan?',
    ar: 'حذف هذه الباقة؟',
    he: 'למחוק חבילה זו?'
  },
  plans_delete_body: {
    en: 'Prefer Deactivate: hiding keeps history for existing subscribers. Delete removes the plan permanently.',
    ar: 'يُفضَّل التعطيل: الإخفاء يحافظ على السجل للمشتركين الحاليين. الحذف يزيل الباقة نهائيًا.',
    he: 'עדיף לבטל הפעלה: הסתרה שומרת היסטוריה למנויים קיימים. מחיקה מסירה את החבילה לצמיתות.'
  },
  plans_deactivate: {
    en: 'Deactivate',
    ar: 'تعطيل',
    he: 'בטל הפעלה'
  },
  plans_activate: {
    en: 'Activate',
    ar: 'تفعيل',
    he: 'הפעל'
  },
  plans_popular: {
    en: 'Popular',
    ar: 'الأكثر طلبًا',
    he: 'פופולרי'
  },
  plans_inactive: {
    en: 'Inactive',
    ar: 'غير نشطة',
    he: 'לא פעילה'
  },
  plans_active: {
    en: 'Active',
    ar: 'نشطة',
    he: 'פעילה'
  },
  plans_key: {
    en: 'Plan key',
    ar: 'مفتاح الباقة',
    he: 'מפתח חבילה'
  },
  plans_name_en: {
    en: 'Name (English)',
    ar: 'الاسم (الإنجليزية)',
    he: 'שם (אנגלית)'
  },
  plans_name_ar: {
    en: 'Name (Arabic)',
    ar: 'الاسم (العربية)',
    he: 'שם (ערבית)'
  },
  plans_duration: {
    en: 'Duration (months)',
    ar: 'المدة (بالأشهر)',
    he: 'משך (חודשים)'
  },
  plans_price: {
    en: 'Price (₪)',
    ar: 'السعر (₪)',
    he: 'מחיר (₪)'
  },
  plans_features_en: {
    en: 'Features (English, one per line)',
    ar: 'المميزات (الإنجليزية، واحدة في كل سطر)',
    he: 'תכונות (אנגלית, אחת לשורה)'
  },
  plans_features_ar: {
    en: 'Features (Arabic, one per line)',
    ar: 'المميزات (العربية، واحدة في كل سطر)',
    he: 'תכונות (ערבית, אחת לשורה)'
  },
  billing_delete: {
    en: 'Delete',
    ar: 'حذف',
    he: 'מחק'
  },
  billing_plan_subscribers: {
    en: 'subscribers',
    ar: 'مشتركون',
    he: 'מנויים'
  },
  billing_plan_pending: {
    en: 'pending',
    ar: 'معلقة',
    he: 'ממתין'
  },
  empty_plans: {
    en: 'No subscription plans yet',
    ar: 'لا توجد باقات اشتراك بعد',
    he: 'אין עדיין חבילות מנוי'
  },
  err_plan_in_use: {
    en: 'This plan cannot be deleted because subscriptions use it. Deactivate it instead.',
    ar: 'لا يمكن حذف هذه الباقة لأن اشتراكات تستخدمها. عطّلها بدلًا من ذلك.',
    he: 'לא ניתן למחוק חבילה זו כי מנויים משתמשים בה. בטל את ההפעלה במקום.'
  },
  toast_plan_saved: {
    en: 'Plan saved.',
    ar: 'تم حفظ الباقة.',
    he: 'החבילה נשמרה.'
  },
  toast_plan_deleted: {
    en: 'Plan deleted.',
    ar: 'تم حذف الباقة.',
    he: 'החבילה נמחקה.'
  },
  billing_ledger_filter_due: {
    en: 'Due',
    ar: 'مستحقة',
    he: 'לתשלום'
  },
  billing_ledger_filter_paid: {
    en: 'Paid',
    ar: 'مدفوعة',
    he: 'שולם'
  },
  billing_ledger_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  billing_ledger_totals: {
    en: 'Due / Paid',
    ar: 'المستحق / المدفوع',
    he: 'לתשלום / שולם'
  },
  billing_ledger_col_task: {
    en: 'Task',
    ar: 'المهمة',
    he: 'משימה'
  },
  billing_ledger_col_rate: {
    en: 'Rate',
    ar: 'النسبة',
    he: 'שיעור'
  },
  billing_ledger_col_created: {
    en: 'Created',
    ar: 'أُنشئ',
    he: 'נוצר'
  },
  billing_ledger_col_paid: {
    en: 'Paid at',
    ar: 'تاريخ الدفع',
    he: 'שולם ב'
  },
  empty_ledger: {
    en: 'No ledger entries',
    ar: 'لا توجد قيود',
    he: 'אין רשומות'
  },
  settings_bit_title: {
    en: 'Bit payment details',
    ar: 'تفاصيل الدفع عبر Bit',
    he: "פרטי תשלום Bit"
  },
  settings_bit_phone: {
    en: 'Bit phone number',
    ar: 'رقم هاتف Bit',
    he: 'מספר טלפון Bit'
  },
  settings_bit_recipient: {
    en: 'Recipient name',
    ar: 'اسم المستلم',
    he: 'שם המוטב'
  },
  settings_bit_instructions_en: {
    en: 'Instructions (English)',
    ar: 'التعليمات (الإنجليزية)',
    he: 'הוראות (אנגלית)'
  },
  settings_bit_instructions_ar: {
    en: 'Instructions (Arabic)',
    ar: 'التعليمات (العربية)',
    he: 'הוראות (ערבית)'
  },
  settings_bit_preview_title: {
    en: 'Craftsman preview',
    ar: 'معاينة الحرفي',
    he: 'תצוגה מקדימה'
  },
  settings_bit_copy: {
    en: 'Copy phone number',
    ar: 'نسخ رقم الهاتف',
    he: 'העתק מספר טלפון'
  },
  settings_bit_copied: {
    en: 'Copied.',
    ar: 'تم النسخ.',
    he: 'הועתק.'
  },
  settings_free_tasks_title: {
    en: 'Free tasks for new craftsmen',
    ar: 'المهام المجانية للحرفيين الجدد',
    he: 'משימות חינם לבעלי מקצוע חדשים'
  },
  settings_free_count: {
    en: 'Free tasks count',
    ar: 'عدد المهام المجانية',
    he: 'מספר משימות חינם'
  },
  settings_free_help: {
    en: 'Applies to craftsmen who register after the change. Use Grant free tasks for existing ones.',
    ar: 'ينطبق على الحرفيين الذين يسجلون بعد التغيير. استخدم منح مهام مجانية للحاليين.',
    he: 'חל על בעלי מקצוע שנרשמים לאחר השינוי. השתמש בהענקת משימות חינם לקיימים.'
  },
  settings_commission_title: {
    en: 'Commission rate',
    ar: 'نسبة العمولة',
    he: 'שיעור עמלה'
  },
  settings_commission_rate: {
    en: 'Rate (percent, 0.1–50)',
    ar: 'النسبة (بالمئة، 0.1–50)',
    he: 'שיעור (אחוז, 0.1–50)'
  },
  settings_commission_example: {
    en: 'On a ₪1,000 task the craftsman owes',
    ar: 'في مهمة بقيمة ₪1,000 يدين الحرفي بـ',
    he: 'במשימה של ₪1,000 בעל המקצוע חייב'
  },
  settings_commission_warning: {
    en: 'Changing the rate affects only tasks completed after saving.',
    ar: 'يؤثر تغيير النسبة فقط على المهام المكتملة بعد الحفظ.',
    he: 'שינוי השיעור משפיע רק על משימות שיושלמו לאחר השמירה.'
  },
  toast_settings_saved: {
    en: 'Settings saved.',
    ar: 'تم حفظ الإعدادات.',
    he: 'ההגדרות נשמרו.'
  },
  offers_title: {
    en: 'Offers & Banners',
    ar: 'العروض والبانرات',
    he: 'מבצעים ובאנרים'
  },
  offers_subtitle: {
    en: 'Banners shown on the mobile home screen',
    ar: 'البانرات المعروضة على الشاشة الرئيسية للتطبيق',
    he: 'באנרים המוצגים במסך הבית של האפליקציה'
  },
  offers_new: {
    en: 'New offer',
    ar: 'عرض جديد',
    he: 'מבצע חדש'
  },
  offers_edit: {
    en: 'Edit offer',
    ar: 'تعديل العرض',
    he: 'ערוך מבצע'
  },
  offers_empty: {
    en: 'No offers yet',
    ar: 'لا توجد عروض بعد',
    he: 'אין עדיין מבצעים'
  },
  offers_search_ph: {
    en: 'Search offers…',
    ar: 'ابحث في العروض…',
    he: 'חפש מבצעים…'
  },
  offers_kpi_total: {
    en: 'Total offers',
    ar: 'إجمالي العروض',
    he: 'סך מבצעים'
  },
  offers_kpi_active: {
    en: 'Active now',
    ar: 'نشطة الآن',
    he: 'פעילים כעת'
  },
  offers_kpi_scheduled: {
    en: 'Scheduled',
    ar: 'مجدولة',
    he: 'מתוזמן'
  },
  offers_kpi_ended: {
    en: 'Ended',
    ar: 'منتهية',
    he: 'הסתיים'
  },
  offers_placement_filter_all: {
    en: 'All placements',
    ar: 'كل المواضع',
    he: 'כל המיקומים'
  },
  offers_placement_filter_top: {
    en: 'Home carousel',
    ar: 'الواجهة الرئيسية',
    he: 'קרוסלת בית'
  },
  offers_placement_filter_featured: {
    en: 'Featured',
    ar: 'مميزة',
    he: 'נבחרים'
  },
  offers_state_filter_all: {
    en: 'All states',
    ar: 'كل الحالات',
    he: 'כל המצבים'
  },
  offers_state_filter_active: {
    en: 'Active',
    ar: 'نشطة',
    he: 'פעיל'
  },
  offers_state_filter_paused: {
    en: 'Paused',
    ar: 'متوقفة',
    he: 'מושהה'
  },
  offers_state_filter_scheduled: {
    en: 'Scheduled',
    ar: 'مجدولة',
    he: 'מתוזמן'
  },
  offers_state_filter_ended: {
    en: 'Ended',
    ar: 'منتهية',
    he: 'הסתיים'
  },
  offers_field_title_en: {
    en: 'Title (English)',
    ar: 'العنوان (الإنجليزية)',
    he: 'כותרת (אנגלית)'
  },
  offers_field_title_ar: {
    en: 'Title (Arabic)',
    ar: 'العنوان (العربية)',
    he: 'כותרת (ערבית)'
  },
  offers_field_subtitle_en: {
    en: 'Subtitle (English)',
    ar: 'الوصف (الإنجليزية)',
    he: 'תיאור (אנגלית)'
  },
  offers_field_subtitle_ar: {
    en: 'Subtitle (Arabic)',
    ar: 'الوصف (العربية)',
    he: 'תיאור (ערבית)'
  },
  offers_field_button_en: {
    en: 'Button text (English)',
    ar: 'نص الزر (الإنجليزية)',
    he: 'טקסט כפתור (אנגלית)'
  },
  offers_field_button_ar: {
    en: 'Button text (Arabic)',
    ar: 'نص الزر (العربية)',
    he: 'טקסט כפתור (ערבית)'
  },
  offers_field_image: {
    en: 'Image',
    ar: 'الصورة',
    he: 'תמונה'
  },
  offers_field_banner_type: {
    en: 'Banner type',
    ar: 'نوع البانر',
    he: 'סוג באנר'
  },
  offers_field_placement: {
    en: 'Placement',
    ar: 'الموضع',
    he: 'מיקום'
  },
  offers_field_opens: {
    en: 'Opens',
    ar: 'يفتح',
    he: 'פותח'
  },
  offers_field_link: {
    en: 'Link',
    ar: 'الرابط',
    he: 'קישור'
  },
  offers_field_starts: {
    en: 'Starts',
    ar: 'يبدأ',
    he: 'מתחיל'
  },
  offers_field_ends: {
    en: 'Ends',
    ar: 'ينتهي',
    he: 'מסתיים'
  },
  offers_opens_none: {
    en: 'Nothing',
    ar: 'لا شيء',
    he: 'כלום'
  },
  offers_opens_url: {
    en: 'Web link',
    ar: 'رابط ويب',
    he: 'קישור אינטרנט'
  },
  offers_opens_craftsman: {
    en: 'Craftsman',
    ar: 'حرفي',
    he: 'בעל מקצוע'
  },
  offers_opens_category: {
    en: 'Category',
    ar: 'فئة',
    he: 'קטגוריה'
  },
  offers_opens_task: {
    en: 'Task',
    ar: 'مهمة',
    he: 'משימה'
  },
  offers_opens_service: {
    en: 'Service',
    ar: 'خدمة',
    he: 'שירות'
  },
  offers_field_target: {
    en: 'Target',
    ar: 'الهدف',
    he: 'יעד'
  },
  offers_target_id_help: {
    en: 'Pick the item the banner opens in the app.',
    ar: 'اختر العنصر الذي يفتحه البانر في التطبيق.',
    he: 'בחר את הפריט שהבאנר פותח באפליקציה.'
  },
  offers_target_search_ph: {
    en: 'Search craftsmen…',
    ar: 'ابحث عن حرفيين…',
    he: 'חפש בעלי מקצוע…'
  },
  offers_placement_top: {
    en: 'Top',
    ar: 'الأعلى',
    he: 'עליון'
  },
  offers_placement_featured: {
    en: 'Featured',
    ar: 'مميز',
    he: 'נבחר'
  },
  offers_type_promo: {
    en: 'Promo',
    ar: 'ترويجي',
    he: 'מבצע'
  },
  offers_type_sos: {
    en: 'Emergency SOS',
    ar: 'طوارئ SOS',
    he: 'SOS חירום'
  },
  offers_sos_helper: {
    en: 'SOS banners use a red tone and stay visible in emergencies.',
    ar: 'بانرات الطوارئ تستخدم لونًا أحمر وتبقى ظاهرة في حالات الطوارئ.',
    he: 'באנרי SOS משתמשים בגוון אדום ונשארים גלויים בחירום.'
  },
  offers_delete_title: {
    en: 'Delete this offer?',
    ar: 'حذف هذا العرض؟',
    he: 'למחוק מבצע זה?'
  },
  offers_delete_body: {
    en: 'The banner is removed from the app and its campaign is deleted too.',
    ar: 'يُزال البانر من التطبيق وتُحذف حملته أيضًا.',
    he: 'הבאנר יוסר מהאפליקציה והקמפיין שלו יימחק גם כן.'
  },
  offers_preview: {
    en: 'Preview',
    ar: 'معاينة',
    he: 'תצוגה מקדימה'
  },
  offers_pause: {
    en: 'Pause',
    ar: 'إيقاف مؤقت',
    he: 'השהה'
  },
  offers_resume: {
    en: 'Resume',
    ar: 'استئناف',
    he: 'המשך'
  },
  offers_image_type: {
    en: 'Image must be PNG, JPG or WebP.',
    ar: 'يجب أن تكون الصورة PNG أو JPG أو WebP.',
    he: 'התמונה חייבת להיות PNG, JPG או WebP.'
  },
  offers_image_too_big: {
    en: 'Image must be 5 MB or smaller.',
    ar: 'يجب أن تكون الصورة 5 ميغابايت أو أصغر.',
    he: 'התמונה חייבת להיות 5 מ״ב או פחות.'
  },
  toast_offer_saved: {
    en: 'Offer saved.',
    ar: 'تم حفظ العرض.',
    he: 'המבצע נשמר.'
  },
  toast_offer_deleted: {
    en: 'Offer deleted.',
    ar: 'تم حذف العرض.',
    he: 'המבצע נמחק.'
  },
  toast_offer_toggled: {
    en: 'Offer status updated.',
    ar: 'تم تحديث حالة العرض.',
    he: 'סטטוס המבצע עודכן.'
  },
  campaigns_subtitle: {
    en: 'Scheduling and analytics view of the same banners',
    ar: 'عرض الجدولة والتحليلات للبانرات نفسها',
    he: 'תצוגת תזמון וניתוח של אותם באנרים'
  },
  campaigns_new: {
    en: 'New campaign',
    ar: 'حملة جديدة',
    he: 'קמפיין חדש'
  },
  campaigns_search_ph: {
    en: 'Search campaigns…',
    ar: 'ابحث في الحملات…',
    he: 'חפש קמפיינים…'
  },
  campaigns_tab_active: {
    en: 'Active',
    ar: 'نشطة',
    he: 'פעיל'
  },
  campaigns_tab_scheduled: {
    en: 'Scheduled',
    ar: 'مجدولة',
    he: 'מתוזמן'
  },
  campaigns_tab_ended: {
    en: 'Ended',
    ar: 'منتهية',
    he: 'הסתיים'
  },
  campaigns_tab_analytics: {
    en: 'Analytics',
    ar: 'التحليلات',
    he: 'ניתוח'
  },
  campaigns_col_campaign: {
    en: 'Campaign',
    ar: 'الحملة',
    he: 'קמפיין'
  },
  campaigns_col_placement: {
    en: 'Placement',
    ar: 'الموضع',
    he: 'מיקום'
  },
  campaigns_col_window: {
    en: 'Window',
    ar: 'الفترة',
    he: 'חלון'
  },
  campaigns_col_impressions: {
    en: 'Impressions',
    ar: 'المشاهدات',
    he: 'חשיפות'
  },
  campaigns_col_clicks: {
    en: 'Clicks',
    ar: 'النقرات',
    he: 'קליקים'
  },
  campaigns_col_ctr: {
    en: 'CTR',
    ar: 'نسبة النقر',
    he: 'CTR'
  },
  campaigns_edit: {
    en: 'Edit',
    ar: 'تعديل',
    he: 'ערוך'
  },
  campaigns_pause: {
    en: 'Pause',
    ar: 'إيقاف مؤقت',
    he: 'השהה'
  },
  campaigns_resume: {
    en: 'Resume',
    ar: 'استئناف',
    he: 'המשך'
  },
  campaigns_end: {
    en: 'End',
    ar: 'إنهاء',
    he: 'סיים'
  },
  campaigns_end_title: {
    en: 'End this campaign?',
    ar: 'إنهاء هذه الحملة؟',
    he: 'לסיים קמפיין זה?'
  },
  campaigns_end_body: {
    en: 'The banner stops showing in the app. This cannot be undone.',
    ar: 'يتوقف البانر عن الظهور في التطبيق. لا يمكن التراجع عن هذا.',
    he: 'הבאנר יפסיק להופיע באפליקציה. לא ניתן לבטל זאת.'
  },
  campaigns_delete_title: {
    en: 'Delete this campaign?',
    ar: 'حذف هذه الحملة؟',
    he: 'למחוק קמפיין זה?'
  },
  campaigns_delete_body: {
    en: 'The campaign and its banner are deleted permanently.',
    ar: 'تُحذف الحملة والبانر نهائيًا.',
    he: 'הקמפיין והבאנר יימחקו לצמיתות.'
  },
  campaigns_impressions: {
    en: 'impressions',
    ar: 'مشاهدة',
    he: 'חשיפות'
  },
  campaigns_clicks: {
    en: 'clicks',
    ar: 'نقرة',
    he: 'קליקים'
  },
  empty_campaigns: {
    en: 'No campaigns here yet',
    ar: 'لا توجد حملات هنا بعد',
    he: 'אין עדיין קמפיינים כאן'
  },
  toast_campaign_saved: {
    en: 'Campaign saved.',
    ar: 'تم حفظ الحملة.',
    he: 'הקמפיין נשמר.'
  },
  toast_campaign_deleted: {
    en: 'Campaign deleted.',
    ar: 'تم حذف الحملة.',
    he: 'הקמפיין נמחק.'
  },
  campaigns_clicks_note: {
    en: 'Clicks are recorded only when the app reports taps.',
    ar: 'تُسجَّل النقرات فقط عندما يبلّغ التطبيق عن النقر.',
    he: 'קליקים נרשמים רק כשהאפליקציה מדווחת על הקשות.'
  },
  campaigns_top_title: {
    en: 'Top campaigns',
    ar: 'أفضل الحملات',
    he: 'הקמפיינים המובילים'
  },
  campaigns_kpi_impressions: {
    en: 'Impressions',
    ar: 'المشاهدات',
    he: 'חשיפות'
  },
  campaigns_kpi_clicks: {
    en: 'Clicks',
    ar: 'النقرات',
    he: 'קליקים'
  },
  campaigns_kpi_ctr: {
    en: 'Overall CTR',
    ar: 'إجمالي نسبة النقر',
    he: 'CTR כולל'
  },
  campaigns_kpi_active: {
    en: 'Active campaigns',
    ar: 'الحملات النشطة',
    he: 'קמפיינים פעילים'
  },
  campaigns_create_title: {
    en: 'New campaign',
    ar: 'حملة جديدة',
    he: 'קמפיין חדש'
  },
  campaigns_create_subtitle: {
    en: 'Create a home-screen banner campaign',
    ar: 'إنشاء حملة بانر للشاشة الرئيسية',
    he: 'צור קמפיין באנר למסך הבית'
  },
  campaigns_form_title: {
    en: 'Campaign details',
    ar: 'تفاصيل الحملة',
    he: 'פרטי קמפיין'
  },
  campaigns_budget_reference: {
    en: 'Internal budget (reference only)',
    ar: 'الميزانية الداخلية (للمرجع فقط)',
    he: 'תקציב פנימי (לעיון בלבד)'
  },
  campaigns_field_name: {
    en: 'Campaign name',
    ar: 'اسم الحملة',
    he: 'שם קמפיין'
  },
  campaigns_field_placement: {
    en: 'Placement',
    ar: 'الموضع',
    he: 'מיקום'
  },
  campaigns_field_image: {
    en: 'Image',
    ar: 'الصورة',
    he: 'תמונה'
  },
  campaigns_field_description: {
    en: 'Description',
    ar: 'الوصف',
    he: 'תיאור'
  },
  campaigns_field_cta: {
    en: 'Button text',
    ar: 'نص الزر',
    he: 'טקסט כפתור'
  },
  campaigns_field_link: {
    en: 'Link',
    ar: 'الرابط',
    he: 'קישור'
  },
  campaigns_field_start: {
    en: 'Starts',
    ar: 'يبدأ',
    he: 'מתחיל'
  },
  campaigns_field_end: {
    en: 'Ends',
    ar: 'ينتهي',
    he: 'מסתיים'
  },
  campaigns_field_duration: {
    en: 'Duration presets',
    ar: 'مدد جاهزة',
    he: 'משכים מוכנים'
  },
  campaigns_edit_title: {
    en: 'Edit campaign',
    ar: 'تعديل الحملة',
    he: 'ערוך קמפיין'
  },
  campaigns_launch: {
    en: 'Launch campaign',
    ar: 'إطلاق الحملة',
    he: 'השק קמפיין'
  },
  campaigns_back: {
    en: 'Back',
    ar: 'رجوع',
    he: 'חזרה'
  },
  campaigns_uploading: {
    en: 'Uploading image…',
    ar: 'جارٍ رفع الصورة…',
    he: 'מעלה תמונה…'
  },
  campaigns_upload_wait: {
    en: 'Wait for the image upload to finish.',
    ar: 'انتظر انتهاء رفع الصورة.',
    he: 'המתן לסיום העלאת התמונה.'
  },
  sidebar_theme: {
    en: 'Theme',
    ar: 'المظهر',
    he: 'ערכת נושא'
  },
  sidebar_expand: {
    en: 'Expand sidebar',
    ar: 'توسيع الشريط الجانبي',
    he: 'הרחב סרגל צד'
  },
  sidebar_collapse: {
    en: 'Collapse sidebar',
    ar: 'طي الشريط الجانبي',
    he: 'כווץ סרגל צד'
  },
  tabs_more: {
    en: 'More',
    ar: 'المزيد',
    he: 'עוד'
  },
  header_no_notifications: {
    en: 'No notifications',
    ar: 'لا توجد إشعارات',
    he: 'אין התראות'
  },
  header_view_all: {
    en: 'View all notifications',
    ar: 'عرض كل الإشعارات',
    he: 'הצג את כל ההתראות'
  },
  header_aria_language: {
    en: 'Language selector',
    ar: 'اختيار اللغة',
    he: 'בחירת שפה'
  },
  header_aria_clear: {
    en: 'Clear search',
    ar: 'مسح البحث',
    he: 'נקה חיפוש'
  },
  header_aria_menu: {
    en: 'Toggle navigation drawer',
    ar: 'تبديل درج التنقل',
    he: 'החלף מגירת ניווט'
  },
  status_online: {
    en: 'Online',
    ar: 'متصل',
    he: 'מחובר'
  },
  status_offline: {
    en: 'Offline',
    ar: 'غير متصل',
    he: 'מנותק'
  },
  status_busy: {
    en: 'Busy',
    ar: 'مشغول',
    he: 'עסוק'
  },
  status_flagged: {
    en: 'Flagged',
    ar: 'مُبلغ عنه',
    he: 'מסומן'
  },
  craftsmen_title: {
    en: 'Craftsmen',
    ar: 'الحرفيون',
    he: 'בעלי מקצוע'
  },
  craftsmen_registered: {
    en: 'craftsmen registered',
    ar: 'حرفي مسجل',
    he: 'בעלי מקצוע רשומים'
  },
  craftsmen_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  craftsmen_filter_verified: {
    en: 'Verified',
    ar: 'موثقون',
    he: 'מאומתים'
  },
  craftsmen_filter_pending: {
    en: 'Pending',
    ar: 'معلقون',
    he: 'ממתין'
  },
  craftsmen_filter_suspended: {
    en: 'Suspended',
    ar: 'موقوفون',
    he: 'מושהים'
  },
  craftsmen_search_ph: {
    en: 'Search name, trade or phone…',
    ar: 'ابحث بالاسم أو المهنة أو الهاتف…',
    he: 'חפש שם, מקצוע או טלפון…'
  },
  craftsmen_col_craftsman: {
    en: 'Craftsman',
    ar: 'الحرفي',
    he: 'בעל מקצוע'
  },
  craftsmen_col_rating: {
    en: 'Rating',
    ar: 'التقييم',
    he: 'דירוג'
  },
  craftsmen_col_jobs: {
    en: 'Jobs',
    ar: 'المهام',
    he: 'משימות'
  },
  craftsmen_col_billing: {
    en: 'Billing',
    ar: 'الفوترة',
    he: 'חיוב'
  },
  craftsmen_col_status: {
    en: 'Status',
    ar: 'الحالة',
    he: 'סטטוס'
  },
  craftsmen_col_joined: {
    en: 'Joined',
    ar: 'تاريخ الانضمام',
    he: 'הצטרף'
  },
  craftsmen_jobs_done: {
    en: 'jobs done',
    ar: 'مهمة منجزة',
    he: 'משימות בוצעו'
  },
  craftsmen_free_short: {
    en: 'Free',
    ar: 'مجاني',
    he: 'חינם'
  },
  empty_craftsmen: {
    en: 'No craftsmen found',
    ar: 'لا يوجد حرفيون',
    he: 'לא נמצאו בעלי מקצוע'
  },
  craftsmen_suspended_notice: {
    en: 'Server counts differ — suspended rows are filtered locally.',
    ar: 'تختلف أعداد الخادم — تتم تصفية الصفوف الموقوفة محليًا.',
    he: 'ספירות השרת שונות — שורות מושהות מסוננות מקומית.'
  },
  craftsmen_detail_profile: {
    en: 'Profile',
    ar: 'الملف',
    he: 'פרופיל'
  },
  craftsmen_detail_verification: {
    en: 'Verification',
    ar: 'التحقق',
    he: 'אימות'
  },
  craftsmen_detail_billing: {
    en: 'Billing',
    ar: 'الفوترة',
    he: 'חיוב'
  },
  craftsmen_detail_actions: {
    en: 'Account actions',
    ar: 'إجراءات الحساب',
    he: 'פעולות חשבון'
  },
  craftsmen_verify_nationalId: {
    en: 'National ID',
    ar: 'الهوية الوطنية',
    he: 'תעודת זהות'
  },
  craftsmen_verify_selfieMatch: {
    en: 'Selfie match',
    ar: 'مطابقة السيلفي',
    he: 'התאמת סלפי'
  },
  craftsmen_verify_tradeLicense: {
    en: 'Trade license',
    ar: 'الرخصة المهنية',
    he: 'רישיון מקצוע'
  },
  craftsmen_verify_bankIban: {
    en: 'Bank IBAN',
    ar: 'الآيبان البنكي',
    he: 'IBAN בנק'
  },
  craftsmen_verify_backgroundCheck: {
    en: 'Background check',
    ar: 'الفحص الأمني',
    he: 'בדיקת רקע'
  },
  craftsmen_verify_insurance: {
    en: 'Insurance',
    ar: 'التأمين',
    he: 'ביטוח'
  },
  craftsmen_verify_title: {
    en: 'Change verification?',
    ar: 'تغيير التحقق؟',
    he: 'לשנות אימות?'
  },
  craftsmen_verify_grant_body: {
    en: 'This grants the verification badge.',
    ar: 'سيمنح هذا شارة التحقق.',
    he: 'זה יעניק תג אימות.'
  },
  craftsmen_verify_revoke_body: {
    en: 'This revokes the verification badge.',
    ar: 'سيسحب هذا شارة التحقق.',
    he: 'זה ישלול תג אימות.'
  },
  craftsmen_billing_free: {
    en: 'Free tasks',
    ar: 'المهام المجانية',
    he: 'משימות חינם'
  },
  craftsmen_billing_model: {
    en: 'Billing model',
    ar: 'نموذج الفوترة',
    he: 'מודל חיוב'
  },
  craftsmen_billing_expiry: {
    en: 'Subscription expires',
    ar: 'انتهاء الاشتراك',
    he: 'המנוי פג'
  },
  craftsmen_billing_lock: {
    en: 'Commission lock',
    ar: 'قفل العمولة',
    he: 'נעילת עמלה'
  },
  craftsmen_grant_free: {
    en: 'Grant free tasks',
    ar: 'منح مهام مجانية',
    he: 'הענק משימות חינם'
  },
  craftsmen_extend: {
    en: 'Extend subscription',
    ar: 'تمديد الاشتراك',
    he: 'הארך מנוי'
  },
  craftsmen_open_billing: {
    en: 'Open in Billing',
    ar: 'فتح في الفوترة',
    he: 'פתח בחיוב'
  },
  craftsmen_suspend: {
    en: 'Suspend',
    ar: 'إيقاف',
    he: 'השהה'
  },
  craftsmen_unsuspend: {
    en: 'Unsuspend',
    ar: 'إلغاء الإيقاف',
    he: 'בטל השהיה'
  },
  craftsmen_ban: {
    en: 'Ban',
    ar: 'حظر',
    he: 'חסום'
  },
  craftsmen_suspend_title: {
    en: 'Suspend this craftsman?',
    ar: 'إيقاف هذا الحرفي؟',
    he: 'להשהות בעל מקצוע זה?'
  },
  craftsmen_suspend_body: {
    en: 'The craftsman cannot accept new tasks until reactivated.',
    ar: 'لن يتمكن الحرفي من قبول مهام جديدة حتى إعادة التفعيل.',
    he: 'בעל המקצוע לא יוכל לקבל משימות חדשות עד להפעלה מחדש.'
  },
  craftsmen_unsuspend_title: {
    en: 'Reactivate this craftsman?',
    ar: 'إعادة تفعيل هذا الحرفي؟',
    he: 'להפעיל מחדש בעל מקצוע זה?'
  },
  craftsmen_unsuspend_body: {
    en: 'The craftsman can accept new tasks again.',
    ar: 'يمكن للحرفي قبول مهام جديدة مرة أخرى.',
    he: 'בעל המקצוע יוכל לקבל משימות חדשות שוב.'
  },
  craftsmen_ban_title: {
    en: 'Ban this craftsman?',
    ar: 'حظر هذا الحرفي؟',
    he: 'לחסום בעל מקצוע זה?'
  },
  craftsmen_ban_body: {
    en: 'Banning blocks the account permanently. Type BAN to confirm.',
    ar: 'الحظر يمنع الحساب نهائيًا. اكتب BAN للتأكيد.',
    he: 'חסימה חוסמת את החשבון לצמיתות. הקלד BAN לאישור.'
  },
  craftsmen_ban_confirm_ph: {
    en: 'Type BAN to confirm',
    ar: 'اكتب BAN للتأكيد',
    he: 'הקלד BAN לאישור'
  },
  tasks_seg_tasks: {
    en: 'Tasks',
    ar: 'المهام',
    he: 'משימות'
  },
  tasks_seg_disputes: {
    en: 'Disputes',
    ar: 'النزاعات',
    he: 'סכסוכים'
  },
  tasks_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  tasks_filter_live: {
    en: 'Live',
    ar: 'نشطة',
    he: 'חי'
  },
  tasks_filter_emergency: {
    en: 'Emergency',
    ar: 'طوارئ',
    he: 'חירום'
  },
  tasks_filter_disputed: {
    en: 'Disputed',
    ar: 'متنازع عليها',
    he: 'שנוי במחלוקת'
  },
  tasks_filter_done: {
    en: 'Done',
    ar: 'منجزة',
    he: 'בוצע'
  },
  tasks_filter_cancelled: {
    en: 'Cancelled',
    ar: 'ملغاة',
    he: 'מבוטל'
  },
  tasks_filter_frozen: {
    en: 'Frozen',
    ar: 'مجمدة',
    he: 'מוקפא'
  },
  tasks_search_ph: {
    en: 'Search title, ID or customer…',
    ar: 'ابحث بالعنوان أو الرقم أو العميل…',
    he: 'חפש כותרת, מספר או לקוח…'
  },
  empty_tasks: {
    en: 'No tasks found',
    ar: 'لا توجد مهام',
    he: 'לא נמצאו משימות'
  },
  tasks_col_job: {
    en: 'Job',
    ar: 'المهمة',
    he: 'משימה'
  },
  tasks_col_customer: {
    en: 'Customer',
    ar: 'العميل',
    he: 'לקוח'
  },
  tasks_col_craftsman: {
    en: 'Craftsman',
    ar: 'الحرفي',
    he: 'בעל מקצוע'
  },
  tasks_col_category: {
    en: 'Category',
    ar: 'الفئة',
    he: 'קטגוריה'
  },
  tasks_col_created: {
    en: 'Created',
    ar: 'أُنشئت',
    he: 'נוצר'
  },
  tasks_kpi_open: {
    en: 'Open now',
    ar: 'مفتوحة الآن',
    he: 'פתוח כעת'
  },
  tasks_kpi_emergency: {
    en: 'Emergency',
    ar: 'طوارئ',
    he: 'חירום'
  },
  tasks_kpi_disputed: {
    en: 'Disputed',
    ar: 'متنازع عليها',
    he: 'שנוי במחלוקת'
  },
  tasks_kpi_completed: {
    en: 'Completed',
    ar: 'منجزة',
    he: 'בוצע'
  },
  tasks_details_title: {
    en: 'Task details',
    ar: 'تفاصيل المهمة',
    he: 'פרטי משימה'
  },
  tasks_timeline_title: {
    en: 'Timeline',
    ar: 'الجدول الزمني',
    he: 'ציר זמן'
  },
  tasks_timeline_created: {
    en: 'Created',
    ar: 'أُنشئت',
    he: 'נוצר'
  },
  tasks_timeline_accepted: {
    en: 'Accepted',
    ar: 'قُبِلت',
    he: 'התקבל'
  },
  tasks_timeline_started: {
    en: 'Started',
    ar: 'بدأت',
    he: 'התחיל'
  },
  tasks_timeline_completed: {
    en: 'Completed',
    ar: 'اكتملت',
    he: 'הושלם'
  },
  tasks_work_proof: {
    en: 'Work proof',
    ar: 'إثبات العمل',
    he: 'הוכחת עבודה'
  },
  tasks_cancel_title: {
    en: 'Cancellation',
    ar: 'الإلغاء',
    he: 'ביטול'
  },
  disputes_open: {
    en: 'Open disputes',
    ar: 'فتح النزاعات',
    he: 'פתח סכסוכים'
  },
  disputes_open_body: {
    en: 'This task has an open dispute. Resolve it from the Disputes tab.',
    ar: 'هذه المهمة عليها نزاع مفتوح. حله من تبويب النزاعات.',
    he: 'למשימה זו יש סכסוך פתוח. פתור אותו מלשונית הסכסוכים.'
  },
  tasks_freeze: {
    en: 'Freeze',
    ar: 'تجميد',
    he: 'הקפא'
  },
  tasks_unfreeze: {
    en: 'Unfreeze',
    ar: 'إلغاء التجميد',
    he: 'הפשר'
  },
  tasks_freeze_title: {
    en: 'Freeze this task?',
    ar: 'تجميد هذه المهمة؟',
    he: 'להקפיא משימה זו?'
  },
  tasks_freeze_body: {
    en: 'The task is paused while it is investigated.',
    ar: 'تُوقف المهمة مؤقتًا أثناء التحقيق فيها.',
    he: 'המשימה מושהית בזמן בדיקתה.'
  },
  tasks_unfreeze_title: {
    en: 'Unfreeze this task?',
    ar: 'إلغاء تجميد هذه المهمة؟',
    he: 'להפשיר משימה זו?'
  },
  tasks_unfreeze_body: {
    en: 'The task resumes from its previous state.',
    ar: 'تستأنف المهمة من حالتها السابقة.',
    he: 'המשימה ממשיכה ממצבה הקודם.'
  },
  tasks_dispatch: {
    en: 'Dispatch backup',
    ar: 'إرسال بديل',
    he: 'שלח גיבוי'
  },
  tasks_dispatch_title: {
    en: 'Dispatch a backup craftsman',
    ar: 'إرسال حرفي بديل',
    he: 'שלח בעל מקצוע גיבוי'
  },
  tasks_emergency_title: {
    en: 'Emergency in progress',
    ar: 'طوارئ جارية',
    he: 'חירום מתרחש'
  },
  tasks_emergency_open: {
    en: 'Open',
    ar: 'فتح',
    he: 'פתח'
  },
  dispute_reason_service_quality: {
    en: 'Service quality',
    ar: 'جودة الخدمة',
    he: 'איכות שירות'
  },
  dispute_reason_overcharging: {
    en: 'Overcharging',
    ar: 'تقاضي زائد',
    he: 'גביית יתר'
  },
  dispute_reason_no_show: {
    en: 'No show',
    ar: 'عدم الحضور',
    he: 'אי הופעה'
  },
  dispute_reason_safety_concern: {
    en: 'Safety concern',
    ar: 'مخاوف تتعلق بالسلامة',
    he: 'חשש בטיחותי'
  },
  dispute_reason_other: {
    en: 'Other',
    ar: 'أخرى',
    he: 'אחר'
  },
  disputes_filter_pending: {
    en: 'Pending',
    ar: 'معلقة',
    he: 'ממתין'
  },
  disputes_filter_resolved: {
    en: 'Resolved',
    ar: 'محلولة',
    he: 'נפתר'
  },
  disputes_filter_all: {
    en: 'All',
    ar: 'الكل',
    he: 'הכל'
  },
  disputes_col_task: {
    en: 'Task',
    ar: 'المهمة',
    he: 'משימה'
  },
  disputes_col_parties: {
    en: 'Customer ↔ Craftsman',
    ar: 'العميل ↔ الحرفي',
    he: 'לקוח ↔ בעל מקצוע'
  },
  disputes_col_reason: {
    en: 'Reason',
    ar: 'السبب',
    he: 'סיבה'
  },
  disputes_col_opened: {
    en: 'Opened',
    ar: 'فُتح',
    he: 'נפתח'
  },
  empty_disputes: {
    en: 'No disputes found',
    ar: 'لا توجد نزاعات',
    he: 'לא נמצאו סכסוכים'
  },
  disputes_resolve: {
    en: 'Resolve',
    ar: 'حل',
    he: 'פתור'
  },
  disputes_resolve_title: {
    en: 'Resolve this dispute?',
    ar: 'حل هذا النزاع؟',
    he: 'לפתור סכסוך זה?'
  },
  disputes_refund_client: {
    en: 'Refund customer',
    ar: 'استرداد للعميل',
    he: 'החזר ללקוח'
  },
  disputes_refund_consequence: {
    en: 'The task is cancelled and the amount returns to the customer.',
    ar: 'تُلغى المهمة ويعود المبلغ إلى العميل.',
    he: 'המשימה מבוטלת והסכום חוזר ללקוח.'
  },
  disputes_pay_craftsman: {
    en: 'Pay craftsman',
    ar: 'الدفع للحرفي',
    he: 'שלם לבעל מקצוע'
  },
  disputes_pay_consequence: {
    en: 'The task completes and the craftsman is paid.',
    ar: 'تكتمل المهمة ويُدفع للحرفي.',
    he: 'המשימה מושלמת ובעל המקצוע מקבל תשלום.'
  },
  disputes_notes: {
    en: 'Notes (optional)',
    ar: 'ملاحظات (اختياري)',
    he: 'הערות (אופציונלי)'
  },
  toast_dispute_resolved: {
    en: 'Dispute resolved.',
    ar: 'تم حل النزاع.',
    he: 'הסכסוך נפתר.'
  },
  live_title: { en: 'Live Activity Center', ar: 'مركز النشاط المباشر', he: 'מרכז פעילות חיה' },
  live_subtitle: { en: 'Real-time operations dispatch', ar: 'متابعة العمليات في الوقت الفعلي', he: 'מעקב תפעולי בזמן אמת' },
  live_live: { en: 'Live', ar: 'مباشر', he: 'חי' },
  live_pause: { en: 'Pause updates', ar: 'إيقاف التحديث', he: 'השהה עדכונים' },
  live_resume: { en: 'Resume updates', ar: 'استئناف التحديث', he: 'המשך עדכונים' },
  live_kpi_active_jobs: { en: 'Active jobs', ar: 'مهام نشطة', he: 'משימות פעילות' },
  live_kpi_online: { en: 'Online craftsmen', ar: 'حرفيون متصلون', he: 'בעלי מקצוע מחוברים' },
  live_kpi_sos: { en: 'Active emergencies', ar: 'حالات طوارئ نشطة', he: 'מקרי חירום פעילים' },
  live_kpi_zones: { en: 'Busy zones', ar: 'مناطق مزدحمة', he: 'אזורים עמוסים' },
  live_map_eyebrow: { en: 'Operational map', ar: 'الخريطة التشغيلية', he: 'מפה תפעולית' },
  live_map_title: { en: 'Live dispatch map', ar: 'خريطة التوزيع المباشر', he: 'מפת שיבוץ חיה' },
  live_map_loading: { en: 'Loading map…', ar: 'جارٍ تحميل الخريطة…', he: 'טוען מפה…' },
  live_map_recenter: { en: 'Recenter', ar: 'إعادة التوسيط', he: 'מרכז מחדש' },
  live_map_fullscreen: { en: 'Fullscreen', ar: 'ملء الشاشة', he: 'מסך מלא' },
  live_map_exit_fullscreen: { en: 'Exit', ar: 'خروج', he: 'יציאה' },
  live_map_search_placeholder: { en: 'Search job or craftsman…', ar: 'ابحث عن مهمة أو حرفي…', he: 'חיפוש משימה או בעל מקצוע…' },
  live_map_filter_all: { en: 'All activity', ar: 'كل النشاط', he: 'כל הפעילות' },
  live_map_filter_jobs: { en: 'Active jobs', ar: 'مهام نشطة', he: 'משימות פעילות' },
  live_map_filter_craftsmen: { en: 'Online craftsmen', ar: 'حرفيون متصلون', he: 'בעלי מקצוע מחוברים' },
  live_map_no_locations: { en: 'No tasks or craftsmen with a known location', ar: 'لا توجد مهام أو حرفيون بموقع معروف', he: 'אין משימות או בעלי מקצוע עם מיקום ידוע' },
  live_map_legend: { en: 'Legend', ar: 'دليل الألوان', he: 'מקרא' },
  live_legend_pending: { en: 'Pending', ar: 'قيد الانتظار', he: 'ממתין' },
  live_legend_accepted: { en: 'Accepted', ar: 'مقبولة', he: 'התקבל' },
  live_legend_progress: { en: 'In progress', ar: 'قيد التنفيذ', he: 'בביצוע' },
  live_legend_disputed: { en: 'Disputed', ar: 'متنازع عليها', he: 'במחלוקת' },
  live_legend_craftsman: { en: 'Online craftsman', ar: 'حرفي متصل', he: 'בעל מקצוע מחובר' },
  live_customer: { en: 'Customer', ar: 'عميل', he: 'לקוח' },
  live_craftsman: { en: 'Craftsman', ar: 'حرفي', he: 'בעל מקצוע' },
  live_online_craftsman: { en: 'Online craftsman', ar: 'حرفي متصل', he: 'בעל מקצוע מחובר' },
  live_rating: { en: 'Rating', ar: 'التقييم', he: 'דירוג' },
  live_jobs_eyebrow: { en: 'Active jobs', ar: 'المهام النشطة', he: 'משימות פעילות' },
  live_jobs_top: { en: 'Latest', ar: 'الأحدث', he: 'אחרונות' },
  live_jobs_all: { en: 'All', ar: 'الكل', he: 'הכל' },
  live_jobs_empty_title: { en: 'No active tasks', ar: 'لا توجد مهام نشطة', he: 'אין משימות פעילות' },
  live_jobs_empty_body: { en: 'New tasks will appear here as they are created.', ar: 'ستظهر المهام الجديدة هنا فور إنشائها.', he: 'משימות חדשות יופיעו כאן עם יצירתן.' },
  live_job_show_on_map: { en: 'Show on map', ar: 'عرض على الخريطة', he: 'הצג במפה' },
  live_job_open: { en: 'Open in tasks', ar: 'فتح في المهام', he: 'פתח במשימות' },
  live_feed_eyebrow: { en: 'Activity feed', ar: 'سجل النشاط', he: 'פיד פעילות' },
  live_feed_title: { en: 'Recent activity', ar: 'النشاط الأخير', he: 'פעילות אחרונה' },
  live_feed_paused: { en: 'Paused', ar: 'متوقف مؤقتًا', he: 'מושהה' },
  live_feed_pause: { en: 'Pause', ar: 'إيقاف مؤقت', he: 'השהה' },
  live_feed_resume: { en: 'Resume', ar: 'استئناف', he: 'המשך' },
  live_feed_empty_title: { en: 'No recent activity', ar: 'لا يوجد نشاط حديث', he: 'אין פעילות אחרונה' },
  live_feed_empty_body: { en: 'Task creations, updates and dispatches will appear here.', ar: 'ستظهر هنا عمليات إنشاء المهام وتحديثاتها وتوزيعها.', he: 'יצירת משימות, עדכונים ושיבוצים יופיעו כאן.' },
  live_susp_eyebrow: { en: 'Suspicious activity', ar: 'نشاط مشبوه', he: 'פעילות חשודה' },
  live_susp_unresolved: { en: 'alerts unresolved', ar: 'تنبيهات غير محلولة', he: 'התראות פתוחות' },
  live_susp_investigate: { en: 'Investigate', ar: 'تحقيق', he: 'חקור' },
  live_sev_high: { en: 'High', ar: 'عالية', he: 'גבוהה' },
  live_sev_medium: { en: 'Medium', ar: 'متوسطة', he: 'בינונית' },
  live_sev_low: { en: 'Low', ar: 'منخفضة', he: 'נמוכה' },
  live_zones_eyebrow: { en: 'Busy zones', ar: 'المناطق المزدحمة', he: 'אזורים עמוסים' },
  live_zones_title: { en: 'Active jobs by zone', ar: 'المهام النشطة حسب المنطقة', he: 'משימות פעילות לפי אזור' },
  live_zones_empty: { en: 'No zone data', ar: 'لا توجد بيانات للمناطق', he: 'אין נתוני אזורים' },
  live_sos_title: { en: 'Emergency in progress', ar: 'حالة طوارئ جارية', he: 'מקרה חירום מתנהל' },
  live_sos_badge: { en: 'SOS', ar: 'SOS', he: 'SOS' },
  live_sos_open_task: { en: 'Open task', ar: 'فتح المهمة', he: 'פתח משימה' },
  live_sys_eyebrow: { en: 'System status', ar: 'حالة النظام', he: 'מצב המערכת' },
  live_sys_title: { en: 'Platform health', ar: 'سلامة المنصة', he: 'תקינות הפלטפורמה' },
  live_sys_checking: { en: 'Checking…', ar: 'جارٍ الفحص…', he: 'בודק…' },
  live_sys_operational: { en: 'Operational', ar: 'يعمل', he: 'פעיל' },
  live_sys_degraded: { en: 'Degraded', ar: 'أداء متدهور', he: 'ביצועים מופחתים' },
  live_sys_down: { en: 'Down', ar: 'متوقف', he: 'לא זמין' },
  live_sys_unknown: { en: 'Unknown', ar: 'غير معروف', he: 'לא ידוע' },
  live_svc_api: { en: 'API', ar: 'واجهة API', he: 'API' },
  live_svc_database: { en: 'Database', ar: 'قاعدة البيانات', he: 'מסד נתונים' },
  live_svc_realtime: { en: 'Real-time / cache', ar: 'الوقت الفعلي / التخزين المؤقت', he: 'זמן אמת / מטמון' },
  live_push: { en: 'Push notifications', ar: 'الإشعارات الفورية', he: 'התראות פוש' },
  live_migrations: { en: 'Database migrations', ar: 'ترحيلات قاعدة البيانات', he: 'מיגרציות מסד נתונים' },
  live_migrations_ok: { en: 'Up to date', ar: 'محدّثة', he: 'מעודכן' },
  live_migrations_pending: { en: 'Pending', ar: 'قيد الانتظار', he: 'ממתין' },
  live_migrations_pending_warn: { en: 'Pending database migrations detected.', ar: 'تم اكتشاف ترحيلات معلقة لقاعدة البيانات.', he: 'זוהו מיגרציות ממתינות במסד הנתונים.' },
  audit_eyebrow: { en: 'Audit log', ar: 'سجل التدقيق', he: 'יומן ביקורת' },
  audit_title: { en: 'Administrative audit log', ar: 'سجل التدقيق الإداري', he: 'יומן ביקורת ניהולי' },
  audit_subtitle: { en: 'Chronological trace of administrative actions.', ar: 'تتبع زمني للإجراءات الإدارية.', he: 'מעקב כרונולוגי אחר פעולות ניהול.' },
  audit_search_ph: { en: 'Search the log...', ar: 'ابحث في السجل...', he: 'חיפוש ביומן...' },
  audit_all_actions: { en: 'All actions', ar: 'كل الإجراءات', he: 'כל הפעולות' },
  audit_from: { en: 'From date', ar: 'من تاريخ', he: 'מתאריך' },
  audit_to: { en: 'To date', ar: 'إلى تاريخ', he: 'עד תאריך' },
  audit_col_time: { en: 'Time', ar: 'الوقت', he: 'זמן' },
  audit_col_admin: { en: 'Admin', ar: 'المشرف', he: 'מנהל' },
  audit_col_action: { en: 'Action', ar: 'الإجراء', he: 'פעולה' },
  audit_col_target: { en: 'Target', ar: 'الهدف', he: 'יעד' },
  audit_col_ip: { en: 'IP address', ar: 'عنوان IP', he: 'כתובת IP' },
  audit_col_details: { en: 'Details', ar: 'التفاصيل', he: 'פרטים' },
  audit_details_show: { en: 'Show details', ar: 'عرض التفاصيل', he: 'הצגת פרטים' },
  audit_details_hide: { en: 'Hide details', ar: 'إخفاء التفاصيل', he: 'הסתרת פרטים' },
  audit_diff_field: { en: 'Field', ar: 'الحقل', he: 'שדה' },
  audit_diff_before: { en: 'Before', ar: 'قبل', he: 'לפני' },
  audit_diff_after: { en: 'After', ar: 'بعد', he: 'אחרי' },
  audit_no_changes: { en: 'No recorded changes.', ar: 'لا توجد تغييرات مسجلة.', he: 'אין שינויים מתועדים.' },
  audit_copy_json: { en: 'Copy JSON', ar: 'نسخ JSON', he: 'העתקת JSON' },
  audit_copied: { en: 'Copied', ar: 'تم النسخ', he: 'הועתק' },
  audit_copy_failed: { en: 'Could not copy to the clipboard.', ar: 'تعذر النسخ إلى الحافظة.', he: 'לא ניתן להעתיק ללוח.' },
  audit_empty_title: { en: 'No audit entries', ar: 'لا توجد سجلات تدقيق', he: 'אין רשומות ביקורת' },
  audit_empty_desc: { en: 'No entries match the current filters.', ar: 'لا توجد سجلات تطابق المرشحات الحالية.', he: 'אין רשומות התואמות לסינון הנוכחי.' },
  audit_filters_client_only: { en: 'Server-side filters need an updated backend. Filtering only the loaded page.', ar: 'المرشحات من جهة الخادم تتطلب تحديث الخادم. يتم التصفية على الصفحة المحمّلة فقط.', he: 'סינון בצד השרת דורש שרת מעודכן. הסינון חל רק על העמוד הנטען.' },
  audit_action_VERIFICATION_DECISION: { en: 'Verification decision', ar: 'قرار التحقق', he: 'החלטת אימות' },
  audit_action_DISPUTE_RESOLVED: { en: 'Dispute resolved', ar: 'تمت تسوية النزاع', he: 'סכסוך נפתר' },
  audit_action_TASK_FROZEN: { en: 'Task frozen', ar: 'تم تجميد المهمة', he: 'משימה הוקפאה' },
  audit_action_TASK_UNFROZEN: { en: 'Task unfrozen', ar: 'تم إلغاء تجميد المهمة', he: 'הקפאת המשימה בוטלה' },
  audit_action_TASK_DISPATCH_BACKUP: { en: 'Backup craftsman dispatched', ar: 'تم إرسال حرفي احتياطي', he: 'נשלח בעל מקצוע חלופי' },
  audit_action_CRAFTSMAN_SUSPENDED: { en: 'Craftsman suspended', ar: 'تم إيقاف الحرفي', he: 'בעל מקצוע הושעה' },
  audit_action_CRAFTSMAN_UNSUSPENDED: { en: 'Craftsman reinstated', ar: 'تمت إعادة تفعيل الحرفي', he: 'בעל מקצוע הוחזר לפעילות' },
  audit_action_CRAFTSMAN_BANNED: { en: 'Craftsman banned', ar: 'تم حظر الحرفي', he: 'בעל מקצוע נחסם' },
  audit_action_VERIFICATION_ITEM_UPDATED: { en: 'Verification item updated', ar: 'تم تحديث بند التحقق', he: 'פריט אימות עודכן' },
  audit_action_REPORT_MODERATED: { en: 'Report moderated', ar: 'تمت مراجعة البلاغ', he: 'דיווח טופל' },
  audit_action_SETTINGS_CHANGED: { en: 'Settings changed', ar: 'تم تغيير الإعدادات', he: 'ההגדרות שונו' },
  audit_action_AUTO_VERIFICATION_SETTING_CHANGED: { en: 'Auto-verification setting changed', ar: 'تم تغيير إعداد التحقق التلقائي', he: 'הגדרת האימות האוטומטי שונתה' },
  audit_action_SUBSCRIPTION_REQUEST_APPROVED: { en: 'Subscription request approved', ar: 'تمت الموافقة على طلب الاشتراك', he: 'בקשת מנוי אושרה' },
  audit_action_SUBSCRIPTION_REQUEST_REJECTED: { en: 'Subscription request rejected', ar: 'تم رفض طلب الاشتراك', he: 'בקשת מנוי נדחתה' },
  audit_action_COMMISSION_PAYMENT_APPROVED: { en: 'Commission payment approved', ar: 'تمت الموافقة على دفعة العمولة', he: 'תשלום עמלה אושר' },
  audit_action_COMMISSION_PAYMENT_REJECTED: { en: 'Commission payment rejected', ar: 'تم رفض دفعة العمولة', he: 'תשלום עמלה נדחה' },
  audit_action_SUBSCRIBER_CANCELLED: { en: 'Subscriber cancelled', ar: 'تم إلغاء اشتراك المشترك', he: 'מנוי בוטל' },
  audit_action_SUBSCRIBER_EXTENDED: { en: 'Subscriber extended', ar: 'تم تمديد اشتراك المشترك', he: 'מנוי הוארך' },
  audit_action_FREE_TASKS_UPDATED: { en: 'Free tasks updated', ar: 'تم تحديث المهام المجانية', he: 'משימות החינם עודכנו' },
  audit_action_BILLING_MODEL_SWITCHED: { en: 'Billing model switched', ar: 'تم تبديل نموذج الفوترة', he: 'מודל החיוב הוחלף' }
};


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang');
    return (saved === 'en' || saved === 'ar' || saved === 'he') ? saved : 'en';
  });

  const isRtl = language === 'ar' || language === 'he';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-lang', lang);
  };

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('lang', language);
    html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  }, [language, isRtl]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
export default LanguageContext;
