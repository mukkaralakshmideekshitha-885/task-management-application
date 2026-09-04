import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskFilterOptions, TaskStats, TaskStatus, User } from '../types';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { StatsOverview } from '../components/StatsOverview';
import { TaskFilterBar } from '../components/TaskFilterBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskListView } from '../components/TaskListView';
import { TaskModal } from '../components/TaskModal';
import { TaskDetailModal } from '../components/TaskDetailModal';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { socket } = useSocket();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filter state
  const [filters, setFilters] = useState<TaskFilterOptions>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    assigneeId: 'ALL',
    filter: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('TODO');
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { users } = await api.getUsers();
        setUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch tasks and stats
  const fetchTasksAndStats = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.getTasks(filters),
        api.getStats()
      ]);
      setTasks(tasksRes.tasks);
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasksAndStats();
  }, [fetchTasksAndStats]);

  // Real-time socket events sync
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      setTasks((prev) => {
        // Prevent duplicate if already added
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [newTask, ...prev];
      });
      // Refresh stats
      api.getStats().then((res) => setStats(res.stats));
    };

    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      // Refresh stats
      api.getStats().then((res) => setStats(res.stats));
    };

    const handleTaskDeleted = ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      // Refresh stats
      api.getStats().then((res) => setStats(res.stats));
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket]);

  // Handler: Status change
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.updateTask(taskId, { status: newStatus });
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`, {
        id: `status-${taskId}`
      });
      const statsRes = await api.getStats();
      setStats(statsRes.stats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
      fetchTasksAndStats();
    }
  };

  // Handler: Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await api.deleteTask(taskId);
      toast.success('Task deleted');
      const statsRes = await api.getStats();
      setStats(statsRes.stats);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete task');
      fetchTasksAndStats();
    }
  };

  // Handler: Submit Create or Edit
  const handleSubmitTask = async (taskData: any) => {
    if (taskToEdit) {
      const { task } = await api.updateTask(taskToEdit.id, taskData);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      toast.success('Task updated successfully');
    } else {
      const { task } = await api.createTask(taskData);
      setTasks((prev) => [task, ...prev]);
      toast.success('Task created successfully');
    }
    const statsRes = await api.getStats();
    setStats(statsRes.stats);
  };

  const handleOpenCreateModal = (status: TaskStatus = 'TODO') => {
    setTaskToEdit(null);
    setInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenCreateModal={() => handleOpenCreateModal('TODO')} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics bar */}
        <StatsOverview stats={stats} />

        {/* Filters and view toggle */}
        <TaskFilterBar
          filters={filters}
          setFilters={setFilters}
          users={users}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Task View (Kanban Board vs List View) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 font-medium">Loading tasks...</p>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            tasks={tasks}
            onSelectTask={(task) => setDetailTaskId(task.id)}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onOpenCreateWithStatus={handleOpenCreateModal}
          />
        ) : (
          <TaskListView
            tasks={tasks}
            onSelectTask={(task) => setDetailTaskId(task.id)}
            onEditTask={handleOpenEditModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTask}
        taskToEdit={taskToEdit}
        initialStatus={initialStatus}
        users={users}
      />

      {/* Task Details Drawer Modal */}
      <TaskDetailModal
        taskId={detailTaskId}
        onClose={() => setDetailTaskId(null)}
        onEdit={(task) => {
          setDetailTaskId(null);
          handleOpenEditModal(task);
        }}
        onDelete={(id) => {
          setDetailTaskId(null);
          handleDeleteTask(id);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
