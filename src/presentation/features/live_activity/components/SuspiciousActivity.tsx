import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { SuspiciousAlert, AlertSeverity } from '../../../../domain/entities/LiveActivity';
import { useNavigation } from '../../../context/NavigationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, StatusPill, Button } from '../../../components/ui';

interface SuspiciousActivityProps {
  alerts: SuspiciousAlert[];
}

export const SuspiciousActivity: React.FC<SuspiciousActivityProps> = ({ alerts }) => {
  const { navigate } = useNavigation();
  const { language } = useLanguage();
  const unresolvedCount = alerts.length;

  const severityVariant = (sev: AlertSeverity): 'danger' | 'warning' | 'neutral' => {
    switch (sev) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <Card
      eyebrow="Suspicious Activity"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger-text)' }} />
          <span>{unresolvedCount} alerts unresolved</span>
        </div>
      }
      className="suspicious-activity-card live-desktop-suspicious-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {alerts.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 120,
            color: 'var(--text-muted)',
            fontSize: 'var(--fs-caption)',
            textAlign: 'center',
          }}
        >
          No suspicious alerts detected
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1 }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                padding: 'var(--sp-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
                <span
                  style={{
                    fontSize: 'var(--fs-caption)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    flex: 1,
                  }}
                >
                  {alert.title}
                </span>
                <StatusPill
                  variant={severityVariant(alert.severity)}
                  label={alert.severity.toUpperCase()}
                />
              </div>

              <p
                style={{
                  fontSize: 'var(--fs-micro)',
                  color: 'var(--text-muted)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {alert.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--sp-2)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 'var(--fs-micro)', color: 'var(--text-faint)' }}>
                  {alert.minutesAgo === 0 ? 'Just now' : `${alert.minutesAgo}m ago`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('reports')}
                  iconTrailing={
                    <ArrowRight
                      size={12}
                      style={{
                        transform: language === 'ar' || language === 'he' ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  }
                >
                  Investigate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default SuspiciousActivity;
