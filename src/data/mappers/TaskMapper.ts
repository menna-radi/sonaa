import { TaskDTO } from '../dto/TaskDTO';
import { Task } from '../../domain/entities/Task';

export class TaskMapper {
  public static toDomain(dto: TaskDTO): Task {
    return {
      id: dto.id,
      title: dto.title,
      jobNumber: dto.job_number,
      customer: dto.customer_name,
      craftsman: dto.craftsman_name,
      zone: dto.location_zone,
      amountSAR: dto.amount_sar,
      eta: dto.estimated_arrival,
      status: dto.task_status,
    };
  }

  public static toDTO(entity: Task): TaskDTO {
    return {
      id: entity.id,
      title: entity.title,
      job_number: entity.jobNumber,
      customer_name: entity.customer,
      craftsman_name: entity.craftsman,
      location_zone: entity.zone,
      amount_sar: entity.amountSAR,
      estimated_arrival: entity.eta,
      task_status: entity.status,
    };
  }
}
export default TaskMapper;
