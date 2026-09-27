import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Sparkles } from 'lucide-react';

export interface QuickTemplatesProps {
  onSelectTemplate: (text: string) => void;
}

export const QuickTemplates: React.FC<QuickTemplatesProps> = ({ onSelectTemplate }) => {
  const { isRtl } = useLanguage();

  const templates = [
    {
      label: isRtl ? 'استلام إيصال Bit' : 'Bit Proof Received',
      text: isRtl
        ? 'مرحباً! استلمنا إيصال دفع Bit الخاص بك، وفريق المالية يقوم بفحصه وتأكيد المعاملة الآن.'
        : 'Hello! We received your Bit payment submission. Our finance team is reviewing the transaction details now.',
    },
    {
      label: isRtl ? 'تفعيل الاشتراك' : 'Subscription Approved',
      text: isRtl
        ? '🎉 تم التحقق من اشتراكك وتفعيله بنجاح! يمكنك الآن قبول طلبات العملاء في القدس والضفة الغربية.'
        : '🎉 Your subscription pass has been verified and activated! You now have full access to accept customer orders in Jerusalem and the West Bank.',
    },
    {
      label: isRtl ? 'طلب صورة أوضح' : 'Request Better Screenshot',
      text: isRtl
        ? 'يرجى تزويدنا بصورة أوضح لإيصال التحويل تظهر بوضوح رقم المعاملة والتاريخ والمبلغ.'
        : 'Could you please upload a clearer screenshot showing the Bit reference number, amount, and timestamp?',
    },
    {
      label: isRtl ? 'تحقيق في نزاع' : 'Dispute Investigation',
      text: isRtl
        ? 'شكراً لتواصلك، نحن نحقق في تفاصيل هذا الطلب وسنقوم بإفادتك في أقرب وقت.'
        : 'Thank you for reaching out. We are currently investigating this order details and will update you shortly.',
    },
  ];

  return (
    <div
      style={{
        padding: 'var(--sp-2) var(--sp-4)',
        background: 'var(--surface-sunken)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        overflowX: 'auto',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-xs)',
          color: 'var(--on-surface-subtle)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--primary)' }} />
        <span>{isRtl ? 'ردود سريعة:' : 'Templates:'}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'nowrap' }}>
        {templates.map((tmpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectTemplate(tmpl.text)}
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--surface-base)',
              color: 'var(--on-surface)',
              fontSize: 'var(--font-xs)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--on-surface)';
            }}
          >
            {tmpl.label}
          </button>
        ))}
      </div>
    </div>
  );
};
