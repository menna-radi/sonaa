import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBroadcast } from '../hooks/useBroadcast';
import { PageHeader } from '../../../components/ui/PageHeader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BroadcastKpis } from '../components/BroadcastKpis';
import { BroadcastComposer } from '../components/BroadcastComposer';
import { BroadcastPreview } from '../components/BroadcastPreview';
import { BroadcastHistoryTable } from '../components/BroadcastHistoryTable';

export const BroadcastPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const {
    loading,
    error,
    kpis,
    title,
    setTitle,
    message,
    setMessage,
    imageUrl,
    setImageUrl,
    deepLink,
    setDeepLink,
    targetCity,
    setTargetCity,
    channels,
    setChannels,
    audience,
    setAudience,
    schedule,
    setSchedule,
    date,
    setDate,
    time,
    setTime,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    campaigns,
    audienceInfo,
    channelsText,
    scheduleText,
    estSmsCost,
    addCampaign,
    deleteCampaign,
  } = useBroadcast();

  const handleExportCSV = () => {
    const headers = ['Campaign Title', 'Audience', 'Status', 'Send Date', 'Recipients', 'Open Rate'];
    const rows = campaigns.map((c) => [c.title, c.audience, c.status, c.sendDate, c.recipients, c.openRate]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `broadcast_campaigns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <PageHeader
        title={t('broadcast_title') || 'Broadcast Campaigns'}
        subtitle={
          t('broadcast_subtitle') ||
          'Compose multi-channel notifications, preview on live device frames, and inspect delivery engagement'
        }
      />

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            flexDirection: 'column',
            gap: 'var(--sp-3)',
          }}
        >
          <RefreshCw className="animate-spin" size={32} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface-subtle)' }}>
            Loading broadcast campaigns...
          </span>
        </div>
      ) : error ? (
        <EmptyState title="Failed to Load Broadcast Data" description={error} />
      ) : (
        <>
          <BroadcastKpis kpis={kpis} loading={loading} />

          {/* Form + Preview Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 'var(--sp-4)',
              alignItems: 'start',
            }}
          >
            <BroadcastComposer
              title={title}
              setTitle={setTitle}
              message={message}
              setMessage={setMessage}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              deepLink={deepLink}
              setDeepLink={setDeepLink}
              targetCity={targetCity}
              setTargetCity={setTargetCity}
              channels={channels}
              setChannels={setChannels}
              audience={audience}
              setAudience={setAudience}
              schedule={schedule}
              setSchedule={setSchedule}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              audienceInfo={audienceInfo}
              estSmsCost={estSmsCost}
              onSendNow={() => addCampaign('Sent')}
              onSaveDraft={() => addCampaign('Draft')}
            />

            <BroadcastPreview
              title={title}
              message={message}
              imageUrl={imageUrl}
              deepLink={deepLink}
              targetCity={targetCity}
              audienceText={audienceInfo?.label || audience}
              channelsText={channelsText}
            />
          </div>

          <BroadcastHistoryTable
            campaigns={campaigns}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onDeleteCampaign={deleteCampaign}
            onExportCSV={handleExportCSV}
          />
        </>
      )}
    </div>
  );
};
