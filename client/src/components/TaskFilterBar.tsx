import React from 'react';
import { TaskFilterOptions, User } from '../types';
import { Search, SlidersHorizontal, Kanban, List, X } from 'lucide-react';

interface TaskFilterBarProps {
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  users: User[];
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  setFilters,
  users,
  viewMode,
  setViewMode
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 space-y-4">
      {/* Top row: Search, Filter Tabs, and View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, keywords..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-hidden transition-colors"
          />
          {filters.search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Ownership quick tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600 self-start md:self-auto">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filter: 'all' }))}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filters.filter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, filter: 'assigned_to_me' }))}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filters.filter === 'assigned_to_me'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Assigned to Me
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, filter: 'created_by_me' }))}
            className={`px-3 py-1.5 rounded-md transition-all ${
              filters.filter === 'created_by_me'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Created by Me
          </button>
        </div>

        {/* Kanban vs List Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Kanban Board View"
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md text-xs flex items-center gap-1.5 font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Second row: Dropdown filters (Priority, Assignee, Sort) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 font-medium"
        >
          <option value="ALL">Priority: All</option>
          <option value="URGENT">Urgent 🔴</option>
          <option value="HIGH">High 🟠</option>
          <option value="MEDIUM">Medium 🟡</option>
          <option value="LOW">Low 🟢</option>
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assigneeId}
          onChange={(e) => setFilters(prev => ({ ...prev, assigneeId: e.target.value }))}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 font-medium"
        >
          <option value="ALL">Assignee: All</option>
          <option value="UNASSIGNED">Unassigned</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        {/* Sort Filter */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [TaskFilterOptions['sortBy'], TaskFilterOptions['sortOrder']];
            setFilters(prev => ({ ...prev, sortBy, sortOrder }));
          }}
          className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500 font-medium ml-auto"
        >
          <option value="createdAt-desc">Newest Created</option>
          <option value="createdAt-asc">Oldest Created</option>
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="title-asc">Title (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
