import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Switch } from '../../../components/ui/FormFields';
import { PromotionFeature } from '../types';

interface PromotionFeaturesCardProps {
  features: PromotionFeature[];
  onToggle: (id: string) => void;
}

export const PromotionFeaturesCard: React.FC<PromotionFeaturesCardProps> = ({
  features,
  onToggle,
}) => {
  return (
    <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
          Platform Promotion Switches
        </h3>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          Enable or disable marketplace discovery enhancements
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-3)',
        }}
      >
        {features.map((feat) => (
          <div
            key={feat.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--sp-3)',
              background: 'var(--surface-sunken)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, paddingInlineEnd: 'var(--sp-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {feat.name}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {feat.description}
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary)', fontWeight: 500, marginTop: '2px' }}>
                {feat.activeCount} active craftsmen
              </span>
            </div>

            <Switch
              checked={feat.enabled}
              onChange={() => onToggle(feat.id)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
