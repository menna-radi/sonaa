import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { TextField, TextArea, Select } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage } from '../../../../core/errors/errorMessage';
import { apiClient } from '../../../../core/network/apiClient';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { adCampaignSchema } from '../../../../domain/validation/offers';

export interface CampaignFormValues {
  name: string;
  budget: number;
  placement: string;
  imageUrl?: string;
  description?: string;
  ctaText?: string;
  targetUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationHours?: number;
}

export interface CampaignFormHandle {
  submit: () => void;
}

interface CampaignFormProps {
  initial?: Partial<CampaignFormValues>;
  onSubmit: (values: CampaignFormValues) => void;
  /** Draft snapshot for live previews (called on blur and on valid submit). */
  onDraftChange?: (values: CampaignFormValues) => void;
}

const toLocalInput = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const DURATIONS = [24, 72, 168, 720];

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const CampaignForm = forwardRef<CampaignFormHandle, CampaignFormProps>(function CampaignForm(
  { initial, onSubmit, onDraftChange },
  ref
) {
  const { t } = useLanguage();
  const toast = useToast();

  const [name, setName] = useState(initial?.name ?? '');
  const [budget, setBudget] = useState(initial?.budget !== undefined ? String(initial.budget) : '1');
  const [placement, setPlacement] = useState(
    initial?.placement === 'Featured Slots' ? 'Featured Slots' : 'Home Banner'
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [ctaText, setCtaText] = useState(initial?.ctaText ?? '');
  const [targetUrl, setTargetUrl] = useState(
    typeof initial?.targetUrl === 'string' ? initial.targetUrl : ''
  );
  const [startLocal, setStartLocal] = useState(toLocalInput(initial?.startDate));
  const [endLocal, setEndLocal] = useState(toLocalInput(initial?.endDate));
  const [durationHours, setDurationHours] = useState<number | undefined>(initial?.durationHours);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const collect = () => ({
    name,
    budget,
    placement: placement as 'Home Banner' | 'Featured Slots',
    imageUrl: imageUrl || undefined,
    description: description || undefined,
    ctaText: ctaText || undefined,
    targetUrl: targetUrl || '',
    startDate: startLocal || null,
    endDate: endLocal || null,
    durationHours,
  });

  const err = (field: string): string | undefined => {
    if (!submitted && !touched[field]) return undefined;
    return tError(t, errors[field]);
  };

  const runValidation = (): boolean => {
    const v = validate(adCampaignSchema, collect());
    if (!v.ok) {
      setErrors(v.errors);
      return false;
    }
    setErrors({});
    return true;
  };

  const draftValues = (): CampaignFormValues => ({
    name,
    budget: Number(budget) || 0,
    placement,
    imageUrl: imageUrl || undefined,
    description: description || undefined,
    ctaText: ctaText || undefined,
    targetUrl: targetUrl || undefined,
    startDate: startLocal || undefined,
    endDate: endLocal || undefined,
    durationHours,
  });

  const blur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const v = validate(adCampaignSchema, collect());
    setErrors(v.ok ? {} : v.errors);
    onDraftChange?.(draftValues());
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t('offers_image_type'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('offers_image_too_big'));
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post<{ fileUrl?: string; data?: { fileUrl?: string } }>('/uploads', fd);
      const url = res.fileUrl || res.data?.fileUrl || '';
      if (url) setImageUrl(url);
      else toast.error(t('err_generic'));
    } catch (e) {
      toast.error(errorMessage(e, t));
    } finally {
      setUploading(false);
    }
  };

  const applyDuration = (hours: number) => {
    const base = startLocal ? new Date(startLocal).getTime() : Date.now();
    if (Number.isNaN(base)) return;
    setDurationHours(hours);
    setEndLocal(toLocalInput(new Date(base + hours * 3600 * 1000).toISOString()));
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      if (uploading) {
        toast.info(t('campaigns_upload_wait'));
        return;
      }
      setSubmitted(true);
      const v = validate(adCampaignSchema, collect());
      if (!v.ok) {
        setErrors(v.errors);
        const first = Object.values(v.errors)[0];
        if (first) toast.error(tError(t, first) ?? t('err_generic'));
        document.querySelector<HTMLElement>('.campaign-form [aria-invalid="true"]')?.focus();
        return;
      }
      setErrors({});
      const values: CampaignFormValues = {
        name: v.data.name,
        budget: v.data.budget,
        placement: v.data.placement,
        imageUrl: v.data.imageUrl || undefined,
        description: v.data.description || undefined,
        ctaText: v.data.ctaText || undefined,
        targetUrl: (v.data.targetUrl as string | null) ?? undefined,
        startDate: (v.data.startDate as string | null) ?? undefined,
        endDate: (v.data.endDate as string | null) ?? undefined,
        durationHours: v.data.durationHours,
      };
      onDraftChange?.(values);
      onSubmit(values);
    },
  }));

  return (
    <div className="ui-stack campaign-form">
      <TextField
        label={t('campaigns_field_name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => blur('name')}
        error={err('name')}
        aria-invalid={err('name') ? true : undefined}
      />
      <TextField
        label={t('campaigns_budget_reference')}
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        onBlur={() => blur('budget')}
        error={err('budget')}
        aria-invalid={err('budget') ? true : undefined}
        inputMode="decimal"
      />
      <Select
        label={t('campaigns_field_placement')}
        value={placement}
        onChange={(e) => setPlacement(e.target.value)}
        onBlur={() => blur('placement')}
        error={err('placement')}
        options={[
          { value: 'Home Banner', label: t('offers_placement_top') },
          { value: 'Featured Slots', label: t('offers_placement_featured') },
        ]}
      />
      <div>
        <TextField
          label={t('campaigns_field_image')}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onBlur={() => blur('imageUrl')}
          error={err('imageUrl')}
          placeholder="https://…"
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={t('campaigns_field_image')}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        {uploading ? <span className="ui-caption">{t('campaigns_uploading')}</span> : ''}
      </div>
      <TextArea
        label={t('campaigns_field_description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={() => blur('description')}
        error={err('description')}
      />
      <TextField
        label={t('campaigns_field_cta')}
        value={ctaText}
        onChange={(e) => setCtaText(e.target.value)}
        onBlur={() => blur('ctaText')}
        error={err('ctaText')}
      />
      <TextField
        label={t('campaigns_field_link')}
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        onBlur={() => blur('targetUrl')}
        error={err('targetUrl')}
        dir="ltr"
        placeholder="https://…"
      />
      <div className="ui-form-grid ui-form-grid--2">
        <TextField
          label={t('campaigns_field_start')}
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          onBlur={() => blur('startDate')}
          error={err('startDate')}
        />
        <TextField
          label={t('campaigns_field_end')}
          type="datetime-local"
          value={endLocal}
          onChange={(e) => {
            setEndLocal(e.target.value);
            setDurationHours(undefined);
          }}
          onBlur={() => blur('endDate')}
          error={err('endDate')}
        />
      </div>
      <div className="ui-row" role="group" aria-label={t('campaigns_field_duration')}>
        {DURATIONS.map((h) => (
          <button
            key={h}
            type="button"
            className="offer-target-chip"
            onClick={() => applyDuration(h)}
          >
            <bdi className="ui-num">{h}h</bdi>
          </button>
        ))}
      </div>
    </div>
  );
});

export default CampaignForm;
