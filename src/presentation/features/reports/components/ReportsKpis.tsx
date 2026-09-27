import React from 'react';
import { AlertOctagon, ShieldAlert, UserX, MessageSquare } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';
import { useLanguage } from '../../../context/LanguageContext';
import { ReportItem } from '../types';

interface ReportsKpisProps {
  reports: ReportItem[];
  activeCount: number;
  loading?: boolean;
}

export const ReportsKpis: React.FC<ReportsKpisProps> = ({ reports, activeCount, loading }) => {
  const { t } = useLanguage();

  const fraudCount = reports.filter(
    (r) => r.category === 'fraud' || r.title?.toLowerCase().includes('fraud')
  ).length;

  const fakeAccountsCount = reports.filter((r) => r.category === 'fake_accounts').length;
  const chatsCount = reports.filter((r) => r.category === 'chats').length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      <KpiCard
        icon={<AlertOctagon size={16} />}
        label={t('reports_open_reports') || 'Open Reports'}
        value={activeCount}
        caption="Active Pending Cases"
        tone={activeCount > 0 ? 'danger' : 'default'}
        loading={loading}
      />
      <KpiCard
        icon={<ShieldAlert size={16} />}
        label={t('reports_fraud_signals') || 'Fraud Signals'}
        value={fraudCount}
        caption="Direct User Submissions"
        loading={loading}
      />
      <KpiCard
        icon={<UserX size={16} />}
        label={t('reports_fake_accounts') || 'Fake Accounts'}
        value={fakeAccountsCount}
        caption="Pending Review"
        loading={loading}
      />
      <KpiCard
        icon={<MessageSquare size={16} />}
        label="Chat Reports"
        value={chatsCount}
        caption="Platform Messages"
        loading={loading}
      />
    </div>
  );
};
