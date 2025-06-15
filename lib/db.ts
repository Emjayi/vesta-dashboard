import fs from 'fs/promises'
import path from 'path'
import type { Task, User } from "@/lib/types"

const DB_DIR = path.join(process.cwd(), 'data')
const TASKS_FILE = path.join(DB_DIR, 'tasks.json')
const USERS_FILE = path.join(DB_DIR, 'users.json')

// Ensure data directory exists
async function ensureDbExists() {
  try {
    await fs.access(DB_DIR)
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true })
  }
}

// Initialize database with sample data if empty
async function initializeDb() {
  await ensureDbExists()

  // Initialize tasks if file doesn't exist
  try {
    await fs.access(TASKS_FILE)
  } catch {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=200')
    if (!response.ok) throw new Error('Failed to fetch tasks from JSONPlaceholder')
    const tasks = await response.json()
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
  }

  // Initialize users if file doesn't exist
  try {
    await fs.access(USERS_FILE)
  } catch {
    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!response.ok) throw new Error('Failed to fetch users from JSONPlaceholder')
    const users = await response.json()
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  }
}

// Read tasks from file
async function readTasks(): Promise<Task[]> {
  await ensureDbExists()
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading tasks:', error)
    return []
  }
}

// Write tasks to file
async function writeTasks(tasks: Task[]): Promise<void> {
  await ensureDbExists()
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2))
}

// Read users from file
async function readUsers(): Promise<User[]> {
  await ensureDbExists()
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading users:', error)
    return []
  }
}

// Write users to file
async function writeUsers(users: User[]): Promise<void> {
  await ensureDbExists()
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
}

// Initialize database on startup
initializeDb().catch(console.error)

// Task operations
export async function getAllTasks(): Promise<Task[]> {
  return readTasks()
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  const tasks = await readTasks()
  return tasks.find(task => task.id === id)
}

export async function createTask(taskData: Omit<Task, "id">): Promise<Task> {
  const tasks = await readTasks()
  const newId = Math.max(0, ...tasks.map(t => t.id)) + 1
  const newTask: Task = {
    id: newId,
    ...taskData
  }
  await writeTasks([newTask, ...tasks])
  return newTask
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const tasks = await readTasks()
  const taskIndex = tasks.findIndex(t => t.id === id)
  if (taskIndex === -1) throw new Error('Task not found')

  const updatedTask = { ...tasks[taskIndex], ...updates }
  tasks[taskIndex] = updatedTask
  await writeTasks(tasks)
  return updatedTask
}

export async function deleteTask(id: number): Promise<void> {
  const tasks = await readTasks()
  const filteredTasks = tasks.filter(t => t.id !== id)
  if (filteredTasks.length === tasks.length) {
    throw new Error('Task not found')
  }
  await writeTasks(filteredTasks)
}

// User operations
export async function getAllUsers(): Promise<User[]> {
  return readUsers()
}

export async function getUserById(id: number): Promise<User | undefined> {
  const users = await readUsers()
  return users.find(user => user.id === id)
}

export async function createUser(userData: Omit<User, "id">): Promise<User> {
  const users = await readUsers()
  const newId = Math.max(0, ...users.map(u => u.id)) + 1
  const newUser: User = {
    id: newId,
    ...userData
  }
  await writeUsers([...users, newUser])
  return newUser
}

export async function updateUser(id: number, updates: Partial<User>): Promise<User> {
  const users = await readUsers()
  const userIndex = users.findIndex(u => u.id === id)
  if (userIndex === -1) throw new Error('User not found')

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser
  await writeUsers(users)
  return updatedUser
}

export async function deleteUser(id: number): Promise<void> {
  const users = await readUsers()
  const filteredUsers = users.filter(u => u.id !== id)
  if (filteredUsers.length === users.length) {
    throw new Error('User not found')
  }
  await writeUsers(filteredUsers)
}
