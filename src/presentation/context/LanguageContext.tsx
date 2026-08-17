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
    en: 'Sonaa Admin',
    ar: 'إدارة صناع',
    he: 'סונא מנהל'
  },
  login_welcome_title: {
    en: 'Welcome Back',
    ar: 'مرحباً بعودتك',
    he: 'ברוך הבא'
  },
  login_welcome_subtitle: {
    en: 'Sign in to Sonaa Admin Console',
    ar: 'سجل الدخول إلى لوحة إدارة صناع',
    he: 'היכנס למסוף הניהול של סונא'
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
    en: 'Payments',
    ar: 'المدفوعات',
    he: 'תשלומים'
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
    en: 'Active Campaigns',
    ar: 'الحملات النشطة',
    he: 'קמפיינים פעילים'
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
    en: 'Payments & Subscriptions',
    ar: 'المدفوعات والاشتراكات',
    he: 'תשלומים ומנויים'
  },
  payments_subtitle: {
    en: 'Revenue · commission · payouts · subscriptions',
    ar: 'الإيرادات · العمولة · المدفوعات · الاشتراكات',
    he: 'הכנסות · עמלות · תשלומים · מנויים'
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
    he: 'שידור חדش'
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
  }
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
