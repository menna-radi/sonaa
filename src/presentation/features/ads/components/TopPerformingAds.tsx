import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/ui/ProgressBar';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Campaign } from '../types';

interface TopPerformingAdsProps {
  campaigns: Campaign[];
}

export const TopPerformingAds: React.FC<TopPerformingAdsProps> = ({ campaigns }) => {
  const topAds = useMemo(() => {
    if (campaigns.length === 0) return [];
    const maxImp = Math.max(...campaigns.map((c) => c.impressions || 1), 1);
    return [...campaigns]
      .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
      .slice(0, 5)
      .map((c) => ({
        name: c.name,
        imp: c.impressions >= 1000 ? `${(c.impressions / 1000).toFixed(1)}K` : `${c.impressions}`,
        ctr: `${c.ctr}% CTR`,
        ratio: Math.round(((c.impressions || 0) / maxImp) * 100) || 10,
      }));
  }, [campaigns]);

  return (
    <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', flex: 1 }}>
      <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
        Top Performing Ads
      </h3>

      {topAds.length === 0 ? (
        <EmptyState title="No active ads" description="Campaigns will appear once launched." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
          {topAds.map((ad, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sp-1)',
                paddingBottom: 'var(--sp-2)',
                borderBottom: idx < topAds.length - 1 ? '1px solid var(--border-color)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Sparkles size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {ad.name}
                  </span>
                </div>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  {ad.imp} &bull; {ad.ctr}
                </span>
              </div>
              <ProgressBar value={ad.ratio} max={100} size="sm" tone="default" />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
