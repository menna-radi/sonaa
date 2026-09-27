import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Clock } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { TextField, Select } from '../../../components/ui/FormFields';
import { Segmented } from '../../../components/ui/Segmented';
import { apiClient } from '../../../../core/network/apiClient';
import { resolveMediaUrl } from '../../../../core/utils/mediaUrl';
import { Campaign } from '../types';

interface EditCampaignModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (
    id: string,
    data: {
      name: string;
      budget: number;
      placement: string;
      description?: string;
      ctaText?: string;
      imageUrl?: string;
      startDate?: string;
      endDate?: string | null;
    }
  ) => Promise<void>;
  loading?: boolean;
}

const formatForDateTimeLocal = (d: Date) => {
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  campaign,
  onClose,
  onSave,
  loading: externalLoading = false,
}) => {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [placement, setPlacement] = useState('Home Banner');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Claim Offer');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationPreset, setDurationPreset] = useState<'24h' | '3d' | '7d' | 'until_date' | 'indefinite'>('indefinite');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setBudget(String(campaign.budget || 5000));
      setPlacement(campaign.placement || 'Home Banner');
      setDescription(campaign.description || '');
      setCtaText(campaign.ctaText || 'Claim Offer');
      setImageUrl(campaign.imageUrl || '');
      setImageFile(null);
      setImagePreview(campaign.imageUrl || null);
      setError(null);

      if (campaign.endDate) {
        setEndDate(formatForDateTimeLocal(new Date(campaign.endDate)));
        setDurationPreset('until_date');
      } else {
        setEndDate('');
        setDurationPreset('indefinite');
      }

      if (campaign.startDate) {
        setStartDate(formatForDateTimeLocal(new Date(campaign.startDate)));
      } else {
        setStartDate(formatForDateTimeLocal(new Date()));
      }
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    if (!name.trim()) {
      setError('Campaign name is required');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget <= 0) {
      setError('Please enter a valid budget');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          const uploadRes = await apiClient.post<any>('/uploads', formData);
          const uploaded = uploadRes?.fileUrl || uploadRes?.data?.fileUrl;
          if (uploaded) finalImageUrl = uploaded;
        } catch (uploadErr) {
          console.error('Failed to upload image:', uploadErr);
        }
      }

      let finalEndDate: string | null = null;
      const baseStart = startDate ? new Date(startDate) : new Date();

      if (durationPreset === '24h') {
        finalEndDate = new Date(baseStart.getTime() + 24 * 3600 * 1000).toISOString();
      } else if (durationPreset === '3d') {
        finalEndDate = new Date(baseStart.getTime() + 3 * 24 * 3600 * 1000).toISOString();
      } else if (durationPreset === '7d') {
        finalEndDate = new Date(baseStart.getTime() + 7 * 24 * 3600 * 1000).toISOString();
      } else if (durationPreset === 'until_date' && endDate) {
        finalEndDate = new Date(endDate).toISOString();
      } else if (durationPreset === 'indefinite') {
        finalEndDate = null;
      }

      await onSave(campaign.id, {
        name: name.trim(),
        budget: numBudget,
        placement,
        description: description.trim(),
        ctaText: ctaText.trim(),
        imageUrl: finalImageUrl,
        startDate: baseStart.toISOString(),
        endDate: finalEndDate,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || externalLoading;

  return (
    <Modal isOpen={Boolean(campaign)} onClose={onClose} title="Edit Ad & Creative">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        {error && (
          <div
            style={{
              padding: 'var(--sp-2) var(--sp-3)',
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {error}
          </div>
        )}

        <TextField
          label="Ad Title / Campaign Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <TextField
          label="Description / Subtitle"
          placeholder="e.g. Special offer available now on Sonaa"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
          <TextField
            label="Button Text (CTA)"
            placeholder="e.g. Claim Offer / Book Now"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
          />

          <Select
            label="Placement"
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            options={[
              { value: 'Home Banner', label: 'Home Banner' },
              { value: 'Featured Slots', label: 'Featured Slots' },
              { value: 'Search Results', label: 'Search Results' },
              { value: 'Popups', label: 'Popups' },
              { value: 'Category Page', label: 'Category Page' },
            ]}
          />
        </div>

        <TextField
          label="Budget (ILS)"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
          min={1}
        />

        {/* Duration / Expiration */}
        <div
          style={{
            padding: 'var(--sp-3)',
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            <Clock size={15} style={{ color: 'var(--primary)' }} />
            <span>Campaign Duration & Expiry</span>
          </div>

          <Segmented
            value={durationPreset}
            onChange={(val) => setDurationPreset(val as typeof durationPreset)}
            items={[
              { value: '24h', label: '24h' },
              { value: '3d', label: '3 Days' },
              { value: '7d', label: '7 Days' },
              { value: 'until_date', label: 'Until Date' },
              { value: 'indefinite', label: 'Continuous' },
            ]}
          />

          {durationPreset === 'until_date' && (
            <TextField
              label="Target End Date & Time"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          )}
        </div>

        {/* Creative / Banner Image */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Creative Banner Image
            </label>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              1200×628 (1.91:1) recommended
            </span>
          </div>

          {imagePreview ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '140px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: 'var(--surface-sunken)',
              }}
            >
              <img
                src={resolveMediaUrl(imagePreview)}
                alt="Banner Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div
              style={{
                height: '90px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-sunken)',
                color: 'var(--text-muted)',
                gap: 'var(--sp-1)',
              }}
            >
              <ImageIcon size={24} />
              <span style={{ fontSize: 'var(--font-size-xs)' }}>No active banner image</span>
            </div>
          )}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--sp-2)',
              padding: 'var(--sp-2) var(--sp-3)',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px dashed var(--border-color)',
              background: 'var(--surface-base)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-primary)',
            }}
          >
            <Upload size={16} />
            <span>{imageFile ? imageFile.name : 'Choose Image File'}</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isBusy}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
