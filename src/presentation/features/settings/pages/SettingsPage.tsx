import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader, Segmented } from '../../../components/ui';
import { TeamTab } from '../components/TeamTab';
import { PlatformTab } from '../components/PlatformTab';
import { AuditLogsTab } from '../components/AuditLogsTab';
import { SecurityTab } from '../components/SecurityTab';
import { AppearanceTab } from '../components/AppearanceTab';
import '../settings.css';

const TABS = ['team', 'platform', 'audit', 'security', 'appearance'] as const;
type SettingsTab = (typeof TABS)[number];

function readTab(): SettingsTab {
  try {
    const v = sessionStorage.getItem('settings_tab');
    const found = TABS.find((tab) => tab === v);
    if (found) return found;
  } catch {
    // storage unavailable — fall through to default
  }
  return 'team';
}

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<SettingsTab>(readTab);

  const changeTab = (value: string) => {
    const next = TABS.find((x) => x === value);
    if (!next) return;
    setTab(next);
    try {
      sessionStorage.setItem('settings_tab', next);
    } catch {
      // storage unavailable — the tab simply is not remembered
    }
  };

  return (
    <div className="ui-page">
      <PageHeader title={t('settings_page_title')} subtitle={t('settings_page_subtitle')} />
      <div className="ui-scroll-x">
        <Segmented
          value={tab}
          onChange={changeTab}
          items={TABS.map((x) => ({ value: x, label: t(`settings_tab_${x}`) }))}
        />
      </div>
      {tab === 'team' && <TeamTab />}
      {tab === 'platform' && <PlatformTab />}
      {tab === 'audit' && <AuditLogsTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'appearance' && <AppearanceTab />}
    </div>
  );
};

export default SettingsPage;
