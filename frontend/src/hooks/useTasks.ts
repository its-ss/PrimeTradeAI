import { useState, useCallback } from 'react';
import api from '../services/api';
import { AxiosError } from 'axios';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function extractMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as { message?: string })?.message ?? err.message;
  }
  return 'Something went wrong';
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);

      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.data);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.post('/tasks', payload);
    return data.data as Task;
  }, []);

  const updateTask = useCallback(async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data.data as Task;
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  }, []);

  return { tasks, meta, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
