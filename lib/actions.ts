"use server"

import { revalidatePath } from "next/cache"
import type { CreateTaskData, UpdateTaskData, Task } from "./types"
import { createTask as dbCreateTask, updateTask as dbUpdateTask, deleteTask as dbDeleteTask } from "./api"

export async function createTask(data: CreateTaskData): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const task = await dbCreateTask(data)
    if (!task) {
      return { success: false, error: "Failed to create task" }
    }

    // Revalidate all task-related paths
    revalidatePath("/", "page")
    revalidatePath("/admin", "page")
    revalidatePath("/tasks/[id]", "page")

    return { success: true, task }
  } catch (error) {
    console.error("Create task error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create task",
    }
  }
}

export async function updateTask(data: UpdateTaskData): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const { id, ...updates } = data
    const task = await dbUpdateTask(id, updates)

    if (!task) {
      return { success: false, error: "Task not found" }
    }

    // Revalidate all task-related paths
    revalidatePath("/", "page")
    revalidatePath("/admin", "page")
    revalidatePath(`/tasks/${id}`, "page")

    return { success: true, task }
  } catch (error) {
    console.error("Update task error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update task",
    }
  }
}

export async function deleteTask(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const success = await dbDeleteTask(id)

    // Revalidate all task-related paths
    revalidatePath("/", "page")
    revalidatePath("/admin", "page")
    revalidatePath(`/tasks/${id}`, "page")

    return { success: true }
  } catch (error) {
    console.error("Delete task error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete task",
    }
  }
}
