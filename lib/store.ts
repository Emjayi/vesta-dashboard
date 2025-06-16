import { create } from "zustand"
import { fetchTasksWithUsers } from "./api"
import { createTask as createTaskAction, updateTask as updateTaskAction, deleteTask as deleteTaskAction } from "./actions"
import type { Task, User, TaskFilters } from "@/lib/types"

interface TaskStore {
  tasks: Task[]
  users: User[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: TaskFilters
  filteredTasks: Task[]
  initialize: () => Promise<void>
  getTask: (id: number) => Task | undefined
  createTask: (taskData: Omit<Task, "id">) => Promise<Task>
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  setFilters: (filters: TaskFilters) => void
  applyFilters: () => void
}

const STORAGE_KEYS = {
  TASKS: 'task-management:tasks',
  USERS: 'task-management:users',
  FILTERS: 'task-management:filters',
}

// Save tasks to localStorage
const saveTasks = (tasks: Task[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  } catch (e) {
    console.error('Error saving tasks:', e)
  }
}

// Load filters from localStorage
const loadFilters = (): TaskFilters => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FILTERS)
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    console.error('Error loading filters:', e)
    return {}
  }
}
const loadtasks = (): Task[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TASKS)
    console.log("get the tasks:", stored)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Error loading filters:', e)
    return []
  }
}

// Save filters to localStorage
const saveFilters = (filters: TaskFilters) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters))
  } catch (e) {
    console.error('Error saving filters:', e)
  }
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: loadtasks(),
  users: [],
  loading: false,
  error: null,
  initialized: false,
  filters: loadFilters(),
  filteredTasks: [],

  initialize: async () => {
    const state = get()
    console.log("Store initialization started:", {
      hasTasks: state.tasks.length > 0,
      initialized: state.initialized,
      loading: state.loading
    })


    if (state.initialized && state.tasks.length > 0) {
      console.log("Store already initialized with tasks, skipping")
      return
    }

    set({ loading: true, error: null })
    try {
      const { tasks: newTasks, users: newUsers } = await fetchTasksWithUsers()

      set({
        tasks: newTasks,
        users: newUsers,
        loading: false,
        initialized: true
      })

      // Apply saved filters after loading tasks
      const filters = loadFilters()
      set({ filters })
      get().applyFilters()

      console.log("Store initialized successfully:", {
        tasksCount: newTasks.length,
        usersCount: newUsers.length
      })
    } catch (error) {
      console.error("Failed to initialize store:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to load tasks",
        loading: false,
        initialized: false
      })
    }
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters })
    saveFilters(filters)
  },

  applyFilters: () => {
    const { tasks, filters } = get()
    let filtered = [...tasks]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(task =>
        filters.status === 'completed' ? task.completed : !task.completed
      )
    }

    // Apply user filter
    if (filters.userIds && filters.userIds.length > 0) {
      filtered = filtered.filter(task =>
        filters.userIds?.includes(task.userId)
      )
    }

    set({ filteredTasks: filtered })
  },

  getTask: (id: number) => {
    const { tasks } = get()
    return tasks.find(task => task.id === id)
  },

  createTask: async (taskData: Omit<Task, "id">) => {
    console.log("Creating new task:", taskData)
    set({ loading: true, error: null })
    try {
      const result = await createTaskAction(taskData)
      if (!result.success || !result.task) {
        throw new Error(result.error || "Failed to create task")
      }

      const newTask = result.task as Task
      console.log("Task created successfully:", {
        id: newTask.id,
        title: newTask.title
      })

      set(state => {
        const updatedTasks = [newTask, ...state.tasks]
        console.log("Updating store with new task:", {
          newTaskId: newTask.id,
          totalTasks: updatedTasks.length
        })
        saveTasks(updatedTasks)
        return {
          tasks: updatedTasks,
          loading: false
        }
      })
      return newTask
    } catch (error) {
      console.error("Failed to create task:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to create task",
        loading: false
      })
      throw error
    }
  },

  updateTask: async (id: number, updates: Partial<Task>) => {
    const { tasks } = get()
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) throw new Error("Task not found")

    console.log("Updating task:", { id, updates })

    // Optimistic update
    const updatedTask = { ...tasks[taskIndex], ...updates }
    set(state => {
      const updatedTasks = state.tasks.map(t => t.id === id ? updatedTask : t)
      saveTasks(updatedTasks)
      // Apply filters immediately after updating tasks
      let filtered = [...updatedTasks]

      // Re-apply all filters
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(task =>
          task.title.toLowerCase().includes(searchLower)
        )
      }
      if (state.filters.status && state.filters.status !== 'all') {
        filtered = filtered.filter(task =>
          state.filters.status === 'completed' ? task.completed : !task.completed
        )
      }
      if (state.filters.userIds && state.filters.userIds.length > 0) {
        filtered = filtered.filter(task =>
          state.filters.userIds?.includes(task.userId)
        )
      }

      return {
        tasks: updatedTasks,
        filteredTasks: filtered
      }
    })

    try {
      const result = await updateTaskAction({ id, ...updates })
      if (!result.success || !result.task) {
        throw new Error(result.error || "Failed to update task")
      }
      console.log("Task update confirmed:", {
        id,
        updates,
        success: true
      })
    } catch (error) {
      console.error("Task update failed:", error)
      // Revert on error
      set(state => {
        const revertedTasks = state.tasks.map(t => t.id === id ? tasks[taskIndex] : t)
        // Re-apply filters after reverting
        let filtered = [...revertedTasks]
        if (state.filters.search) {
          const searchLower = state.filters.search.toLowerCase()
          filtered = filtered.filter(task =>
            task.title.toLowerCase().includes(searchLower)
          )
        }
        if (state.filters.status && state.filters.status !== 'all') {
          filtered = filtered.filter(task =>
            state.filters.status === 'completed' ? task.completed : !task.completed
          )
        }
        if (state.filters.userIds && state.filters.userIds.length > 0) {
          filtered = filtered.filter(task =>
            state.filters.userIds?.includes(task.userId)
          )
        }
        return {
          tasks: revertedTasks,
          filteredTasks: filtered
        }
      })
      throw error
    }
  },

  deleteTask: async (id: number) => {
    const { tasks } = get()
    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) throw new Error("Task not found")

    console.log("Deleting task:", { id })

    // Optimistic update
    set(state => {
      const updatedTasks = state.tasks.filter(t => t.id !== id)
      saveTasks(updatedTasks)
      console.log("Optimistic delete applied:", {
        taskId: id,
        totalTasks: updatedTasks.length
      })
      return { tasks: updatedTasks }
    })

    try {
      const result = await deleteTaskAction(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      console.log("Task deletion confirmed:", { id })
    } catch (error) {
      console.error("Task deletion failed:", error)
      // Revert on error
      set(state => {
        const revertedTasks = [...state.tasks.slice(0, taskIndex), tasks[taskIndex], ...state.tasks.slice(taskIndex)]
        console.log("Reverting task deletion:", {
          taskId: id,
          totalTasks: revertedTasks.length
        })
        return { tasks: revertedTasks }
      })
      throw error
    }
  }
}))
