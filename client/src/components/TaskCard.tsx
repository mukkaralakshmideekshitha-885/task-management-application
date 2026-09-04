import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isToday, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  User as UserIcon,
  Trash2,
  Edit2
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const priorityConfig: Record<TaskPriority, { label: string; bg: string; text: string; border: string; dot: string }> = {
  URGENT: { label: 'Urgent', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  HIGH: { label: 'High', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  MEDIUM: { label: 'Medium', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  LOW: { label: 'Low', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' }
};

export const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; nextStatus: TaskStatus | null; nextLabel: string }> = {
  TODO: { label: 'To Do', bg: 'bg-slate-100', text: 'text-slate-700', nextStatus: 'IN_PROGRESS', nextLabel: 'Start' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-50', text: 'text-amber-700', nextStatus: 'IN_REVIEW', nextLabel: 'Review' },
  IN_REVIEW: { label: 'In Review', bg: 'bg-purple-50', text: 'text-purple-700', nextStatus: 'COMPLETED', nextLabel: 'Complete' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', nextStatus: null, nextLabel: '' }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const { user } = useAuth();
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const status = statusConfig[task.status] || statusConfig.TODO;

  const canManage = user?.role === 'ADMIN' || task.creatorId === user?.id;

  // Due date status
  let dueDateInfo = null;
  if (task.dueDate) {
    const due = parseISO(task.dueDate);
    const overdue = isPast(due) && !isToday(due) && task.status !== 'COMPLETED';
    const dueToday = isToday(due) && task.status !== 'COMPLETED';

    dueDateInfo = {
      text: format(due, 'MMM d'),
      overdue,
      dueToday
    };
  }

  return (
    <div
      onClick={() => onSelect(task)}
      className="group relative bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between gap-3"
    >
      {/* Top row: Priority badge + Actions */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
          {priority.label}
        </span>

        {/* Quick action buttons on hover */}
        <div
          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(task)}
            title="Edit task"
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {canManage && (
            <button
              onClick={() => onDelete(task.id)}
              title="Delete task"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Description preview */}
      <div>
        <h4 className={`text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors ${
          task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
        }`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Bottom row: Due Date, Assignee, and Quick Status Next */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* Due date badge */}
        {dueDateInfo ? (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-[11px] ${
            dueDateInfo.overdue
              ? 'bg-rose-100 text-rose-700 font-bold'
              : dueDateInfo.dueToday
              ? 'bg-amber-100 text-amber-800 font-bold'
              : 'text-slate-500 bg-slate-50'
          }`}>
            {dueDateInfo.overdue ? (
              <AlertCircle className="w-3 h-3 text-rose-600" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>{dueDateInfo.text}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">No due date</span>
        )}

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Quick status progress button */}
          {status.nextStatus && (
            <button
              onClick={() => onStatusChange(task.id, status.nextStatus!)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-md transition-all active:scale-95"
              title={`Move to ${status.nextLabel}`}
            >
              <span>{status.nextLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Assignee Avatar */}
          {task.assignee ? (
            <img
              src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(task.assignee.name)}`}
              alt={task.assignee.name}
              title={`Assigned to ${task.assignee.name}`}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <span
              title="Unassigned"
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]"
            >
              <UserIcon className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
