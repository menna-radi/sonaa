import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../../../../domain/entities/Task';
import { PageHeader, Button, AlertBanner } from '../../../components/ui';
import { TasksKpis } from '../components/TasksKpis';
import { TasksTable } from '../components/TasksTable';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { TaskDetailDrawer } from '../components/TaskDetailDrawer';
import { SlidersHorizontal, Download, AlertTriangle } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const q = useTasks();

  // Bridge (T-F062): old table shape over the new server-driven hook; T-F063 rewrites this page.
  const tasks = q.rows;
  const loading = q.loading;
  const error = q.error ? q.error.message : null;
  const searchTerm = q.search;
  const setSearchTerm = q.setSearch;
  const activeFilter = q.filter;
  const setActiveFilter = q.setFilter;
  const metrics = {
    activeTasks: q.counts?.live ?? 0,
    emergency: q.counts?.emergency ?? 0,
    disputed: q.counts?.disputed ?? 0,
    frozen: q.counts?.frozen ?? 0,
    completedToday: q.counts?.done ?? 0,
  };
  const filterCounts = {
    all: q.counts?.all ?? 0,
    live: q.counts?.live ?? 0,
    emergency: q.counts?.emergency ?? 0,
    disputed: q.counts?.disputed ?? 0,
    completed: q.counts?.done ?? 0,
  };
  const handleFreeze = (id: string) => q.mutations.freeze.mutate(id);
  const handleUnfreeze = (id: string) => q.mutations.unfreeze.mutate(id);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Identify first active emergency task for the sticky emergency banner
  const emergencyTask = tasks.find((t) => t.isEmergency) ?? null;

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'TaskID,Title,Customer,Craftsman,Zone,AmountSAR,Status\n';
    tasks.forEach((t) => {
      csvContent += `"${t.displayId}","${t.title}","${t.customerName}","${t.craftsmanName ?? ''}","${t.address}","${t.amount}","${t.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sonaa_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="tasks-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-4)',
        width: '100%',
        minHeight: '100%',
        position: 'relative',
      }}
    >
      <PageHeader
        title="Tasks Operations"
        subtitle="Monitor live tasks, freeze suspicious activity, resolve disputes"
        actions={
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeading={<SlidersHorizontal size={14} />}
              onClick={() => {}}
            >
              Filters
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconLeading={<Download size={14} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        }
      />

      {error && (
        <AlertBanner
          title="Tasks Telemetry Error"
          body={error}
          icon={<AlertTriangle size={18} />}
        />
      )}

      {/* 5 KPI Metric Cards */}
      <TasksKpis metrics={metrics} loading={loading} />

      {/* Main Filtered Tasks Table */}
      <div style={{ flex: 1, minHeight: 400 }}>
        <TasksTable
          tasks={tasks}
          loading={loading}
          selectedTask={selectedTask}
          onSelectTask={handleSelectTask}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filterCounts={filterCounts}
          onFreeze={handleFreeze}
          onUnfreeze={handleUnfreeze}
        />
      </div>

      {/* Sticky Emergency Banner if an emergency is active */}
      {emergencyTask && (
        <EmergencyBanner emergencyTask={emergencyTask} />
      )}

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFreeze={handleFreeze}
        onUnfreeze={handleUnfreeze}
      />
    </div>
  );
};

export default TasksPage;
