"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, Edit, ArrowRight, Loader2, User } from "lucide-react"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "./error-boundary"
import { TaskSkeleton } from "./task-skeleton"
import { useTaskStore } from "@/lib/store"


const cardVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  hover: { scale: 1.01 }
}

function TaskCardContent({ task }: { task: Task }) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { tasks, users, filteredTasks, updateTask, deleteTask, getTask, loading, error: storeError, initialize } = useTaskStore()

  const handleStatusToggle = useCallback(async (checked: boolean) => {
    if (isUpdating) return
    setIsUpdating(true)
    setError(null)
    try {
      await updateTask(task.id, { completed: checked })
    } catch (error) {
      console.error("Update error:", error)
      setError(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsUpdating(false)
    }
  }, [task.id, updateTask, isUpdating, tasks])

  const handleDelete = useCallback(async () => {
    if (isDeleting) return
    setIsDeleting(true)
    setError(null)
    try {
      await deleteTask(task.id)
    } catch (error) {
      console.error("Delete error:", error)
      setError(error instanceof Error ? error.message : "Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }, [task.id, deleteTask, isDeleting, tasks])

  if (isUpdating) {
    return (
      <div className="relative">
        <TaskSkeleton count={1} />
      </div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      className="relative transition-all duration-200"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={handleStatusToggle}
                  disabled={isUpdating}
                  className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    task.completed && "text-primary"
                  )}
                />
                <h3 className={cn(
                  "font-medium transition-all duration-200",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title} as
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 opacity-50" />
                <span className="text-sm text-muted-foreground">
                  {users[users.findIndex(u => u.id === task.userId)].name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/tasks/${task.id}`)}
                className="h-8 w-8"
                disabled={isUpdating || isDeleting}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    disabled={isDeleting || isUpdating}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="absolute inset-0 bg-destructive/10 border border-destructive rounded-lg flex items-center justify-center">
          <p className="text-sm text-destructive px-4 py-2">{error}</p>
        </div>
      )}
    </motion.div>
  )
}

export function TaskCard({ task }: { task: Task }) {
  if (!task) {
    console.error("TaskCard received undefined task:", { task })
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Invalid task data</p>
        </CardContent>
      </Card>
    )
  }

  if (!task.id) {
    console.error("TaskCard received task without id:", { task })
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">Task is missing required data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("TaskCard error:", { error, errorInfo, task })
      }}
      fallback={
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">Failed to render task</p>
          </CardContent>
        </Card>
      }
    >
      <TaskCardContent task={task} />
    </ErrorBoundary>
  )
}
