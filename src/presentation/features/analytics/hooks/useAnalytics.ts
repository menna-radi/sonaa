import { useState, useEffect, useCallback } from 'react';

export interface MetricCardState {
  value: string;
  change: string;
  isPositive: boolean;
  rawVal: number;
}

export interface CohortWeekData {
  week: string;
  newUsers: number;
  returningUsers: number;
}

export interface ZoneData {
  name: string;
  tasksCount: number;
  percentage: number;
  trend: string;
  isPositive: boolean;
  barWidth: number;
}

export interface KpiData {
  id: string;
  nameKey: string;
  value: number;
  unit: string;
  statusKey: string;
  isOnTrack: boolean;
  barWidth: number;
  targetWidth?: number;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Metric Cards
  const [userGrowth, setUserGrowth] = useState<MetricCardState>({ value: '+12.4K', change: '+18.9%', isPositive: true, rawVal: 12420 });
  const [activeCraftsmen, setActiveCraftsmen] = useState<MetricCardState>({ value: '6,847', change: '+8.2%', isPositive: true, rawVal: 6847 });
  const [marketplaceActivity, setMarketplaceActivity] = useState<MetricCardState>({ value: '14.2K', change: '+22%', isPositive: true, rawVal: 14200 });
  const [conversionRate, setConversionRate] = useState<MetricCardState>({ value: '34.8%', change: '+1.4pt', isPositive: true, rawVal: 34.8 });

  // 2. Cohort Data
  const [cohorts] = useState<CohortWeekData[]>([
    { week: 'W1', newUsers: 36.36, returningUsers: 112.05 },
    { week: 'W2', newUsers: 41.36, returningUsers: 120.84 },
    { week: 'W3', newUsers: 46.34, returningUsers: 125.53 },
    { week: 'W4', newUsers: 47.80, returningUsers: 124.20 },
    { week: 'W5', newUsers: 47.22, returningUsers: 124.78 },
    { week: 'W6', newUsers: 48.48, returningUsers: 123.52 },
    { week: 'W7', newUsers: 50.53, returningUsers: 121.47 }
  ]);

  // 3. High Demand Zones
  const [zones, setZones] = useState<ZoneData[]>([
    { name: 'Beit Hanina (بيت حنينا)', tasksCount: 412, percentage: 28, trend: '+28%', isPositive: true, barWidth: 92 },
    { name: 'Old City (البلدة القديمة)', tasksCount: 358, percentage: 21, trend: '+21%', isPositive: true, barWidth: 84 },
    { name: 'Shuafat (شعفاط)', tasksCount: 287, percentage: 18, trend: '+18%', isPositive: true, barWidth: 71 },
    { name: 'Sheikh Jarrah (الشيخ جراح)', tasksCount: 242, percentage: 14, trend: '+14%', isPositive: true, barWidth: 62 },
    { name: 'Silwan (سلوان)', tasksCount: 198, percentage: 9, trend: '+9%', isPositive: true, barWidth: 54 },
    { name: 'Rehavia (رحافيا)', tasksCount: 174, percentage: 6, trend: '+6%', isPositive: true, barWidth: 48 }
  ]);

  // 4. Platform Health KPIs
  const [kpis, setKpis] = useState<KpiData[]>([
    { id: 'match_rate', nameKey: 'analytics_match_rate', value: 87.4, unit: '%', statusKey: 'analytics_below_target', isOnTrack: false, barWidth: 87.4, targetWidth: 90 },
    { id: 'eta_accuracy', nameKey: 'analytics_avg_eta_accuracy', value: 92.8, unit: '%', statusKey: 'analytics_below_target', isOnTrack: false, barWidth: 92.8, targetWidth: 95 },
    { id: 'cust_sat', nameKey: 'analytics_customer_satisfaction', value: 4.7, unit: '/ 5', statusKey: 'analytics_on_track', isOnTrack: true, barWidth: 94 },
    { id: 'craftsman_util', nameKey: 'analytics_craftsman_utilization', value: 68.2, unit: '%', statusKey: 'analytics_below_target', isOnTrack: false, barWidth: 68.2, targetWidth: 75 },
    { id: 'dispute_rate', nameKey: 'analytics_dispute_rate', value: 0.8, unit: '%', statusKey: 'analytics_on_track', isOnTrack: true, barWidth: 53.3, targetWidth: 100 }, // Scaled relative to target of 1.5%
    { id: 'refund_rate', nameKey: 'analytics_refund_rate', value: 1.2, unit: '%', statusKey: 'analytics_on_track', isOnTrack: true, barWidth: 60.0, targetWidth: 100 }  // Scaled relative to target of 2.0%
  ]);

  const loadData = useCallback((showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    setError(null);
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Simulate real-time streaming telemetry updates for visual excitement
  useEffect(() => {
    if (loading || error) return;

    const timer = setInterval(() => {
      // 1. Randomly update a metric card
      const randMetric = Math.floor(Math.random() * 4);
      if (randMetric === 0) {
        setUserGrowth(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const newVal = Math.max(1000, prev.rawVal + delta);
          return {
            ...prev,
            rawVal: newVal,
            value: `+${(newVal / 1000).toFixed(1)}K`
          };
        });
      } else if (randMetric === 1) {
        setActiveCraftsmen(prev => {
          const delta = Math.floor(Math.random() * 3) - 1;
          const newVal = Math.max(100, prev.rawVal + delta);
          return {
            ...prev,
            rawVal: newVal,
            value: newVal.toLocaleString()
          };
        });
      } else if (randMetric === 2) {
        setMarketplaceActivity(prev => {
          const delta = Math.floor(Math.random() * 9) - 4;
          const newVal = Math.max(1000, prev.rawVal + delta);
          return {
            ...prev,
            rawVal: newVal,
            value: `${(newVal / 1000).toFixed(1)}K`
          };
        });
      } else if (randMetric === 3) {
        setConversionRate(prev => {
          const delta = (Math.random() * 0.4 - 0.2);
          const newVal = Math.max(10, Math.min(99, prev.rawVal + delta));
          return {
            ...prev,
            rawVal: newVal,
            value: `${newVal.toFixed(1)}%`
          };
        });
      }

      // 2. Randomly update Riyadh districts task count
      setZones(prev => {
        const randIndex = Math.floor(Math.random() * prev.length);
        return prev.map((z, idx) => {
          if (idx === randIndex) {
            const delta = Math.floor(Math.random() * 3) - 1;
            const newTasks = Math.max(10, z.tasksCount + delta);
            return {
              ...z,
              tasksCount: newTasks
            };
          }
          return z;
        });
      });

      // 3. Randomly update platform health KPIs slightly
      setKpis(prev => {
        const randIndex = Math.floor(Math.random() * prev.length);
        return prev.map((kpi, idx) => {
          if (idx === randIndex) {
            let newVal = kpi.value;
            let barWidth = kpi.barWidth;

            if (kpi.id === 'match_rate') {
              newVal = Math.max(70, Math.min(100, kpi.value + (Math.random() * 0.4 - 0.2)));
              barWidth = newVal;
            } else if (kpi.id === 'eta_accuracy') {
              newVal = Math.max(80, Math.min(100, kpi.value + (Math.random() * 0.2 - 0.1)));
              barWidth = newVal;
            } else if (kpi.id === 'cust_sat') {
              newVal = Math.max(3.5, Math.min(5.0, kpi.value + (Math.random() * 0.04 - 0.02)));
              barWidth = (newVal / 5) * 100;
            } else if (kpi.id === 'craftsman_util') {
              newVal = Math.max(40, Math.min(95, kpi.value + (Math.random() * 0.6 - 0.3)));
              barWidth = newVal;
            } else if (kpi.id === 'dispute_rate') {
              newVal = Math.max(0.1, Math.min(5.0, kpi.value + (Math.random() * 0.1 - 0.05)));
              barWidth = (newVal / 1.5) * 100; // Target is 1.5%
            } else if (kpi.id === 'refund_rate') {
              newVal = Math.max(0.1, Math.min(5.0, kpi.value + (Math.random() * 0.1 - 0.05)));
              barWidth = (newVal / 2.0) * 100; // Target is 2.0%
            }

            const isOnTrack = kpi.id === 'dispute_rate' || kpi.id === 'refund_rate' 
              ? newVal <= (kpi.id === 'dispute_rate' ? 1.5 : 2.0)
              : newVal >= (kpi.id === 'cust_sat' ? 4.5 : (kpi.id === 'match_rate' ? 90 : (kpi.id === 'eta_accuracy' ? 95 : 75)));

            const statusKey = isOnTrack ? 'analytics_on_track' : 'analytics_below_target';

            return {
              ...kpi,
              value: Number(newVal.toFixed(kpi.id === 'cust_sat' ? 1 : 1)),
              barWidth,
              isOnTrack,
              statusKey
            };
          }
          return kpi;
        });
      });

    }, 4500);

    return () => clearInterval(timer);
  }, [loading, error]);

  return {
    loading,
    error,
    userGrowth,
    activeCraftsmen,
    marketplaceActivity,
    conversionRate,
    cohorts,
    zones,
    kpis,
    refresh: () => loadData(true)
  };
};

export default useAnalytics;
