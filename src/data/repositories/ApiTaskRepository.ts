import { TaskRepository } from '../../domain/repositories/TaskRepository';
import { Task } from '../../domain/entities/Task';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { TaskMapper } from '../mappers/TaskMapper';
import { TaskDTO } from '../dto/TaskDTO';
import { AppError, UnknownError } from '../../core/errors/AppError';

interface PaginatedTasksResponse {
  tasks?: any[];
  items?: any[];
  pagination?: any;
  total?: number;
  page?: number;
  limit?: number;
}

export class ApiTaskRepository implements TaskRepository {
  private mapBackendTaskToDomain(item: any): Task {
    let status: Task['status'] = 'in_progress';
    if (item.status === 'COMPLETED') {
      status = 'completed';
    } else if (item.status === 'DISPUTED') {
      status = 'disputed';
    } else if (item.status === 'FROZEN' || item.status === 'CANCELLED') {
      status = 'frozen';
    } else if (
      (item.emergencyRequest && item.emergencyRequest.status === 'ACTIVE') ||
      item.serviceType === 'EMERGENCY' ||
      (item.title && item.title.toLowerCase().startsWith('emergency') && item.status !== 'COMPLETED')
    ) {
      status = 'emergency';
    }

    const customerName = item.customerProfile 
      ? `${item.customerProfile.firstName} ${item.customerProfile.lastName}`
      : 'Unknown Customer';
    const craftsmanName = item.craftsmanProfile
      ? `${item.craftsmanProfile.firstName} ${item.craftsmanProfile.lastName}`
      : 'Unassigned';

    return {
      id: item.id,
      title: item.title,
      jobNumber: item.displayId || `#SN-${item.id.substring(0, 4)}`,
      customer: customerName,
      craftsman: craftsmanName,
      zone: item.locationAddress || 'Riyadh',
      amountSAR: Number(item.budgetAmount || 0),
      eta: item.acceptedAt ? 'Scheduled' : 'Pending',
      status,
    };
  }

  public async getTasks(): Promise<Result<Task[]>> {
    try {
      const response = await apiClient.get<PaginatedTasksResponse>(API_ENDPOINTS.tasks.list);
      const rawList = response.tasks || response.items || (Array.isArray(response) ? response : []);
      const domainTasks = rawList.map(item => this.mapBackendTaskToDomain(item));
      return ok(domainTasks);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async freezeTask(id: string): Promise<Result<Task>> {
    try {
      const response = await apiClient.post<{ id: string; task_status: string }>(
        API_ENDPOINTS.tasks.freeze(id)
      );
      
      const tasksResult = await this.getTasks();
      if (tasksResult.success) {
        const found = tasksResult.data.find(t => t.id === id);
        if (found) {
          return ok(found);
        }
      }
      
      const fallbackTask: Task = {
        id: response.id,
        title: 'Task',
        jobNumber: `#SN-${response.id.substring(0, 4)}`,
        customer: 'Customer',
        craftsman: 'Craftsman',
        zone: 'Riyadh',
        amountSAR: 0,
        eta: '—',
        status: response.task_status.toLowerCase() as any,
      };
      return ok(fallbackTask);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async unfreezeTask(id: string): Promise<Result<Task>> {
    try {
      const response = await apiClient.post<{ id: string; task_status: string }>(
        API_ENDPOINTS.tasks.unfreeze(id)
      );
      
      const tasksResult = await this.getTasks();
      if (tasksResult.success) {
        const found = tasksResult.data.find(t => t.id === id);
        if (found) {
          return ok(found);
        }
      }
      
      const fallbackTask: Task = {
        id: response.id,
        title: 'Task',
        jobNumber: `#SN-${response.id.substring(0, 4)}`,
        customer: 'Customer',
        craftsman: 'Craftsman',
        zone: 'Riyadh',
        amountSAR: 0,
        eta: '—',
        status: response.task_status.toLowerCase() as any,
      };
      return ok(fallbackTask);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiTaskRepository;
