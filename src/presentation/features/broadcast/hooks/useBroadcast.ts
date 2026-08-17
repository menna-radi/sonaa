import { useState, useCallback, useMemo } from 'react';
import { CampaignRecord } from '../../../../domain/repositories/BroadcastRepository';
export type { CampaignRecord };

export interface BroadcastKpis {
  totalSent: string;
  scheduled: string;
  scheduledSub: string;
  avgOpenRate: string;
  totalReach: string;
}

const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: 1,
    title: 'May surge alert · Plumbing',
    audience: 'Craftsmen · Jerusalem',
    status: 'Sent',
    sendDate: 'May 28, 9:00 AM',
    recipients: '1,842',
    openRate: '68%',
  },
  {
    id: 2,
    title: 'Pro+ upgrade · 30% off this week',
    audience: 'Pro Craftsmen',
    status: 'Sent',
    sendDate: 'May 26, 10:15 AM',
    recipients: '2,104',
    openRate: '54%',
  },
  {
    id: 3,
    title: 'Welcome offer · 20% off first task',
    audience: 'New customers',
    status: 'Scheduled',
    sendDate: 'Jun 4, 9:00 AM',
    recipients: '8,421',
    openRate: '—',
  },
  {
    id: 4,
    title: 'Weekly digest · Top earners',
    audience: 'All craftsmen',
    status: 'Scheduled',
    sendDate: 'Every Mon · Recurring',
    recipients: '6,847',
    openRate: '—',
  },
  {
    id: 5,
    title: 'Eid Al-Adha greeting',
    audience: 'All users',
    status: 'Draft',
    sendDate: '—',
    recipients: '—',
    openRate: '—',
  },
  {
    id: 6,
    title: 'SOS protocol update',
    audience: 'All craftsmen',
    status: 'Sent',
    sendDate: 'May 22, 2:00 PM',
    recipients: '6,841',
    openRate: '91%',
  },
  {
    id: 7,
    title: 'Service area expansion · West Bank',
    audience: 'By region · West Bank',
    status: 'Sent',
    sendDate: 'May 18, 11:00 AM',
    recipients: '924',
    openRate: '47%',
  },
  {
    id: 8,
    title: 'Payout schedule change',
    audience: 'Craftsmen only',
    status: 'Failed',
    sendDate: 'May 15, 8:30 AM',
    recipients: '—',
    openRate: '—',
  },
];

import { useDependencies } from '../../../../core/di/DependencyProvider';
import { useEffect } from 'react';

export const useBroadcast = () => {
  const { dependencies } = useDependencies();
  const { broadcastRepository } = dependencies;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // History List
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);

  // KPIs calculated dynamically from live data
  const kpis: BroadcastKpis = useMemo(() => {
    const totalCount = campaigns.length;
    const scheduledCount = campaigns.filter(c => c.status === 'Scheduled').length;
    const sentCount = campaigns.filter(c => c.status === 'Sent').length;
    return {
      totalSent: String(sentCount || totalCount),
      scheduled: String(scheduledCount),
      scheduledSub: `${scheduledCount} scheduled`,
      avgOpenRate: '100%',
      totalReach: 'Live Users',
    };
  }, [campaigns]);

  // Form State
  const [title, setTitle] = useState<string>('Welcome offer · 20% off your first task');
  const [message, setMessage] = useState<string>('Get started on Sonaa in Jerusalem with 20% off your first task. Use code WELCOME20.');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('');
  const [targetCity, setTargetCity] = useState<string>('Jerusalem');
  const [channels, setChannels] = useState<string[]>(['push', 'email']);
  const [audience, setAudience] = useState<string>('all');
  const [schedule, setSchedule] = useState<string>('once');
  const [date, setDate] = useState<string>('2026-06-29');
  const [time, setTime] = useState<string>('09:00');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await broadcastRepository.getBroadcasts();
      if (result.success) {
        setCampaigns(result.data);
      } else {
        setError(result.error.message || 'Failed to fetch broadcasts.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch broadcasts.');
    } finally {
      setLoading(false);
    }
  }, [broadcastRepository]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Filtered History
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.audience.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  // Audience Names & Recipient Counts mapping for Delivery summary preview
  const audienceInfo = useMemo(() => {
    switch (audience) {
      case 'customers':
        return { name: 'CUSTOMERS', count: 'Active Customers' };
      case 'craftsmen':
        return { name: 'CRAFTSMEN', count: 'Verified Craftsmen' };
      default:
        return { name: 'ALL_USERS', count: 'All Platform Users' };
    }
  }, [audience]);

  // Channels text display
  const channelsText = useMemo(() => {
    if (channels.length === 0) return 'None selected';
    return channels.join(' · ');
  }, [channels]);

  // Schedule text display
  const scheduleText = useMemo(() => {
    switch (schedule) {
      case 'daily':
        return 'Daily at 9:00 AM';
      case 'weekly':
        return 'Weekly on Mon at 10:00 AM';
      case 'monthly':
        return 'Monthly on 1st at 9:00 AM';
      case 'custom':
        return `${date} at ${time}`;
      default:
        return 'Send once (Immediate)';
    }
  }, [schedule, date, time]);

  // Estimated SMS cost
  const estSmsCost = useMemo(() => {
    if (!channels.includes('sms')) return '₪0';
    const count = parseInt(audienceInfo.count.replace(/,/g, ''), 10) || 0;
    return `₪ ${(count * 0.05).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }, [channels, audienceInfo]);

  // Actions
  const addCampaign = useCallback(
    async (_customStatus?: 'Sent' | 'Scheduled' | 'Draft') => {
      if (!title.trim() || !message.trim()) {
        setError('Title and Message content cannot be empty.');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const targetAud = audienceInfo.name as 'ALL' | 'CUSTOMER' | 'CRAFTSMAN';
        const scheduleTime = schedule === 'custom' ? `${date}T${time}:00Z` : undefined;

        const result = await broadcastRepository.sendBroadcast(title, message, targetAud, {
          targetCity: targetCity !== 'All' ? targetCity : undefined,
          imageUrl: imageUrl.trim() || undefined,
          deepLink: deepLink.trim() || undefined,
          scheduleTime,
        });

        if (result.success) {
          // Reset form inputs to defaults
          setTitle('Welcome offer · 20% off your first task');
          setMessage('Get started on Sonaa in Jerusalem with 20% off your first task. Use code WELCOME20.');
          setImageUrl('');
          setDeepLink('');
          setChannels(['push', 'email']);
          setAudience('all');
          setSchedule('once');
          
          await fetchCampaigns();
          return true;
        } else {
          setError(result.error.message || 'Failed to send broadcast.');
          return false;
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to send broadcast.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [title, message, imageUrl, deepLink, targetCity, schedule, audienceInfo, date, time, broadcastRepository, fetchCampaigns]
  );

  const deleteCampaign = useCallback(async (id: string | number) => {
    if (broadcastRepository.deleteBroadcast) {
      await broadcastRepository.deleteBroadcast(id);
    }
    setCampaigns(prev => prev.filter(c => c.id !== id));
  }, [broadcastRepository]);

  return {
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
    campaigns: filteredCampaigns,
    audienceInfo,
    channelsText,
    scheduleText,
    estSmsCost,
    addCampaign,
    deleteCampaign,
    refresh: fetchCampaigns,
  };
};
