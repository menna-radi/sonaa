import React, { useState } from 'react';
import type { Submission } from '../types';
import { Card, EmptyState, IconButton, Skeleton } from '../../../components/ui';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';

interface PortfolioStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const PortfolioStep: React.FC<PortfolioStepProps> = ({ submission, onZoom }) => {
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});

  // Collect any available portfolio photos (avatar, work photos, etc.)
  const portfolioPhotos: string[] = [];
  if (submission.avatar) portfolioPhotos.push(submission.avatar);
  if (submission.certImageUrl) portfolioPhotos.push(submission.certImageUrl);

  return (
    <Card
      title={`${submission.name}'s Portfolio`}
      subtitle="Craftsman project samples and past work evidence"
      padding="md"
    >
      {portfolioPhotos.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={32} style={{ color: 'var(--text-faint)' }} />}
          title="No portfolio images uploaded"
          description="This craftsman has not attached project portfolio photos to their verification submission."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 'var(--sp-4)',
          }}
        >
          {portfolioPhotos.map((url, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
              onClick={() => onZoom(url)}
            >
              {!loadedMap[idx] && (
                <div style={{ position: 'absolute', inset: 0 }}>
                  <Skeleton width="100%" height="100%" />
                </div>
              )}
              <img
                src={url}
                alt={`Portfolio piece ${idx + 1}`}
                loading="lazy"
                onLoad={() => setLoadedMap((prev) => ({ ...prev, [idx]: true }))}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: loadedMap[idx] ? 'block' : 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 'var(--sp-2)',
                  right: 'var(--sp-2)',
                  background: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: 'var(--shadow-overlay)',
                }}
              >
                <IconButton
                  icon={<ZoomIn size={14} />}
                  aria-label="Zoom portfolio photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    onZoom(url);
                  }}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PortfolioStep;
