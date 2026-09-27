import React from 'react';
import { Send, Eye, Calendar, Clock, Smartphone, MessageSquare, Mail, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TextField, TextArea, Select, Checkbox } from '../../../components/ui/FormFields';
import { Segmented } from '../../../components/ui/Segmented';
import { useConfirm } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../components/ui/Toast';
import { useLanguage } from '../../../context/LanguageContext';

interface BroadcastComposerProps {
  title: string;
  setTitle: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  imageUrl: string;
  setImageUrl: (val: string) => void;
  deepLink: string;
  setDeepLink: (val: string) => void;
  targetCity: string;
  setTargetCity: (val: string) => void;
  channels: string[];
  setChannels: (channels: string[]) => void;
  audience: string;
  setAudience: (val: string) => void;
  schedule: string;
  setSchedule: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  time: string;
  setTime: (val: string) => void;
  audienceInfo?: { count: string | number; label: string; name?: string };
  estSmsCost?: string;
  onSendNow: () => Promise<boolean>;
  onSaveDraft: () => Promise<boolean>;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({
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
  audienceInfo,
  estSmsCost,
  onSendNow,
  onSaveDraft,
}) => {
  const { t } = useLanguage();
  const confirm = useConfirm();
  const toast = useToast();

  const handleToggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both a campaign title and notification message.');
      return;
    }

    const count = audienceInfo?.count || 12450;
    const ok = await confirm({
      title: 'Dispatch Broadcast Notification?',
      body: (
        <div>
          <p style={{ margin: '0 0 8px 0' }}>
            You are about to dispatch this broadcast to approximately{' '}
            <strong>{count.toLocaleString()} recipients</strong> across active channels:
          </p>
          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 'var(--text-sm)' }}>
            {channels.map((c) => (
              <li key={c} style={{ textTransform: 'capitalize' }}>
                {c.replace('_', ' ')}
              </li>
            ))}
          </ul>
        </div>
      ),
      confirmLabel: 'Send Broadcast Now',
    });

    if (!ok) return;

    const success = await onSendNow();
    if (success) {
      toast.success('Broadcast notification dispatched successfully!');
    } else {
      toast.error('Failed to send broadcast.');
    }
  };

  const handleDraft = async () => {
    if (!title.trim()) {
      toast.error('Please enter a campaign title before saving as draft.');
      return;
    }
    const success = await onSaveDraft();
    if (success) {
      toast.success('Campaign saved as draft.');
    }
  };

  return (
    <Card
      title={t('tab_compose') || 'Compose Broadcast Campaign'}
      subtitle="Craft multi-channel message and configure audience segments"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
        <TextField
          label="Campaign Title"
          placeholder="e.g. Urgent Marketplace Maintenance Notice"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TextArea
            label="Message Content"
            placeholder="Type your message text here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--on-surface-subtle)' }}>
            {message.length} / 500 characters
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
          <TextField
            label="Banner Image URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <TextField
            label="Deep Link / Action Route (Optional)"
            placeholder="/tasks/explore or /profile/verify"
            value={deepLink}
            onChange={(e) => setDeepLink(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
          <Select
            label="Target Audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            options={[
              { value: 'all', label: 'All Users (Customers & Craftsmen)' },
              { value: 'customers', label: 'Customers Only' },
              { value: 'craftsmen', label: 'All Craftsmen' },
              { value: 'verified_craftsmen', label: 'Verified Craftsmen Only' },
            ]}
          />

          <Select
            label="Target District / Region"
            value={targetCity}
            onChange={(e) => setTargetCity(e.target.value)}
            options={[
              { value: 'All Jerusalem', label: 'All Jerusalem (القدس كاملة)' },
              { value: 'Beit Hanina', label: 'Beit Hanina (بيت حنينا)' },
              { value: 'Shuafat', label: 'Shuafat (شعفاط)' },
              { value: 'Old City', label: 'Old City (البلدة القديمة)' },
              { value: 'Silwan', label: 'Silwan (سلوان)' },
              { value: 'At-Tur', label: 'At-Tur (الطور)' },
            ]}
          />
        </div>

        {/* Delivery Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)' }}>
            Delivery Channels:
          </label>
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <Checkbox
              label="Push Notification (FCM / APNs)"
              checked={channels.includes('push')}
              onChange={() => handleToggleChannel('push')}
            />
            <Checkbox
              label="In-App Banner"
              checked={channels.includes('in_app')}
              onChange={() => handleToggleChannel('in_app')}
            />
            <Checkbox
              label="SMS Gateway"
              checked={channels.includes('sms')}
              onChange={() => handleToggleChannel('sms')}
            />
          </div>
          {channels.includes('sms') && estSmsCost && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertTriangle size={12} />
              <span>Estimated SMS Gateway Cost: {estSmsCost}</span>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-subtle)' }}>
            Schedule:
          </label>
          <Segmented
            value={schedule}
            onChange={setSchedule}
            items={[
              { value: 'now', label: 'Send Immediately' },
              { value: 'later', label: 'Schedule for Later' },
            ]}
          />

          {schedule === 'later' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <TextField
                label="Time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end', marginTop: 'var(--sp-2)' }}>
          <Button variant="outline" icon={<Eye size={14} />} onClick={handleDraft}>
            Save Draft
          </Button>
          <Button variant="primary" icon={<Send size={14} />} onClick={handleSend}>
            {schedule === 'later' ? 'Schedule Broadcast' : 'Send Broadcast Now'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
