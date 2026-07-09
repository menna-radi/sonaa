export interface TaskDTO {
  id: string;
  title: string;
  job_number: string;
  customer_name: string;
  craftsman_name: string;
  location_zone: string;
  amount_sar: number;
  estimated_arrival: string;
  task_status: 'in_progress' | 'emergency' | 'disputed' | 'frozen' | 'completed';
}
