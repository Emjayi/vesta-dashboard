import useSWR from 'swr';
import type { Task, User } from '@/lib/types';

// Remove server-side cache since we're using SWR for client-side caching
function getBaseUrl() {
  return 'http://localhost:3000'
}

const TASKS_URL = `${getBaseUrl()}/api/tasks`;
const USERS_URL = `${getBaseUrl()}/api/users`;

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Direct data fetching functions for server actions
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await fetch(TASKS_URL, {
      method: "GET",
      cache: 'no-store' // Ensure we always get fresh data
    })
    if (!response.ok) throw new Error('Failed to fetch tasks')
    return response.json()
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(USERS_URL);
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

// React hooks for components
export function useTasks() {
  const { data, error, mutate } = useSWR<Task[]>(TASKS_URL, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });
  return {
    tasks: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useUsers() {
  const { data, error, mutate } = useSWR<User[]>(USERS_URL, fetcher);
  return {
    users: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createTask(task: Omit<Task, 'id'>) {
  const res = await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
    cache: 'no-store'
  });
  return res.json();
}

export async function updateTask(id: number, updates: Partial<Task>) {
  const res = await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    cache: 'no-store'
  });
  return res.json();
}

export async function deleteTask(id: number) {
  await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: 'DELETE',
    cache: 'no-store'
  });
}
