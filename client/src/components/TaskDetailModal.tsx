import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { api } from '../services/api';
import { priorityConfig, statusConfig } from './TaskCard';
import { format, parseISO, formatDistanceToNow, isPast, isToday } from 'date-fns';
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  Edit2,
  Trash2,
  History,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const { task } = await api.getTaskById(taskId);
        setTask(task);
      } catch (err) {
        console.error('Failed to load task details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [taskId]);

  if (!taskId) return null;

  const canManage = user?.role === 'ADMIN' || (task && task.creatorId === user?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in duration-150">
        
        {loading || !task ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading task details...</p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                  priorityConfig[task.priority]?.bg
                } ${priorityConfig[task.priority]?.text} ${priorityConfig[task.priority]?.border}`}>
                  {priorityConfig[task.priority]?.label}
                </span>

                <select
                  value={task.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as TaskStatus;
                    onStatusChange(task.id, newStatus);
                    setTask({ ...task, status: newStatus });
                  }}
                  className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">Under Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(task);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {canManage && (
                  <button
                    onClick={() => {
                      onClose();
                      onDelete(task.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {task.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Created {formatDistanceToNow(parseISO(task.createdAt), { addSuffix: true })} by {task.creator?.name}
                </p>
              </div>

              {/* Description */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {task.description || <span className="italic text-slate-400">No description provided.</span>}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
                  <span className="text-slate-400 block font-medium mb-1">Due Date</span>
                  {task.dueDate ? (
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>{format(parseISO(task.dueDate), 'MMMM d, yyyy')}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None set</span>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-slate-200/80 bg-white">
                  <span className="text-slate-400 block font-medium mb-1">Assignee</span>
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(task.assignee.name)}`}
                        alt={task.assignee.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-800">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              </div>

              {/* Activity Log / History */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Activity History</h4>
                </div>

                {task.activities && task.activities.length > 0 ? (
                  <div className="space-y-3">
                    {task.activities.map((act) => (
                      <div key={act.id} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-slate-700">
                            <span className="font-bold text-slate-900">{act.user?.name}</span>{' '}
                            <span className="text-slate-600">{act.details || act.action}</span>
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {formatDistanceToNow(parseISO(act.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};
