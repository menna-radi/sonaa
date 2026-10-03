import React, { useState } from 'react';
import type { Submission } from '../types';
import { Card, EmptyState, IconButton, Skeleton } from '../../../components/ui';
import { useLanguage } from '../../../context/LanguageContext';
import { tf } from '../utils';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';

interface PortfolioStepProps {
  submission: Submission;
  onZoom: (url: string) => void;
}

export const PortfolioStep: React.FC<PortfolioStepProps> = ({ submission, onZoom }) => {
  const { t } = useLanguage();
  const [loadedMap, setLoadedMap] = useState<Record<number, boolean>>({});

  // Collect any available portfolio photos (avatar, work photos, etc.)
  const portfolioPhotos: string[] = [];
  if (submission.avatar) portfolioPhotos.push(submission.avatar);
  if (submission.certImageUrl) portfolioPhotos.push(submission.certImageUrl);

  return (
    <Card
      title={tf(t, 'vr_portfolio_title', { name: submission.name })}
      subtitle={t('vr_portfolio_desc')}
      padding="md"
    >
      {portfolioPhotos.length === 0 ? (
        <EmptyState
          icon={<ImageIcon size={32} className="vr-icon-faint" />}
          title={t('vr_portfolio_empty_title')}
          description={t('vr_portfolio_empty_desc')}
        />
      ) : (
        <div className="vr-grid-photos">
          {portfolioPhotos.map((url, idx) => (
            <div key={idx} className="vr-photo" onClick={() => onZoom(url)}>
              {!loadedMap[idx] && (
                <div className="vr-doc-skeleton">
                  <Skeleton width="100%" height="100%" />
                </div>
              )}
              <img
                src={url}
                alt={tf(t, 'vr_portfolio_piece', { n: idx + 1 })}
                loading="lazy"
                className={`vr-photo__img${loadedMap[idx] ? '' : ' vr-doc-img--hidden'}`}
                onLoad={() => setLoadedMap((prev) => ({ ...prev, [idx]: true }))}
              />
              <div className="vr-photo__zoom">
                <IconButton
                  icon={<ZoomIn size={14} />}
                  aria-label={t('vr_portfolio_zoom')}
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
