import { Task, TaskStats, User, TaskFilterOptions } from '../types';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Tasks
  async getTasks(filters?: Partial<TaskFilterOptions>): Promise<{ tasks: Task[]; count: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });
    }

    const res = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getTaskById(id: string): Promise<{ task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    assigneeId?: string | null;
  }): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    });
    return handleResponse(res);
  },

  async updateTask(id: string, updates: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assigneeId: string | null;
  }>): Promise<{ message: string; task: Task }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteTask(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getStats(): Promise<{ stats: TaskStats }> {
    const res = await fetch(`${API_BASE}/tasks/stats`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  }
};
