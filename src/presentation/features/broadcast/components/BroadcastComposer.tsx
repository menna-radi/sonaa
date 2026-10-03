import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TextField, TextArea, Select } from '../../../components/ui/FormFields';
import { Segmented } from '../../../components/ui/Segmented';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { useLanguage } from '../../../context/LanguageContext';
import { formatNumber } from '../../../../core/utils/format';
import { fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { broadcastSchema } from '../../../../domain/validation/ops';
import type { Audience } from '../../../../domain/repositories/BroadcastRepository';
import { useRecipientsEstimate, useSendBroadcast, type BroadcastDraft } from '../hooks/useBroadcast';
import '../broadcast.css';

const BODY_MAX = 500;
const AUDIENCES: Audience[] = ['ALL', 'CUSTOMERS', 'CRAFTSMEN'];

interface BroadcastComposerProps {
  draft: BroadcastDraft;
  onChange: (patch: Partial<BroadcastDraft>) => void;
  onReset: () => void;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({ draft, onChange, onReset }) => {
  const { t, language } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();
  const send = useSendBroadcast();
  const estimate = useRecipientsEstimate(draft.audience);
  const [errors, setErrors] = useState<FieldErrors>({});

  const later = draft.schedule === 'later';
  const cityEnabled = draft.audience === 'CRAFTSMEN';
  const estimateLabel =
    estimate.data === undefined ? null : t('broadcast_recipients_estimate').replace('{n}', formatNumber(estimate.data, language));

  const edit = (patch: Partial<BroadcastDraft>) => {
    onChange(patch);
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  };

  const text =
    (key: 'title' | 'body' | 'targetCity' | 'imageUrl' | 'deepLink' | 'scheduledAt') =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      edit({ [key]: e.target.value });

  const submit = async () => {
    const scheduledIso = later && draft.scheduledAt ? new Date(draft.scheduledAt).toISOString() : undefined;
    if (later && !draft.scheduledAt) {
      setErrors({ scheduledAt: 'val_required' });
      return;
    }
    const r = validate(broadcastSchema, {
      title: draft.title,
      body: draft.body,
      audience: draft.audience,
      targetCity: cityEnabled ? draft.targetCity : undefined,
      imageUrl: draft.imageUrl,
      deepLink: draft.deepLink,
      scheduledAt: scheduledIso,
    });
    if (!r.ok) {
      setErrors(r.errors);
      return;
    }
    setErrors({});

    if (!later) {
      const ok = await confirm({
        title: t('broadcast_confirm_title'),
        body: estimateLabel ? `${t('broadcast_confirm_body')} ${estimateLabel}` : t('broadcast_confirm_body'),
        confirmLabel: t('broadcast_send_now'),
      });
      if (!ok) return;
    }

    const { targetCity, imageUrl, deepLink, scheduledAt, ...rest } = r.data;
    send.mutate(
      {
        ...rest,
        targetCity: targetCity || undefined,
        imageUrl: imageUrl || undefined,
        deepLink: deepLink || undefined,
        scheduledAt: scheduledAt || undefined,
      },
      {
        onSuccess: (record) => {
          toast.success(t(record.status === 'SCHEDULED' ? 'broadcast_toast_scheduled' : 'broadcast_toast_sent'));
          setErrors({});
          onReset();
        },
        onError: (e) => setErrors(fieldErrorsFrom(e)),
      }
    );
  };

  const err = (key: string) => tError(t, errors[key]);

  return (
    <Card title={t('broadcast_new_broadcast')} subtitle={t('broadcast_compose_subtitle')}>
      <div className="ui-stack">
        <TextField
          id="broadcast-title"
          label={t('broadcast_field_title')}
          placeholder={t('broadcast_field_title_ph')}
          value={draft.title}
          onChange={text('title')}
          error={err('title')}
          required
        />
        <div className="ui-stack ui-stack--tight">
          <TextArea
            id="broadcast-body"
            label={t('broadcast_field_body')}
            placeholder={t('broadcast_field_body_ph')}
            value={draft.body}
            onChange={text('body')}
            error={err('body')}
            rows={4}
            required
          />
          <span className="bc-counter ui-num">
            {draft.body.length} / {BODY_MAX}
          </span>
        </div>
        <div className="ui-form-grid ui-form-grid--2">
          <Select
            id="broadcast-audience"
            label={t('broadcast_field_audience')}
            value={draft.audience}
            onChange={(e) => {
              const audience = e.target.value as Audience;
              edit({ audience, ...(audience === 'CRAFTSMEN' ? {} : { targetCity: '' }) });
            }}
            options={AUDIENCES.map((a) => ({ value: a, label: t(`broadcast_audience_${a.toLowerCase()}`) }))}
          />
          <TextField
            id="broadcast-city"
            label={t('broadcast_field_city')}
            placeholder={t('broadcast_field_city_ph')}
            value={draft.targetCity}
            onChange={text('targetCity')}
            error={err('targetCity')}
            helperText={cityEnabled ? undefined : t('broadcast_city_craftsmen_only')}
            disabled={!cityEnabled}
          />
        </div>
        {estimateLabel && <span className="bc-estimate">{estimateLabel}</span>}
        <div className="ui-form-grid ui-form-grid--2">
          <TextField
            id="broadcast-image"
            label={t('broadcast_field_image')}
            placeholder="https://"
            value={draft.imageUrl}
            onChange={text('imageUrl')}
            error={err('imageUrl')}
            inputMode="url"
            dir="ltr"
          />
          <TextField
            id="broadcast-deeplink"
            label={t('broadcast_field_deeplink')}
            placeholder="/tasks"
            value={draft.deepLink}
            onChange={text('deepLink')}
            error={err('deepLink')}
            dir="ltr"
          />
        </div>
        <div className="ui-stack ui-stack--tight">
          <span className="ui-eyebrow">{t('broadcast_field_schedule')}</span>
          <Segmented
            value={draft.schedule}
            onChange={(v) => edit({ schedule: v === 'later' ? 'later' : 'now' })}
            items={[
              { value: 'now', label: t('broadcast_schedule_now') },
              { value: 'later', label: t('broadcast_schedule_later') },
            ]}
          />
          {later && (
            <TextField
              id="broadcast-scheduled-at"
              type="datetime-local"
              label={t('broadcast_field_scheduled_at')}
              value={draft.scheduledAt}
              onChange={text('scheduledAt')}
              error={err('scheduledAt')}
            />
          )}
        </div>
        <div className="ui-row ui-row--end">
          <Button variant="primary" icon={<Send size={14} />} loading={send.isPending} onClick={submit}>
            {t(later ? 'broadcast_schedule_btn' : 'broadcast_send_now')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
