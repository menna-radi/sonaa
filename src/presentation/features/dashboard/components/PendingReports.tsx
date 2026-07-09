import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { GlassCard } from '../../../components/GlassCard';
import type { PendingReport } from '../../../../domain/repositories/MetricRepository';
import { Scale, CreditCard, ShieldAlert, UserX, AlertTriangle } from 'lucide-react';

interface PendingReportsProps {
  reports: PendingReport[];
}

export const PendingReports: React.FC<PendingReportsProps> = ({ reports }) => {
  const { t } = useLanguage();
  const { navigate } = useNavigation();

  const getReportIconStyles = (typeKey: string) => {
    switch (typeKey) {
      case 'report_service_dispute':
        return {
          icon: <Scale size={11} />,
          bg: '#171717',
          color: '#FFFFFF'
        };
      case 'report_payment_issue':
        return {
          icon: <CreditCard size={11} />,
          bg: '#E5E5E5',
          color: '#171717'
        };
      case 'report_quality_concern':
        return {
          icon: <ShieldAlert size={11} />,
          bg: '#F5F5F5',
          color: '#171717'
        };
      case 'report_no_show':
        return {
          icon: <UserX size={11} />,
          bg: '#E5E5E5',
          color: '#171717'
        };
      case 'report_inappropriate_conduct':
        return {
          icon: <AlertTriangle size={11} />,
          bg: '#171717',
          color: '#FFFFFF'
        };
      default:
        return {
          icon: <AlertTriangle size={11} />,
          bg: '#171717',
          color: '#FFFFFF'
        };
    }
  };

  return (
    <GlassCard 
      className="pending-reports-card" 
      status="normal"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        textAlign: 'start',
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0px 1px 1.5px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >

      {/* Header row */}
      <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'flex-start', width: '100%' }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            color: '#737373', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            {t('sec_pending_reports')}
          </span>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            marginTop: '2px', 
            color: '#171717',
            margin: '2px 0 0 0'
          }}>
            5 require review
          </h3>
        </div>
        <a 
          href="#" 
          style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#171717',
            marginTop: '2px'
          }} 
          onClick={(e) => {
            e.preventDefault();
            navigate('reports');
          }}
        >
          View all
        </a>
      </div>

      {/* Reports Rows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        {reports.map((report) => {
          const styles = getReportIconStyles(report.typeKey);
          return (
            <div 
              key={report.id} 
              className="report-list-row flex-between" 
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                transition: 'var(--transition-fast)',
                height: '51px',
                boxSizing: 'border-box',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'start', overflow: 'hidden' }}>
                {/* Circular profile placeholder with Lucide icon */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: styles.bg,
                  borderRadius: '50%',
                  color: styles.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {styles.icon}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#171717', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {t(report.typeKey)}
                  </span>
                  <span style={{ fontSize: '10px', color: '#737373', marginTop: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {report.details}
                  </span>
                </div>
              </div>

              {/* Time label */}
              <span style={{ fontSize: '10px', color: '#A3A3A3', flexShrink: 0, marginLeft: '8px' }}>
                {t(report.timeKey)}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        .report-list-row:hover {
          background: #F5F5F5 !important;
        }
        @media (max-width: 768px) {
          .pending-reports-card {
            display: none !important;
          }
        }
      `}</style>
    </GlassCard>
  );
};
export default PendingReports;
