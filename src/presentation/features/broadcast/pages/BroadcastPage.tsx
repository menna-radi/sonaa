import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { ErrorState } from '../../../components/ui/EmptyState';
import { formatRelativeTime } from '../../../../core/utils/format';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { useBroadcasts, EMPTY_DRAFT, type BroadcastDraft } from '../hooks/useBroadcast';
import { BroadcastKpis } from '../components/BroadcastKpis';
import { BroadcastComposer } from '../components/BroadcastComposer';
import { BroadcastPreview } from '../components/BroadcastPreview';
import { BroadcastHistoryTable } from '../components/BroadcastHistoryTable';
import '../broadcast.css';

export const BroadcastPage: React.FC = () => {
  const { t, language } = useLanguage();
  const q = useBroadcasts();
  const [draft, setDraft] = useState<BroadcastDraft>(EMPTY_DRAFT);

  const campaigns = q.data ?? [];
  const sent = campaigns.filter((c) => c.status === 'SENT');

  return (
    <div className="ui-page">
      <PageHeader
        title={t('broadcast_title')}
        subtitle={t('broadcast_subtitle')}
        meta={q.dataUpdatedAt ? `${t('updated')} ${formatRelativeTime(q.dataUpdatedAt, language)}` : undefined}
        actions={
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} loading={q.isFetching} onClick={() => q.refetch()}>
            {t('btn_refresh')}
          </Button>
        }
      />
      {q.isError ? (
        <ErrorState title={t('status_error_title')} message={errorMessage(q.error, t)} onRetry={() => q.refetch()} />
      ) : (
        <>
          <BroadcastKpis
            sent={sent.length}
            scheduled={campaigns.filter((c) => c.status === 'SCHEDULED').length}
            reach={sent.reduce((sum, c) => sum + c.recipients, 0)}
            loading={q.isLoading}
          />
          <div className="ui-split ui-split--even">
            <BroadcastComposer
              draft={draft}
              onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              onReset={() => setDraft(EMPTY_DRAFT)}
            />
            <div className="bc-side">
              <BroadcastPreview
                title={draft.title}
                body={draft.body}
                imageUrl={draft.imageUrl}
                deepLink={draft.deepLink}
                targetCity={draft.targetCity}
                audienceLabel={t(`broadcast_audience_${draft.audience.toLowerCase()}`)}
              />
              <BroadcastHistoryTable campaigns={campaigns} loading={q.isLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default BroadcastPage;
