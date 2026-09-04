import React from 'react';
import { TaskStats } from '../types';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface StatsOverviewProps {
  stats: TaskStats | null;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  if (!stats) return null;

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Tasks */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress + stats.inReview}</p>
            <span className="text-xs text-slate-400">({stats.inReview} in review)</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              <span className="text-xs font-semibold text-emerald-600">{completionRate}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Overdue */}
      <div className={`p-4 rounded-xl border shadow-xs flex items-center justify-between ${
        stats.overdue > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200/80'
      }`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
            Overdue Tasks
          </p>
          <p className={`text-2xl font-bold mt-1 ${stats.overdue > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {stats.overdue}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          stats.overdue > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
