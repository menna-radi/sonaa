import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { ActivityEvent } from '../../../../domain/entities/LiveActivity';
import { AlertBanner, Button } from '../../../components/ui';
import { useNavigation } from '../../../context/NavigationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { formatRelativeTime } from '../../../../core/utils/format';

interface SosBannerProps {
  event: ActivityEvent | null;
}

export const SosBanner: React.FC<SosBannerProps> = ({ event }) => {
  const { t, language } = useLanguage();
  const { navigate } = useNavigation();

  if (!event) return null;

  return (
    <AlertBanner
      tone="danger"
      icon={<AlertTriangle size={20} />}
      title={
        <div className="live-sos-title">
          <span>{t('live_sos_title')}</span>
          <span className="live-sos-badge">{t('live_sos_badge')}</span>
        </div>
      }
      body={[event.title, event.subtitle, formatRelativeTime(event.timestamp, language)].filter(Boolean).join(' · ')}
      actions={
        <Button variant="danger" size="sm" iconLeading={<ExternalLink size={12} />} onClick={() => navigate('tasks')}>
          {t('live_sos_open_task')}
        </Button>
      }
    />
  );
};

export default SosBanner;
