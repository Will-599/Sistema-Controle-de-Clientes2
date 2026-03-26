import { useState, useMemo } from 'react';
import { Task } from '../types';

export const KANBAN_COLUMNS = [
  'Aguardando início',
  'Em andamento',
  'Em revisão',
  'Concluído',
  'Cancelado'
];

export function useKanban(tasks: Task[], updateTaskStatus: (id: string, status: string) => Promise<void>) {
  const [filterQuery, setFilterQuery] = useState('');
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = filterQuery.toLowerCase();
      return (
        task.serviceName.toLowerCase().includes(q) ||
        (task.clientName && task.clientName.toLowerCase().includes(q)) ||
        (task.professionalName && task.professionalName.toLowerCase().includes(q))
      );
    });
  }, [tasks, filterQuery]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    // active.id is the taskId, over.id is the column id (status string)
    const taskId = active.id as string;
    let newStatus = over.id as string;

    // If dropped over another card instead of a column directly
    if (!KANBAN_COLUMNS.includes(newStatus)) {
        const targetTask = tasks.find(t => t.id === newStatus);
        if (targetTask) {
            newStatus = targetTask.status;
        } else {
            return;
        }
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status !== newStatus) {
      // Optmistic update on UI handled effectively via prop updateTaskStatus triggering a re-fetch
      await updateTaskStatus(taskId, newStatus);
    }
  };

  return { filterQuery, setFilterQuery, filteredTasks, handleDragEnd };
}
