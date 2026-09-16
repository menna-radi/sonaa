import { useState, useMemo, useCallback } from 'react';
import type { Craftsman } from '../../../../domain/entities/Craftsman';
export type { Craftsman };

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
        const isVerified =
          craftsman.verifications.nationalId ||
          (craftsman.verifications.selfieMatch && craftsman.verifications.bankIban);
        return isVerified && craftsman.status !== 'suspended';
      }
      if (activeTab === 'pending') {
        const isVerified =
          craftsman.verifications.nationalId ||
          (craftsman.verifications.selfieMatch && craftsman.verifications.bankIban);
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
        c.verifications.nationalId ||
        (c.verifications.selfieMatch && c.verifications.bankIban);

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
  const suspendCraftsman = useCallback(async (id: string, reason?: string) => {
    setError(null);
    try {
      const result = await craftsmanRepository.suspendCraftsman(id, reason);
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

  const unsuspendCraftsman = useCallback(async (id: string) => {
    setError(null);
    try {
      const result = await craftsmanRepository.unsuspendCraftsman(id);
      if (result.success) {
        setCraftsmen(prev =>
          prev.map(c => (c.id === id ? result.data : c))
        );
      } else {
        setError(result.error.message || 'Failed to unsuspend craftsman.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to unsuspend craftsman.');
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

  const approveVerification = useCallback(async (id: string, key: keyof Craftsman['verifications'], approved: boolean = true) => {
    setError(null);
    try {
      const result = await craftsmanRepository.toggleVerificationItem(id, key, approved);
      if (result.success) {
        setCraftsmen(prev =>
          prev.map(c => (c.id === id ? result.data : c))
        );
      } else {
        setError(result.error.message || 'Failed to update verification item.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update verification item.');
    }
  }, [craftsmanRepository]);

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
    unsuspendCraftsman,
    banCraftsman,
    flagCraftsman,
    unflagCraftsman,
    approveVerification,
    refresh: fetchCraftsmen,
  };
};
