export type MetricStatus = 'normal' | 'warning' | 'danger';

export interface Metric {
  id: string;
  nameKey: string;
  value: number;
  unit: string;
  status: MetricStatus;
  history: number[];
}
