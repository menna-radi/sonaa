export type MetricStatus = 'normal' | 'warning' | 'danger';

export interface Metric {
  id: string;
  nameKey: string;
  value: number;
  unit: string;
  status: MetricStatus;
  history: number[];
  /** Live online count backing the craftsmen card caption (from overview-stats). */
  onlineCount?: number;
}
