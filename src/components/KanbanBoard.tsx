import React, { useMemo, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { useKanban, KANBAN_COLUMNS } from '../hooks/useKanban';
import { Clock, CheckCircle2, AlertCircle, AlertOctagon, MoreVertical, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const PRIORITY_COLORS = {
  baixa: 'bg-slate-100 text-slate-600 border-slate-200',
  média: 'bg-blue-100 text-blue-700 border-blue-200',
  alta: 'bg-amber-100 text-amber-700 border-amber-200',
  urgente: 'bg-red-100 text-red-700 border-red-200'
};

function getDeadlineStatus(dateTarget: string): 'ok' | 'warning' | 'late' {
  const target = new Date(dateTarget);
  target.setHours(23, 59, 59, 999);
  const now = new Date();
  
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'late';
  if (diffDays <= 2) return 'warning';
  return 'ok';
}

function ServiceCard({ task, onClick }: { task: Task, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColor = PRIORITY_COLORS[task.priority || 'média'];
  const deadline = getDeadlineStatus(task.date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing mb-3 group ${isDragging ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 dark:border-slate-800'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityColor}`}>
          {task.priority || 'média'}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 -m-1">
          <MoreVertical size={16} />
        </button>
      </div>

      <h5 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">{task.serviceName}</h5>
      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-3 truncate">{task.clientName}</p>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-1.5" title="Data de entrega">
          {deadline === 'late' && task.status !== 'Concluído' ? (
            <AlertOctagon size={14} className="text-red-500" />
          ) : deadline === 'warning' && task.status !== 'Concluído' ? (
            <AlertCircle size={14} className="text-amber-500" />
          ) : (
            <Calendar size={14} className="text-slate-400" />
          )}
          <span className={deadline === 'late' && task.status !== 'Concluído' ? 'text-red-600 font-bold' : deadline === 'warning' && task.status !== 'Concluído' ? 'text-amber-600 font-bold' : ''}>
            {task.date}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
          <span className="truncate max-w-[80px]">{task.professionalName?.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ id, title, tasks, onTaskClick }: { id: string, title: string, tasks: Task[], onTaskClick: (task: Task) => void }) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl p-4 flex flex-col h-full border border-slate-200 dark:border-slate-800 min-w-[300px] w-[300px]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
        <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full shadow-sm">
          {tasks.length}
        </span>
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[150px] p-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <ServiceCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, updateTaskStatus, onTaskClick }: { tasks: Task[], updateTaskStatus: (id: string, status: string) => Promise<void>, onTaskClick: (task: Task) => void }) {
  const { filterQuery, setFilterQuery, filteredTasks, handleDragEnd } = useKanban(tasks, updateTaskStatus);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const getColTasks = (col: string) => {
    // Legacy mapping support mapping
    return filteredTasks.filter(t => 
      t.status === col || 
      (col === 'Aguardando início' && t.status === 'Pendente') ||
      (col === 'Em andamento' && t.status === 'EmProgresso') ||
      (col === 'Concluído' && t.status === 'Concluido')
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <input 
          type="text" 
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filtrar serviços por título, cliente ou responsável..." 
          className="w-full max-w-md px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-300 transition-all"
        />
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners} 
            onDragStart={(e) => {
              const task = tasks.find(t => t.id === e.active.id);
              if (task) setActiveTask(task);
            }} 
            onDragEnd={(e) => {
               handleDragEnd(e);
               setActiveTask(null);
            }}
          >
            {KANBAN_COLUMNS.map(col => (
              <KanbanColumn 
                key={col} 
                id={col} 
                title={col} 
                tasks={getColTasks(col)} 
                onTaskClick={onTaskClick}
              />
            ))}
            <DragOverlay>
              {activeTask ? <ServiceCard task={activeTask} onClick={() => {}} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
