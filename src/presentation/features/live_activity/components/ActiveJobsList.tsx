import React from 'react';
import { Briefcase, MapPin, ExternalLink } from 'lucide-react';
import type { ActiveJob } from '../../../../domain/entities/LiveActivity';
import { useNavigation } from '../../../../presentation/context/NavigationContext';
import { Card, ProgressBar, StatusPill, Button, pillVariantFor } from '../../../components/ui';
import { formatMoney } from '../../../../core/utils/format';

interface ActiveJobsListProps {
  jobs: ActiveJob[];
  totalCount?: number;
}

export const ActiveJobsList: React.FC<ActiveJobsListProps> = ({ jobs, totalCount }) => {
  const { navigate, setSearchQuery } = useNavigation();

  return (
    <Card
      eyebrow="Active Jobs In Progress"
      title={`Top ${jobs.length}`}
      headerAction={
        totalCount !== undefined ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('tasks')}
          >
            All {totalCount.toLocaleString()}
          </Button>
        ) : undefined
      }
      className="active-jobs-card live-desktop-jobs-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {jobs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--sp-6) var(--sp-4)',
            color: 'var(--text-muted)',
          }}
        >
          <Briefcase size={28} style={{ opacity: 0.35, margin: '0 auto var(--sp-2)', display: 'block' }} />
          <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No active tasks in progress
          </div>
          <div style={{ fontSize: 'var(--fs-caption)', marginTop: 4, color: 'var(--text-muted)' }}>
            New dispatches and client tasks will appear here in real time.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1 }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                textAlign: 'start',
                padding: 'var(--sp-3)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--sp-2)' }}>
                    <span
                      style={{
                        fontSize: 'var(--fs-caption)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={job.title}
                    >
                      {job.title}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--fs-caption)',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatMoney(job.amountSAR)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 'var(--fs-micro)',
                      color: 'var(--text-muted)',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <span style={{ color: 'var(--text-faint)' }}>{job.jobNumber}</span>
                    {' · '}{job.customer} ↔ {job.craftsman} · {job.zone}
                  </div>
                </div>
              </div>

              {job.progressPercent !== undefined && job.progressPercent > 0 && (
                <ProgressBar value={job.progressPercent} max={100} size="sm" />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                <StatusPill
                  variant={pillVariantFor('task', job.status || 'IN_PROGRESS')}
                  label={job.status?.replace('_', ' ') || 'ACTIVE'}
                />

                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('focus-map-job', {
                          detail: {
                            jobId: job.id,
                            coords: [job.lat || 31.7683, job.lng || 35.2137],
                            title: job.title,
                          },
                        })
                      );
                    }}
                  >
                    <MapPin size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
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
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActiveJobsList;
