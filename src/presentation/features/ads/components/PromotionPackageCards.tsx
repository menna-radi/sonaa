import React from 'react';
import { Check, Edit2, Sparkles, Award } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { formatMoney } from '../../../../core/utils/format';
import { PromotionPackage } from '../types';

interface PromotionPackageCardsProps {
  packages: PromotionPackage[];
  onEditPackage: (pkg: PromotionPackage) => void;
}

export const PromotionPackageCards: React.FC<PromotionPackageCardsProps> = ({
  packages,
  onEditPackage,
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--sp-4)',
        width: '100%',
      }}
    >
      {packages.map((pkg) => {
        const isRecommended = pkg.mostPopular;
        return (
          <Card
            key={pkg.id}
            variant={isRecommended ? 'inverse' : 'default'}
            padding="md"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 'var(--sp-4)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <Award size={18} />
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
                    {pkg.name} Package
                  </span>
                </div>
                {isRecommended && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      background: 'var(--primary)',
                      color: 'var(--on-primary, #ffffff)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={11} />
                    <span>Recommended</span>
                  </span>
                )}
              </div>

              <div>
                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                  {formatMoney(pkg.price, 'ILS')}
                </span>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    marginInlineStart: '4px',
                    opacity: 0.8,
                  }}
                >
                  / {pkg.durationDays} days
                </span>
              </div>

              <div
                style={{
                  padding: 'var(--sp-2)',
                  borderRadius: 'var(--radius-sm)',
                  background: isRecommended ? 'rgba(255, 255, 255, 0.1)' : 'var(--surface-sunken)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                }}
              >
                {pkg.visibilityBoost}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'var(--sp-1)' }}>
                {pkg.features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--sp-2)',
                      fontSize: 'var(--font-size-xs)',
                    }}
                  >
                    <Check size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 'var(--sp-3)',
                borderTop: isRecommended ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                {pkg.activeCount} active craftsmen
              </span>
              <Button
                variant={isRecommended ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => onEditPackage(pkg)}
              >
                <Edit2 size={13} />
                <span>Edit Package</span>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
