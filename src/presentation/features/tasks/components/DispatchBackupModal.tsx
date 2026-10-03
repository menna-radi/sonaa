import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../../context/LanguageContext';
import { FormModal } from '../../../components/ui/FormModal';
import { SearchInput, EmptyState } from '../../../components/ui';
import { useDependencies } from '../../../../core/di/DependencyProvider';
import { queryKeys } from '../../../../core/query/queryKeys';
import { unwrap } from '../../../../core/query/unwrap';
import type { Task } from '../../../../domain/entities/Task';
import { useTasks } from '../hooks/useTasks';

interface DispatchBackupModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DispatchBackupModal: React.FC<DispatchBackupModalProps> = ({ task, isOpen, onClose }) => {
  const { t } = useLanguage();
  const { dependencies } = useDependencies();
  const { mutations } = useTasks();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  // Reset form state whenever the modal closes (render-time reset pattern).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) {
      setSearch('');
      setDebounced('');
      setSelected(null);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search ]);

  const craftsmenQ = useQuery({
    queryKey: queryKeys.craftsmen.list({ q: debounced }),
    queryFn: () =>
      dependencies.craftsmanRepository
        .getCraftsmen({ q: debounced || undefined, status: 'all', page: 1, limit: 10 })
        .then(unwrap),
    staleTime: 30000,
    enabled: isOpen,
  });

  const submit = () => {
    if (!task || !selected) return;
    mutations.dispatchBackup.mutate(
      { id: task.id, craftsmanProfileId: selected },
      { onSuccess: onClose }
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('tasks_dispatch_title')}
      onSubmit={submit}
      submitLabel={t('tasks_dispatch')}
      pending={mutations.dispatchBackup.isPending}
      submitDisabled={!selected}
    >
      <div className="ui-stack">
        <SearchInput value={search} onChange={setSearch} placeholder={t('craftsmen_search_ph')} />
        {craftsmenQ.isLoading ? (
          <span className="ui-caption">{t('status_loading')}</span>
        ) : (craftsmenQ.data?.items ?? []).length === 0 ? (
          <EmptyState title={t('empty_craftsmen')} />
        ) : (
          <div className="ui-stack ui-stack--tight" role="listbox" aria-label={t('tasks_dispatch_title')}>
            {(craftsmenQ.data?.items ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={selected === c.id}
                className={`dispatch-option${selected === c.id ? ' is-selected' : ''}`}
                onClick={() => setSelected(selected === c.id ? null : c.id)}
              >
                <span className="ui-text-strong">{c.name}</span>
                <span className="ui-caption">{c.trade}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default DispatchBackupModal;
