import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Circle, Clock, CheckCircle2, Eye, Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateWithStatus: (status: TaskStatus) => void;
}

interface ColumnDefinition {
  status: TaskStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
}

const COLUMNS: ColumnDefinition[] = [
  { status: 'TODO', label: 'To Do', icon: Circle, color: 'border-t-slate-400', badgeBg: 'bg-slate-100 text-slate-700' },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'border-t-amber-500', badgeBg: 'bg-amber-100 text-amber-800' },
  { status: 'IN_REVIEW', label: 'In Review', icon: Eye, color: 'border-t-purple-500', badgeBg: 'bg-purple-100 text-purple-800' },
  { status: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'border-t-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-800' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onOpenCreateWithStatus
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start overflow-x-auto pb-6">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        const IconComponent = col.icon;
        const isTarget = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col bg-slate-100/70 border-t-4 ${col.color} rounded-xl p-3.5 transition-all duration-150 min-h-[500px] ${
              isTarget ? 'bg-indigo-50/70 ring-2 ring-indigo-400 ring-dashed' : 'border border-slate-200/70'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3.5 px-1">
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-800">{col.label}</h3>
                <span className={`px-2 py-0.5 text-xs font-extrabold rounded-full ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenCreateWithStatus(col.status)}
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                title={`Add task to ${col.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task list container */}
            <div className="flex flex-col gap-3 flex-1">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="active:cursor-grabbing cursor-grab"
                >
                  <TaskCard
                    task={task}
                    onSelect={onSelectTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={onStatusChange}
                  />
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-400 font-medium">No tasks in this column</p>
                  <button
                    onClick={() => onOpenCreateWithStatus(col.status)}
                    className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    + Add a task
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
