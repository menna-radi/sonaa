import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { SuspiciousAlert, AlertSeverity } from '../../../../domain/entities/LiveActivity';
import { useNavigation } from '../../../context/NavigationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, StatusPill, Button } from '../../../components/ui';
import { formatNumber } from '../../../../core/utils/format';

interface SuspiciousActivityProps {
  alerts: SuspiciousAlert[];
}

const severityVariant = (sev: AlertSeverity): 'danger' | 'warning' | 'neutral' => {
  if (sev === 'high') return 'danger';
  if (sev === 'medium') return 'warning';
  return 'neutral';
};

/** Rendered only when the backend returns alerts. */
export const SuspiciousActivity: React.FC<SuspiciousActivityProps> = ({ alerts }) => {
  const { navigate } = useNavigation();
  const { t, language } = useLanguage();

  if (alerts.length === 0) return null;

  return (
    <Card
      eyebrow={t('live_susp_eyebrow')}
      title={
        <div className="live-card-title">
          <AlertTriangle size={16} />
          <span>
            <span className="ui-num">{formatNumber(alerts.length, language)}</span> {t('live_susp_unresolved')}
          </span>
        </div>
      }
      className="live-card-fill"
    >
      <div className="live-list">
        {alerts.map((alert) => (
          <div key={alert.id} className="live-alert">
            <div className="live-alert__top">
              <span className="live-alert__title">{alert.title}</span>
              <StatusPill variant={severityVariant(alert.severity)} label={t(`live_sev_${alert.severity}`)} />
            </div>
            <p className="live-alert__desc">{alert.description}</p>
            <div className="live-alert__foot">
              <span>{new Intl.RelativeTimeFormat(language, { numeric: 'auto' }).format(-alert.minutesAgo, 'minute')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('reports')}
                iconTrailing={<ArrowRight size={12} className="ui-icon--directional" />}
              >
                {t('live_susp_investigate')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SuspiciousActivity;
