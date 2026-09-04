import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { priorityConfig, statusConfig } from './TaskCard';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { AlertCircle, Calendar, Edit2, Trash2, User as UserIcon } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  const { user } = useAuth();

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-500 font-medium">No tasks found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Task</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
              const canManage = user?.role === 'ADMIN' || task.creatorId === user?.id;

              let dueDateText = '—';
              let isOverdue = false;
              if (task.dueDate) {
                const due = parseISO(task.dueDate);
                isOverdue = isPast(due) && !isToday(due) && task.status !== 'COMPLETED';
                dueDateText = format(due, 'MMM dd, yyyy');
              }

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Title & Description */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <p className={`font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors ${
                      task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                    }`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs font-semibold py-1 px-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">Under Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                      {priority.label}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                      isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                    }`}>
                      {isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <Calendar className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{dueDateText}</span>
                    </div>
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(task.assignee.name)}`}
                          alt={task.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="Delete task"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
