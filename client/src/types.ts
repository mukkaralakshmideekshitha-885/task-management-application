export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type UserRole = 'ADMIN' | 'MEMBER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  details?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assigneeId?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  activities?: ActivityLog[];
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
  priorityCounts: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

export interface TaskFilterOptions {
  search: string;
  status: string; // 'ALL' or TaskStatus
  priority: string; // 'ALL' or TaskPriority
  assigneeId: string; // 'ALL' or 'UNASSIGNED' or userId
  filter: 'all' | 'assigned_to_me' | 'created_by_me';
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}
