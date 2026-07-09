import { useState, useMemo, useCallback } from 'react';

export interface Craftsman {
  id: string;
  name: string;
  trade: string;
  avatarUrl?: string; // If undefined, we show standard initials/icon
  rating: number;
  reviewsCount: number;
  jobsCount: number;
  trustScore: number;
  status: 'online' | 'offline' | 'busy' | 'flagged' | 'suspended';
  joinedDate: string;
  idNumber: string;
  responseTimeMin: number;
  verifications: {
    nationalId: boolean;
    selfieMatch: boolean;
    tradeLicense: boolean;
    bankIban: boolean;
    backgroundCheck: boolean;
    insurance: boolean;
  };
  earnings30Days: number;
  earningsChangePct: number;
  earningsSparkline: number[];
}

const INITIAL_CRAFTSMEN: Craftsman[] = [
  {
    id: '1',
    name: 'Ahmad Al-Otaibi',
    trade: 'Electrician',
    rating: 4.9,
    reviewsCount: 234,
    jobsCount: 412,
    trustScore: 98,
    status: 'online',
    joinedDate: 'Mar 2023',
    idNumber: 'CR-1001',
    responseTimeMin: 2,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: true,
      bankIban: true,
      backgroundCheck: true,
      insurance: false,
    },
    earnings30Days: 18420,
    earningsChangePct: 12.4,
    earningsSparkline: [20, 25, 22, 28, 30, 27, 35, 38, 42],
  },
  {
    id: '2',
    name: 'Mohammed Al-Zahrani',
    trade: 'Plumber',
    rating: 4.8,
    reviewsCount: 187,
    jobsCount: 318,
    trustScore: 94,
    status: 'online',
    joinedDate: 'Jun 2022',
    idNumber: 'CR-1002',
    responseTimeMin: 4,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: true,
      bankIban: true,
      backgroundCheck: true,
      insurance: true,
    },
    earnings30Days: 14200,
    earningsChangePct: 8.5,
    earningsSparkline: [15, 18, 16, 21, 23, 20, 24, 25, 28],
  },
  {
    id: '3',
    name: 'Khalid Al-Qahtani',
    trade: 'AC Technician',
    rating: 5.0,
    reviewsCount: 412,
    jobsCount: 642,
    trustScore: 99,
    status: 'offline',
    joinedDate: 'Jan 2021',
    idNumber: 'CR-1003',
    responseTimeMin: 5,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: true,
      bankIban: true,
      backgroundCheck: true,
      insurance: true,
    },
    earnings30Days: 24800,
    earningsChangePct: 15.2,
    earningsSparkline: [30, 32, 28, 35, 38, 36, 40, 42, 45],
  },
  {
    id: '4',
    name: 'Fahad Al-Subaie',
    trade: 'Carpenter',
    rating: 4.7,
    reviewsCount: 98,
    jobsCount: 142,
    trustScore: 88,
    status: 'online',
    joinedDate: 'Sep 2023',
    idNumber: 'CR-1004',
    responseTimeMin: 6,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: false,
      bankIban: true,
      backgroundCheck: true,
      insurance: false,
    },
    earnings30Days: 9150,
    earningsChangePct: -2.4,
    earningsSparkline: [12, 11, 13, 12, 14, 13, 15, 14, 16],
  },
  {
    id: '5',
    name: 'Yousef Al-Harbi',
    trade: 'Painter',
    rating: 4.9,
    reviewsCount: 156,
    jobsCount: 228,
    trustScore: 95,
    status: 'online',
    joinedDate: 'May 2022',
    idNumber: 'CR-1005',
    responseTimeMin: 3,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: true,
      bankIban: true,
      backgroundCheck: true,
      insurance: false,
    },
    earnings30Days: 11200,
    earningsChangePct: 4.8,
    earningsSparkline: [10, 12, 11, 14, 15, 13, 16, 18, 20],
  },
  {
    id: '6',
    name: 'Saif Al-Ghamdi',
    trade: 'Generator Specialist',
    rating: 4.8,
    reviewsCount: 143,
    jobsCount: 198,
    trustScore: 92,
    status: 'offline',
    joinedDate: 'Nov 2022',
    idNumber: 'CR-1006',
    responseTimeMin: 8,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: true,
      bankIban: true,
      backgroundCheck: false,
      insurance: false,
    },
    earnings30Days: 15300,
    earningsChangePct: 9.1,
    earningsSparkline: [18, 20, 19, 22, 21, 23, 22, 24, 26],
  },
  {
    id: '7',
    name: 'Bandar Al-Omari',
    trade: 'Plumber',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=80&q=80',
    rating: 4.6,
    reviewsCount: 67,
    jobsCount: 89,
    trustScore: 81,
    status: 'busy',
    joinedDate: 'Aug 2023',
    idNumber: 'CR-1007',
    responseTimeMin: 7,
    verifications: {
      nationalId: true,
      selfieMatch: true,
      tradeLicense: false,
      bankIban: true,
      backgroundCheck: true,
      insurance: true,
    },
    earnings30Days: 6800,
    earningsChangePct: 1.5,
    earningsSparkline: [8, 9, 7, 10, 11, 9, 12, 10, 11],
  },
  {
    id: '8',
    name: 'Hassan Al-Mutairi',
    trade: 'Painter',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=80&q=80',
    rating: 3.8,
    reviewsCount: 24,
    jobsCount: 31,
    trustScore: 62,
    status: 'flagged',
    joinedDate: 'Dec 2023',
    idNumber: 'CR-1008',
    responseTimeMin: 12,
    verifications: {
      nationalId: true,
      selfieMatch: false,
      tradeLicense: false,
      bankIban: true,
      backgroundCheck: false,
      insurance: false,
    },
    earnings30Days: 2400,
    earningsChangePct: -15.4,
    earningsSparkline: [5, 4, 6, 5, 4, 3, 4, 3, 2],
  },
];

import { useDependencies } from '../../../../core/di/DependencyProvider';
import { useEffect } from 'react';

import { useNavigation } from '../../../../presentation/context/NavigationContext';

export const useCraftsmen = () => {
  const { dependencies } = useDependencies();
  const { craftsmanRepository } = dependencies;
  const { searchQuery, setSearchQuery } = useNavigation();

  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');
  const [selectedId, setSelectedId] = useState<string>('');

  const fetchCraftsmen = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await craftsmanRepository.getCraftsmen();
      if (result.success) {
        setCraftsmen(result.data);
        if (result.data.length > 0) {
          setSelectedId(result.data[0].id);
        }
      } else {
        setError(result.error.message || 'Failed to fetch craftsmen.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch craftsmen.');
    } finally {
      setLoading(false);
    }
  }, [craftsmanRepository]);

  useEffect(() => {
    fetchCraftsmen();
  }, [fetchCraftsmen]);

  // Filter and search logic
  const filteredCraftsmen = useMemo(() => {
    return craftsmen.filter(craftsman => {
      // 1. Search filter
      const matchesSearch =
        craftsman.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        craftsman.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        craftsman.idNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Tab filter
      if (activeTab === 'verified') {
        return (
          craftsman.verifications.nationalId &&
          craftsman.verifications.selfieMatch &&
          craftsman.verifications.bankIban &&
          craftsman.status !== 'suspended'
        );
      }
      if (activeTab === 'pending') {
        const isVerified =
          craftsman.verifications.nationalId &&
          craftsman.verifications.selfieMatch &&
          craftsman.verifications.bankIban;
        return !isVerified && craftsman.status !== 'suspended';
      }
      if (activeTab === 'suspended') {
        return craftsman.status === 'suspended';
      }

      return true; // 'all'
    });
  }, [craftsmen, searchQuery, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => {
    let allCount = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let suspendedCount = 0;

    craftsmen.forEach(c => {
      allCount++;
      const isVerified =
        c.verifications.nationalId &&
        c.verifications.selfieMatch &&
        c.verifications.bankIban;

      if (c.status === 'suspended') {
        suspendedCount++;
      } else if (isVerified) {
        verifiedCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      all: allCount,
      verified: verifiedCount,
      pending: pendingCount,
      suspended: suspendedCount,
    };
  }, [craftsmen]);

  // Selected craftsman details
  const selectedCraftsman = useMemo(() => {
    return craftsmen.find(c => c.id === selectedId) || craftsmen[0] || null;
  }, [craftsmen, selectedId]);

  // Actions
  const suspendCraftsman = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await craftsmanRepository.suspendCraftsman(id);
      if (result.success) {
        setCraftsmen(prev =>
          prev.map(c => (c.id === id ? result.data : c))
        );
      } else {
        setError(result.error.message || 'Failed to suspend craftsman.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to suspend craftsman.');
    }
  }, [craftsmanRepository]);

  const banCraftsman = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await craftsmanRepository.banCraftsman(id);
      if (result.success) {
        setCraftsmen(prev =>
          prev.map(c => (c.id === id ? result.data : c))
        );
      } else {
        setError(result.error.message || 'Failed to ban craftsman.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to ban craftsman.');
    }
  }, [craftsmanRepository]);

  const flagCraftsman = useCallback(async (id: string) => {
    setCraftsmen(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'flagged' } : c))
    );
  }, []);

  const unflagCraftsman = useCallback(async (id: string) => {
    setCraftsmen(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'online' } : c))
    );
  }, []);

  const approveVerification = useCallback((_id: string, _key: keyof Craftsman['verifications']) => {
    setError('Feature not supported by the backend yet');
  }, []);

  return {
    craftsmen: filteredCraftsmen,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedId,
    setSelectedId,
    selectedCraftsman,
    tabCounts,
    suspendCraftsman,
    banCraftsman,
    flagCraftsman,
    unflagCraftsman,
    approveVerification,
    refresh: fetchCraftsmen,
  };
};
