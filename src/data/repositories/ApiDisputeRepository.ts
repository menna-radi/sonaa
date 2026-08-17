import { DisputeRepository, Dispute } from '../../domain/repositories/DisputeRepository';
import { Result, ok, fail } from '../../core/result/Result';
import { apiClient } from '../../core/network/apiClient';
import { API_ENDPOINTS } from '../../core/config/apiEndpoints';
import { AppError } from '../../core/errors/AppError';

interface ApiDisputeDTO {
  id: string;
  taskId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  description?: string;
  task?: {
    title: string;
    amountSar: number;
    customer?: {
      firstName: string;
      lastName: string;
    };
    craftsman?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface PaginatedDisputesResponse {
  results: ApiDisputeDTO[];
  totalResults: number;
}

export class ApiDisputeRepository implements DisputeRepository {
  public async getDisputes(): Promise<Result<Dispute[]>> {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.admin.disputes);
      
      const mapped: Dispute[] = (response.items || []).map((d: any) => {
        const customerObj = d.task?.customerProfile || d.task?.customer;
        const craftsmanObj = d.task?.craftsmanProfile || d.task?.craftsman;
        const customerName = customerObj 
          ? `${customerObj.firstName} ${customerObj.lastName}`.trim()
          : 'Customer';
        const craftsmanName = craftsmanObj
          ? `${craftsmanObj.firstName} ${craftsmanObj.lastName}`.trim()
          : 'Craftsman';
          
        return {
          id: d.id,
          jobId: d.task?.displayId || `#JOB-${d.taskId.substring(0, 4)}`,
          customerName,
          craftsmanName,
          amount: Number(d.task?.budgetAmount || d.task?.amountSar || 0),
          reason: d.reason,
          status: d.status,
          createdAt: new Date(d.createdAt).toLocaleDateString(),
          description: d.description || d.reason,
        };
      });

      return ok(mapped);
    } catch (error) {
      return fail(error as AppError);
    }
  }

  public async resolveDispute(
    id: string,
    resolution: 'refund_customer' | 'pay_craftsman' | 'split_split',
    notes: string
  ): Promise<Result<boolean>> {
    try {
      const resolutionMap: Record<string, string> = {
        refund_customer: 'REFUND_CLIENT',
        pay_craftsman: 'PAY_CRAFTSMAN',
        split_split: 'SPLIT_PAYMENT',
      };
      await apiClient.post<void>(API_ENDPOINTS.admin.resolveDispute(id), {
        resolution: resolutionMap[resolution] || 'REFUND_CLIENT',
        notes,
      });
      return ok(true);
    } catch (error) {
      return fail(error as AppError);
    }
  }
}
export default ApiDisputeRepository;
