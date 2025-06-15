import useSWR, { mutate } from 'swr';
import type { Task, User, CreateTaskData, UpdateTaskData } from '@/lib/types';

const SITE_URL = 'https://localhost:3001'

const fetcher = (url: string) => fetch(url).then(res => res.json());

// API endpoints
const TASKS_ENDPOINT = '/api/tasks';
const USERS_ENDPOINT = '/api/users';

// Direct data fetching functions for store use
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(TASKS_ENDPOINT);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(USERS_ENDPOINT);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function fetchTasksWithUsers(): Promise<{ tasks: Task[], users: User[] }> {
  const [tasks, users] = await Promise.all([
    fetchTasks(),
    fetchUsers()
  ]);
  return { tasks, users };
}

// Task mutations
export async function createTask(taskData: CreateTaskData): Promise<Task> {
  const response = await fetch(TASKS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  const newTask = await response.json();

  // Update the cache with the new task
  await mutate(TASKS_ENDPOINT, async (tasks: Task[] = []) => {
    return [newTask, ...tasks];
  }, { revalidate: false });

  return newTask;
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const response = await fetch(`${TASKS_ENDPOINT}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  const updatedTask = await response.json();

  // Update the cache with the modified task
  await mutate(TASKS_ENDPOINT, async (tasks: Task[] = []) => {
    return tasks.map(task => task.id === id ? updatedTask : task);
  }, { revalidate: false });

  return updatedTask;
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${TASKS_ENDPOINT}/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

  // Update the cache by removing the deleted task
  await mutate(TASKS_ENDPOINT, async (tasks: Task[] = []) => {
    return tasks.filter(task => task.id !== id);
  }, { revalidate: false });
}

// SWR hooks
export function useTasks() {
  const { data, error, isLoading } = useSWR<Task[]>(TASKS_ENDPOINT, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000
  });

  return {
    data,
    error,
    isLoading,
    createTask,
    updateTask,
    deleteTask
  };
}

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>(USERS_ENDPOINT, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000
  });

  return {
    data,
    error,
    isLoading
  };
}
