import React from 'react';
import { BitSettingsCard } from './BitSettingsCard';
import { RatesCard } from './RatesCard';

export const BillingSettingsTab: React.FC = () => {
  return (
    <div className="ui-stack">
      <BitSettingsCard />
      <RatesCard />
    </div>
  );
};

export default BillingSettingsTab;
