import React from 'react';
import { Briefcase, MapPin, ExternalLink } from 'lucide-react';
import type { ActiveJob } from '../../../../domain/entities/LiveActivity';
import { useNavigation } from '../../../context/NavigationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Card, ProgressBar, StatusPill, Button, EmptyState, pillVariantFor, statusLabelKey } from '../../../components/ui';
import { formatMoney, formatNumber } from '../../../../core/utils/format';
import { LIVE_FABRICATED_FIELDS_TRUSTED } from '../flags';

interface ActiveJobsListProps {
  jobs: ActiveJob[];
  totalCount?: number;
}

export const ActiveJobsList: React.FC<ActiveJobsListProps> = ({ jobs, totalCount }) => {
  const { navigate, setSearchQuery } = useNavigation();
  const { t, language } = useLanguage();

  const statusLabel = (status?: string): string => {
    if (!status) return '—';
    const key = statusLabelKey('task', status);
    const label = t(key);
    return label === key ? status : label;
  };

  return (
    <Card
      eyebrow={t('live_jobs_eyebrow')}
      title={`${t('live_jobs_top')} ${formatNumber(jobs.length, language)}`}
      headerAction={
        totalCount !== undefined ? (
          <Button variant="ghost" size="sm" onClick={() => navigate('tasks')}>
            {t('live_jobs_all')} <span className="ui-num">{formatNumber(totalCount, language)}</span>
          </Button>
        ) : undefined
      }
      className="live-card-fill"
    >
      {jobs.length === 0 ? (
        <EmptyState icon={<Briefcase size={28} />} title={t('live_jobs_empty_title')} body={t('live_jobs_empty_body')} />
      ) : (
        <div className="live-list">
          {jobs.map((job) => {
            const hasLocation = typeof job.lat === 'number' && typeof job.lng === 'number';
            const showAmount = LIVE_FABRICATED_FIELDS_TRUSTED && typeof job.amountSAR === 'number';
            const showProgress = LIVE_FABRICATED_FIELDS_TRUSTED && job.progressPercent > 0;
            return (
              <div key={job.id} className="live-job">
                <div className="live-job__top">
                  <div className="live-job__icon">
                    <Briefcase size={14} />
                  </div>
                  <div className="live-job__main">
                    <div className="live-job__row">
                      <span className="live-job__title" title={job.title}>
                        {job.title}
                      </span>
                      {showAmount && <span className="live-job__amount ui-num">{formatMoney(job.amountSAR, 'ILS', language)}</span>}
                    </div>
                    <div className="live-job__meta">
                      <span className="live-job__id ui-num">{job.jobNumber}</span>
                      {' · '}
                      {job.customer} ↔ {job.craftsman}
                      {job.zone ? ` · ${job.zone}` : ''}
                    </div>
                  </div>
                </div>

                {showProgress && <ProgressBar value={job.progressPercent} max={100} size="sm" />}

                <div className="live-job__foot">
                  <StatusPill variant={pillVariantFor('task', job.status)} label={statusLabel(job.status)} />
                  <div className="live-job__actions">
                    {hasLocation && (
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={t('live_job_show_on_map')}
                        onClick={() =>
                          window.dispatchEvent(
                            new CustomEvent('focus-map-job', { detail: { jobId: job.id, coords: [job.lat, job.lng] } })
                          )
                        }
                      >
                        <MapPin size={12} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t('live_job_open')}
                      onClick={() => {
                        if (setSearchQuery) setSearchQuery(job.jobNumber);
                        navigate('tasks');
                      }}
                    >
                      <ExternalLink size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ActiveJobsList;
