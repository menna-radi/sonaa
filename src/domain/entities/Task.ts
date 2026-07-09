export type TaskStatus = 'in_progress' | 'emergency' | 'disputed' | 'frozen' | 'completed';

export interface Task {
  id: string;
  title: string;
  jobNumber: string;
  customer: string;
  craftsman: string;
  zone: string;
  amountSAR: number;
  eta: string;
  status: TaskStatus;
}
