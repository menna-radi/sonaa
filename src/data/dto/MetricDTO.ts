export interface MetricDTO {
  id: string;
  name_key: string;
  current_value: number;
  value_unit: string;
  historical_data: number[];
}
