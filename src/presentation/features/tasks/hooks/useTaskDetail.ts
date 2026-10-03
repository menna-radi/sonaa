import { useQuery } from '@tanstack/react-query';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';

export const useTaskDetail = (id: string | null | undefined) => {
  const { dependencies } = useDependencies();
  return useQuery({
    queryKey: queryKeys.tasks.detail(id ?? ''),
    queryFn: () => dependencies.taskRepository.getTask(id as string).then(unwrap),
    staleTime: 30000,
    enabled: !!id,
  });
};

export default useTaskDetail;
