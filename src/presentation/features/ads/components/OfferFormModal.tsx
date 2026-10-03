import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { TextField, TextArea, Select } from '../../../components/ui/FormFields';
import { useToast } from '../../../components/ui/Toast';
import { errorMessage, fieldErrorsFrom } from '../../../../core/errors/errorMessage';
import { apiClient } from '../../../../core/network/apiClient';
import { validate, tError, type FieldErrors } from '../../../../domain/validation';
import { offerSchema } from '../../../../domain/validation/offers';
import type { Offer, OfferInput } from '../../../../domain/entities/Offer';
import { OFFER_TARGETS_ENABLED } from '../offerTargets';
import { TargetPicker } from './TargetPicker';
import { useCreateOffer, useUpdateOffer } from '../hooks/useOffers';

interface OfferFormModalProps {
  offer: Offer | null;
  onClose: () => void;
}

const toLocalInput = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const DURATIONS = [
  { hours: 24, days: 1 },
  { hours: 168, days: 7 },
  { hours: 720, days: 30 },
];

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const OfferFormModal: React.FC<OfferFormModalProps> = ({ offer, onClose }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const create = useCreateOffer();
  const update = useUpdateOffer();
  const editing = !!offer;
  const busy = create.isPending || update.isPending;

  const [titleEn, setTitleEn] = useState(offer?.titleEn ?? '');
  const [titleAr, setTitleAr] = useState(offer?.titleAr ?? '');
  const [subtitleEn, setSubtitleEn] = useState(offer?.subtitleEn ?? '');
  const [subtitleAr, setSubtitleAr] = useState(offer?.subtitleAr ?? '');
  const [buttonTextEn, setButtonTextEn] = useState(offer?.buttonTextEn ?? '');
  const [buttonTextAr, setButtonTextAr] = useState(offer?.buttonTextAr ?? '');
  const [imageUrl, setImageUrl] = useState(offer?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [bannerType, setBannerType] = useState<'PROMO' | 'EMERGENCY_SOS'>(offer?.bannerType ?? 'PROMO');
  const [placement, setPlacement] = useState<'TOP' | 'FEATURED'>(offer?.placement ?? 'TOP');
  const [targetType, setTargetType] = useState<string>(offer?.targetType ?? 'NONE');
  const [targetId, setTargetId] = useState<string | undefined>(offer?.targetId);
  const [targetUrl, setTargetUrl] = useState(offer?.targetUrl ?? '');
  const [startLocal, setStartLocal] = useState(toLocalInput(offer?.startDate));
  const [endLocal, setEndLocal] = useState(toLocalInput(offer?.endDate));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [now] = useState(() => Date.now());

  const err = (field: string): string | undefined => {
    if (!submitted && !errors[field]) return undefined;
    return tError(t, errors[field]);
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
    const base = startLocal ? new Date(startLocal).getTime() : now;
    if (Number.isNaN(base)) return;
    const end = new Date(base + hours * 3600 * 1000);
    setEndLocal(toLocalInput(end.toISOString()));
  };

  const submit = () => {
    setSubmitted(true);
    const v = validate(offerSchema, {
      titleEn,
      titleAr,
      subtitleEn,
      subtitleAr,
      buttonTextEn,
      buttonTextAr,
      imageUrl,
      bannerType,
      placement,
      targetType,
      targetId,
      targetUrl: targetUrl || '',
      startDate: startLocal || null,
      endDate: endLocal || null,
    });
    if (!v.ok) {
      setErrors(v.errors);
      const first = Object.values(v.errors)[0];
      if (first) toast.error(tError(t, first) ?? t('err_generic'));
      return;
    }
    setErrors({});
    const input: OfferInput = {
      titleEn: v.data.titleEn,
      titleAr: v.data.titleAr,
      subtitleEn: v.data.subtitleEn,
      subtitleAr: v.data.subtitleAr,
      buttonTextEn: v.data.buttonTextEn,
      buttonTextAr: v.data.buttonTextAr,
      imageUrl: v.data.imageUrl,
      bannerType: v.data.bannerType,
      placement: v.data.placement,
      targetType: v.data.targetType,
      targetId: v.data.targetId,
      targetUrl: (v.data.targetUrl as string | null) ?? undefined,
      startDate: (v.data.startDate as string | null) ?? undefined,
      endDate: (v.data.endDate as string | null) ?? undefined,
    };
    const done = {
      onSuccess: onClose,
      onError: (e: Error) => {
        const server = fieldErrorsFrom(e);
        if (Object.keys(server).length) setErrors(server);
        else toast.error(errorMessage(e, t));
      },
    };
    if (editing && offer) update.mutate({ id: offer.id, patch: input }, done);
    else create.mutate(input, done);
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onClose}
      title={editing ? t('offers_edit') : t('offers_new')}
      onSubmit={submit}
      pending={busy || uploading}
      size="lg"
    >
      <div className="ui-form-grid ui-form-grid--2">
        <TextField label={t('offers_field_title_en')} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} error={err('titleEn')} />
        <TextField label={t('offers_field_title_ar')} value={titleAr} onChange={(e) => setTitleAr(e.target.value)} error={err('titleAr')} />
          <TextArea
            label={t('offers_field_subtitle_en')}
            value={subtitleEn}
            onChange={(e) => setSubtitleEn(e.target.value)}
            error={err('subtitleEn')}
          />
          <TextArea
            label={t('offers_field_subtitle_ar')}
            value={subtitleAr}
            onChange={(e) => setSubtitleAr(e.target.value)}
            error={err('subtitleAr')}
          />
        <TextField label={t('offers_field_button_en')} value={buttonTextEn} onChange={(e) => setButtonTextEn(e.target.value)} error={err('buttonTextEn')} />
        <TextField label={t('offers_field_button_ar')} value={buttonTextAr} onChange={(e) => setButtonTextAr(e.target.value)} error={err('buttonTextAr')} />
        <div>
          <TextField label={t('offers_field_image')} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} error={err('imageUrl')} />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label={t('offers_field_image')}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </div>
        <Select
          label={t('offers_field_banner_type')}
          value={bannerType}
          onChange={(e) => setBannerType(e.target.value as 'PROMO' | 'EMERGENCY_SOS')}
          options={[
            { value: 'PROMO', label: t('offers_type_promo') },
            { value: 'EMERGENCY_SOS', label: t('offers_type_sos') },
          ]}
        />
        <Select
          label={t('offers_field_placement')}
          value={placement}
          onChange={(e) => setPlacement(e.target.value as 'TOP' | 'FEATURED')}
          options={[
            { value: 'TOP', label: t('offers_placement_top') },
            { value: 'FEATURED', label: t('offers_placement_featured') },
          ]}
        />
        <Select
          label={t('offers_field_opens')}
          value={targetType}
          onChange={(e) => {
            const next = e.target.value;
            setTargetType(next);
            if (next === 'NONE' || next === 'URL') setTargetId(undefined);
          }}
          options={OFFER_TARGETS_ENABLED.map((o) => ({ value: o, label: t(`offers_opens_${o.toLowerCase()}`) }))}
        />
        {targetType === 'URL' && (
          <TextField label={t('offers_field_link')} value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} error={err('targetUrl')} dir="ltr" />
        )}
        {targetType !== 'NONE' && targetType !== 'URL' && (
          <TargetPicker targetType={targetType} targetId={targetId} onTargetIdChange={setTargetId} error={err('targetId')} />
        )}
        <TextField
          label={t('offers_field_starts')}
          type="datetime-local"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          error={err('startDate')}
        />
        <TextField
          label={t('offers_field_ends')}
          type="datetime-local"
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
          error={err('endDate')}
        />
      </div>
      {bannerType === 'EMERGENCY_SOS' && <p className="ui-caption">{t('offers_sos_helper')}</p>}
      <div className="ui-row">
        {DURATIONS.map((d) => (
          <button key={d.hours} type="button" className="offer-target-chip" onClick={() => applyDuration(d.hours)}>
            <bdi className="ui-num">
              {d.days} {t('billing_plan_days_short')}
            </bdi>
          </button>
        ))}
      </div>
    </FormModal>
  );
};

export default OfferFormModal;
