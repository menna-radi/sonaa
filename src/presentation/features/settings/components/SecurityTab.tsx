import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, Switch, useConfirm, useToast } from '../../../components/ui';
import {
  Lock,
  UserCheck,
  ShieldCheck,
  Clock,
  Eye,
  Sliders,
  Smartphone,
} from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const { isRtl } = useLanguage();
  const confirm = useConfirm();
  const { success } = useToast();

  const [autoVerify, setAutoVerify] = useState<boolean>(() => {
    return localStorage.getItem('arox_auto_verify_craftsmen') === 'true';
  });

  const [securityOpts, setSecurityOpts] = useState({
    twoFactor: true,
    trustedDevices: true,
    ipAllowlist: false,
    sessionTimeout: true,
    auditLogging: true,
  });

  const handleToggleAutoVerify = async (newVal: boolean) => {
    const ok = await confirm({
      title: isRtl ? 'تعديل سياسة التحقق التلقائي' : 'Toggle Auto-Verification Policy',
      body: newVal
        ? (isRtl
            ? 'هل أنت متأكد من تفعيل التحقق التلقائي للحرفيين؟ سيتمكن الحرفيون الجدد من استلام الطلبات فور التسجيل دون مراجعة يدوية.'
            : 'Are you sure you want to enable automatic verification? Newly registered craftsmen will be verified immediately without manual KYC moderation.')
        : (isRtl
            ? 'هل أنت متأكد من تعطيل التحقق التلقائي؟ ستتطلب حسابات الحرفيين الجديدة مراجعة واعتماد يدوي.'
            : 'Are you sure you want to disable automatic verification? New craftsman accounts will require manual KYC review.'),
      tone: newVal ? 'warning' : 'default',
      confirmLabel: isRtl ? 'تأكيد التعديل' : 'Confirm Change',
      cancelLabel: isRtl ? 'إلغاء' : 'Cancel',
    });

    if (ok) {
      setAutoVerify(newVal);
      localStorage.setItem('arox_auto_verify_craftsmen', String(newVal));
      success(
        isRtl
          ? `تم ${newVal ? 'تفعيل' : 'تعطيل'} التحقق التلقائي للحرفيين بنجاح`
          : `Auto-verification successfully ${newVal ? 'enabled' : 'disabled'}.`
      );
    }
  };

  const securityItems = [
    {
      key: 'autoVerify',
      icon: <UserCheck size={18} />,
      title: isRtl ? 'التحقق التلقائي من الحرفيين' : 'Craftsmen Auto-Verification',
      desc: isRtl
        ? 'اعتماد حسابات الحرفيين الجدد تلقائياً فور التسجيل دون انتظار طابور المراجعة اليدوية'
        : 'Automatically verify newly registered craftsmen immediately without manual KYC review queue.',
      checked: autoVerify,
      onChange: handleToggleAutoVerify,
      badge: isRtl ? 'حرج' : 'Governance',
    },
    {
      key: 'twoFactor',
      icon: <Lock size={18} />,
      title: isRtl ? 'المصادقة الثنائية (2FA)' : 'Two-factor Authentication (2FA)',
      desc: isRtl
        ? 'إلزام جميع المشرفين بالمصادقة عبر تطبيق التوثيق أو رسائل SMS'
        : 'Enforce two-factor authentication for all platform administration accounts.',
      checked: securityOpts.twoFactor,
      onChange: (v: boolean) => setSecurityOpts((prev) => ({ ...prev, twoFactor: v })),
    },
    {
      key: 'trustedDevices',
      icon: <Smartphone size={18} />,
      title: isRtl ? 'الأجهزة الموثوقة' : 'Trusted Devices',
      desc: isRtl
        ? 'تتبع الأجهزة المصرح لها وإرسال تنبيه فوري عند تسجيل الدخول من جهاز جديد'
        : 'Track authorized administrative devices and alert on unrecognized hardware logins.',
      checked: securityOpts.trustedDevices,
      onChange: (v: boolean) => setSecurityOpts((prev) => ({ ...prev, trustedDevices: v })),
    },
    {
      key: 'ipAllowlist',
      icon: <Sliders size={18} />,
      title: isRtl ? 'قائمة العناوين المسموحة (IP Allowlist)' : 'IP Address Allowlist',
      desc: isRtl
        ? 'تقييد الوصول إلى لوحة الإدارة من عناوين IP الخاصة بالمكتب فقط'
        : 'Restrict administrative dashboard access strictly to office and VPN IP blocks.',
      checked: securityOpts.ipAllowlist,
      onChange: (v: boolean) => setSecurityOpts((prev) => ({ ...prev, ipAllowlist: v })),
    },
    {
      key: 'sessionTimeout',
      icon: <Clock size={18} />,
      title: isRtl ? 'انتهاء الجلسة التلقائي' : 'Inactivity Session Timeout',
      desc: isRtl
        ? 'تسجيل الخروج التلقائي بعد ٣٠ دقيقة من عدم النشاط لحماية الحساب'
        : 'Automatically invalidate sessions after 30 minutes of administrator inactivity.',
      checked: securityOpts.sessionTimeout,
      onChange: (v: boolean) => setSecurityOpts((prev) => ({ ...prev, sessionTimeout: v })),
    },
    {
      key: 'auditLogging',
      icon: <Eye size={18} />,
      title: isRtl ? 'سجلات التدقيق الإدارية' : 'Administrative Audit Logging',
      desc: isRtl
        ? 'توثيق كل حركة إدارية وتخزينها في سجل تدقيق غير قابل للتعديل لمدة ٩٠ يوماً'
        : 'Record every admin mutation in an immutable audit ledger with a 90-day retention window.',
      checked: securityOpts.auditLogging,
      onChange: (v: boolean) => setSecurityOpts((prev) => ({ ...prev, auditLogging: v })),
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'الأمن والحماية وإعدادات الحساب' : 'Security & Access Policies'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'إدارة سياسات الدخول وأمان النظام والتحقق التلقائي للحرفيين'
            : 'Configure authentication rules, governance controls, and access security policies.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
        {securityItems.map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-sunken)',
              border: '1px solid var(--border-subtle)',
              gap: 'var(--sp-3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-base)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--on-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span
                    style={{
                      fontSize: 'var(--font-sm)',
                      fontWeight: 600,
                      color: 'var(--on-surface)',
                    }}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--warning-soft)',
                        color: 'var(--warning)',
                        border: '1px solid var(--warning-border)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--on-surface-subtle)',
                    lineHeight: 'var(--line-height-normal)',
                  }}
                >
                  {item.desc}
                </span>
              </div>
            </div>

            <div style={{ flexShrink: 0 }}>
              <Switch checked={item.checked} onChange={item.onChange} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
