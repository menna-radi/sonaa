import { MetricDTO } from '../dto/MetricDTO';
import { Metric, MetricStatus } from '../../domain/entities/Metric';

export class MetricMapper {
  public static calculateStatus(nameKey: string, value: number): MetricStatus {
    if (nameKey === 'metrics_cpu' || nameKey === 'metrics_memory') {
      if (value >= 85) return 'danger';
      if (value >= 70) return 'warning';
      return 'normal';
    }
    
    if (nameKey === 'metrics_network') {
      if (value >= 900) return 'warning';
      if (value >= 980) return 'danger';
      return 'normal';
    }

    return 'normal';
  }

  public static toDomain(dto: MetricDTO): Metric {
    return {
      id: dto.id,
      nameKey: dto.name_key,
      value: dto.current_value,
      unit: dto.value_unit,
      history: dto.historical_data && dto.historical_data.length > 0 ? dto.historical_data : [dto.current_value],
      status: this.calculateStatus(dto.name_key, dto.current_value),
    };
  }

  public static toDTO(entity: Metric): MetricDTO {
    return {
      id: entity.id,
      name_key: entity.nameKey,
      current_value: entity.value,
      value_unit: entity.unit,
      historical_data: entity.history,
    };
  }
}
export default MetricMapper;
