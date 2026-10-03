import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { AlertBanner, Button } from '../../../components/ui';
import { formatRelativeTime } from '../../../../core/utils/format';
import type { Task } from '../../../../domain/entities/Task';
import { AlertTriangle } from 'lucide-react';

interface EmergencyBannerProps {
  task: Task | null;
  onOpen: (task: Task) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ task, onOpen }) => {
  const { t, language } = useLanguage();
  if (!task) return null;

  return (
    <AlertBanner
      tone="danger"
      icon={<AlertTriangle size={20} />}
      title={t('tasks_emergency_title')}
      body={`${task.displayId} · ${task.title} · ${task.customerName}${
        task.createdAt ? ` · ${formatRelativeTime(task.createdAt, language)}` : ''
      }`}
      actions={
        <Button size="sm" variant="outline" onClick={() => onOpen(task)}>
          {t('tasks_emergency_open')}
        </Button>
      }
    />
  );
};

export default EmergencyBanner;
