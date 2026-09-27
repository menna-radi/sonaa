import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, Button, useToast } from '../../../components/ui';
import {
  Percent,
  Coins,
  Clock,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Check,
  Edit2,
} from 'lucide-react';

interface ConfigParam {
  id: string;
  labelEn: string;
  labelAr: string;
  val: string;
  icon: React.ReactNode;
}

export const PlatformConfigTab: React.FC = () => {
  const { isRtl } = useLanguage();
  const { success } = useToast();

  const [platformConfig, setPlatformConfig] = useState<ConfigParam[]>([
    {
      id: 'commission_rate',
      labelEn: 'Platform Commission Rate',
      labelAr: 'نسبة عمولة المنصة',
      val: '20.4%',
      icon: <Percent size={18} />,
    },
    {
      id: 'min_withdrawal',
      labelEn: 'Minimum Withdrawal',
      labelAr: 'الحد الأدنى للسحب',
      val: '50 ₪',
      icon: <Coins size={18} />,
    },
    {
      id: 'payout_schedule',
      labelEn: 'Payout Schedule',
      labelAr: 'جدولة المستحقات',
      val: 'Weekly · Sunday',
      icon: <Clock size={18} />,
    },
    {
      id: 'auto_release',
      labelEn: 'Auto-Release Escrow',
      labelAr: 'الإفراج التلقائي عن المبالغ المعلقة',
      val: '24 hours',
      icon: <Clock size={18} />,
    },
    {
      id: 'currency',
      labelEn: 'Default Operating Currency',
      labelAr: 'العملة الافتراضية للعمليات',
      val: 'ILS (₪)',
      icon: <Coins size={18} />,
    },
    {
      id: 'region',
      labelEn: 'Active Service Region',
      labelAr: 'نطاق الخدمة النشط',
      val: 'Jerusalem (القدس) + West Bank',
      icon: <MapPin size={18} />,
    },
    {
      id: 'emergency_sla',
      labelEn: 'Emergency Response SLA',
      labelAr: 'اتفاقية مستوى خدمة الطوارئ (SLA)',
      val: '15 minutes',
      icon: <ShieldAlert size={18} />,
    },
    {
      id: 'verification_sla',
      labelEn: 'Craftsman Verification SLA',
      labelAr: 'اتفاقية التحقق من الحرفيين (SLA)',
      val: '24 hours',
      icon: <CheckCircle2 size={18} />,
    },
  ]);

  const [editingParamId, setEditingParamId] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState('');

  const handleStartEdit = (param: ConfigParam) => {
    setEditingParamId(param.id);
    setEditingVal(param.val);
  };

  const handleSaveEdit = (paramId: string) => {
    if (!editingVal.trim()) return;
    setPlatformConfig((prev) =>
      prev.map((p) => (p.id === paramId ? { ...p, val: editingVal.trim() } : p))
    );
    setEditingParamId(null);
    success(isRtl ? 'تم حفظ التعديل بنجاح' : 'Configuration parameter updated.');
  };

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'تهيئة ومعايير المنصة' : 'Platform Configuration Parameters'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'المعايير التشغيلية الأساسية للعمولات، المستحقات، نطاق الخدمة، واتفاقيات الخدمة (SLA)'
            : 'Core operational variables governing marketplace commissions, payouts, SLAs, and currency.'}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--sp-3)',
        }}
      >
        {platformConfig.map((param) => {
          const isEditing = editingParamId === param.id;

          return (
            <div
              key={param.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
                padding: 'var(--sp-4)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface-base)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--on-surface)',
                    }}
                  >
                    {param.icon}
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)', fontWeight: 600 }}>
                    {isRtl ? param.labelAr : param.labelEn}
                  </span>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(param)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--on-surface-subtle)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={isRtl ? 'تعديل القيمة' : 'Edit value'}
                  >
                    <Edit2 size={13} />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginTop: 4 }}>
                  <input
                    type="text"
                    value={editingVal}
                    onChange={(e) => setEditingVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(param.id);
                      if (e.key === 'Escape') setEditingParamId(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--primary)',
                      background: 'var(--surface-base)',
                      color: 'var(--on-surface)',
                      fontSize: 'var(--font-sm)',
                      outline: 'none',
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveEdit(param.id)}
                    icon={<Check size={13} />}
                  >
                    {isRtl ? 'حفظ' : 'Save'}
                  </Button>
                </div>
              ) : (
                <div
                  onDoubleClick={() => handleStartEdit(param)}
                  title={isRtl ? 'انقر مرتين للتعديل' : 'Double click to edit'}
                  style={{
                    fontSize: 'var(--font-md)',
                    fontWeight: 700,
                    color: 'var(--on-surface)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {param.val}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
