import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, Checkbox, useToast } from '../../../components/ui';

interface NotificationChannelRow {
  id: string;
  eventEn: string;
  eventAr: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export const NotificationsTab: React.FC = () => {
  const { isRtl } = useLanguage();
  const { info } = useToast();

  const [channels, setChannels] = useState<NotificationChannelRow[]>([
    {
      id: 'sos',
      eventEn: 'Emergency / SOS Escalations',
      eventAr: 'حالات الطوارئ والتصعيد الفوري',
      email: true,
      push: true,
      sms: true,
    },
    {
      id: 'failed_payments',
      eventEn: 'Failed Payments & Chargebacks',
      eventAr: 'فشل عمليات الدفع والنزاعات المالية',
      email: true,
      push: true,
      sms: true,
    },
    {
      id: 'new_verifications',
      eventEn: 'New Craftsman KYC Submissions',
      eventAr: 'طلبات التحقق الجديدة للحرفيين',
      email: true,
      push: true,
      sms: false,
    },
    {
      id: 'daily_summary',
      eventEn: 'Daily Executive Digest & Metrics',
      eventAr: 'الملخص الإداري اليومي للمنصة',
      email: true,
      push: false,
      sms: false,
    },
  ]);

  const handleToggle = (id: string, type: 'email' | 'push' | 'sms') => {
    setChannels((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [type]: !row[type] } : row))
    );
    info(isRtl ? 'تم تحديث تفضيلات الإشعارات' : 'Notification preferences saved.');
  };

  return (
    <Card>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {isRtl ? 'قنوات وتفضيلات الإشعارات' : 'Notification Channels & Routing'}
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--on-surface-subtle)' }}>
          {isRtl
            ? 'تحديد قنوات التنبيه لكل حدث في النظام (البريد الإلكتروني، التنبيهات الفورية، رسائل SMS)'
            : 'Configure how critical events and operational updates are dispatched to admin teams.'}
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--font-sm)',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--surface-sunken)',
              }}
            >
              <th
                style={{
                  textAlign: 'start',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--on-surface-subtle)',
                }}
              >
                {isRtl ? 'الحدث والنشاط' : 'Event / Trigger'}
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--on-surface-subtle)',
                  width: 100,
                }}
              >
                {isRtl ? 'البريد' : 'Email'}
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--on-surface-subtle)',
                  width: 100,
                }}
              >
                {isRtl ? 'إشعار فوري' : 'Push'}
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: 'var(--sp-3) var(--sp-4)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 600,
                  color: 'var(--on-surface-subtle)',
                  width: 100,
                }}
              >
                SMS
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <td style={{ padding: 'var(--sp-3) var(--sp-4)', fontWeight: 500, color: 'var(--on-surface)' }}>
                  {isRtl ? row.eventAr : row.eventEn}
                </td>
                <td style={{ textAlign: 'center', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <Checkbox
                    checked={row.email}
                    onChange={() => handleToggle(row.id, 'email')}
                  />
                </td>
                <td style={{ textAlign: 'center', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <Checkbox
                    checked={row.push}
                    onChange={() => handleToggle(row.id, 'push')}
                  />
                </td>
                <td style={{ textAlign: 'center', padding: 'var(--sp-3) var(--sp-4)' }}>
                  <Checkbox
                    checked={row.sms}
                    onChange={() => handleToggle(row.id, 'sms')}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
