import React from 'react';
import { Briefcase } from 'lucide-react';
import type { ActiveJob } from '../../../../domain/entities/LiveActivity';

interface ActiveJobsListProps {
  jobs: ActiveJob[];
  totalCount?: number;
}

export const ActiveJobsList: React.FC<ActiveJobsListProps> = ({ jobs, totalCount }) => {
  return (
    <div
      className="glass-card live-desktop-jobs-card"
      style={{
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        padding: '16px',
        height: '100%',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ textAlign: 'start' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Active Jobs In Progress
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Jerusalem region · Top {jobs.length}
          </div>
        </div>
        {totalCount !== undefined && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            padding: '3px 8px',
            borderRadius: '20px',
          }}>
            All {totalCount.toLocaleString()}
          </span>
        )}
      </div>

      {/* Job list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {jobs.map((job) => (
          <div key={job.id} style={{ textAlign: 'start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              {/* Icon */}
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Briefcase size={15} color="var(--text-muted)" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%' }}>
                    {job.title}
                  </span>
                  <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {job.amountSAR.toLocaleString()} ILS
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  <span style={{ color: 'var(--text-disabled)' }}>{job.jobNumber}</span>
                  {' · '}{job.customer} ↔ {job.craftsman} · {job.zone}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'var(--bg-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${job.progressPercent}%`,
                background: 'var(--color-primary)',
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-disabled)', textAlign: 'end', marginTop: '2px' }}>
              {job.progressPercent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveJobsList;
