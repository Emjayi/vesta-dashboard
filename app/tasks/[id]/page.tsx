"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2, User as UserIcon, Calendar, CheckCircle, XCircle } from "lucide-react"
import { useTaskStore } from "@/lib/store"
import { DeleteTaskDialog } from "@/components/delete-task-dialog"
import type { Task, User } from "@/lib/types"
import { useParams } from 'next/navigation'
import Loading from "./loading"

// Memoized task form component
const TaskForm = memo(function TaskForm({
  title,
  setTitle,
  completed,
  setCompleted,
  userId,
  setUserId,
  users,
  isUpdating,
}: {
  title: string
  setTitle: (title: string) => void
  completed: boolean
  setCompleted: (completed: boolean) => void
  userId: string
  setUserId: (userId: string) => void
  users: User[]
  isUpdating: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={isUpdating}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="user">Assigned User</Label>
        <Select value={userId} onValueChange={setUserId} disabled={isUpdating}>
          <SelectTrigger id="user">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="completed"
          checked={completed}
          onCheckedChange={setCompleted}
          disabled={isUpdating}
        />
        <Label htmlFor="completed">Mark as completed</Label>
      </div>
    </div>
  )
})

// Memoized task info component
const TaskInfo = memo(function TaskInfo({ task }: { task: Task }) {
  if (!task) return null
  const { users } = useTaskStore()
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Task Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Assigned to:</span>
          <span>{users[users.findIndex(u => u.id === task.userId)].name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Task ID:</span>
          <span className="font-mono">{task.id}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {task.completed ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-muted-foreground">Status:</span>
          <span>{task.completed ? "Completed" : "Pending"}</span>
        </div>
      </div>
    </div>
  )
})


export default function TaskDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { tasks, users, updateTask, deleteTask, getTask, loading, error: storeError, initialize } = useTaskStore()
  const task = getTask(Number.parseInt(params.id))
  const [title, setTitle] = useState("")
  const [completed, setCompleted] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize store if needed
  useEffect(() => {
    if (!tasks.length && !loading) {
      initialize()
    }
  }, [tasks.length, loading, initialize])

  // Update local state when task data is loaded
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setCompleted(task.completed)
      setUserId(task.userId.toString())
    }
  }, [task])

  // Handle task not found or error states
  useEffect(() => {
    if (!loading) {
      if (storeError) {
        setError(storeError)
      } else if (!task && tasks.length > 0) {
        // Only redirect if we've loaded tasks but couldn't find this one
        router.push("/")
      }
    }
  }, [task, loading, storeError, tasks.length, router])

  const handleSave = useCallback(async () => {
    if (!task || !title.trim()) return

    setIsUpdating(true)
    setError(null)
    try {
      const userIdNumber = parseInt(userId, 10)
      if (isNaN(userIdNumber)) {
        throw new Error("Invalid user ID")
      }

      await updateTask(task.id, {
        title: title.trim(),
        completed,
        userId: userIdNumber,
      })
    } catch (error) {
      console.error("Update error:", error)
      setError(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsUpdating(false)
    }
  }, [task, title, completed, userId, updateTask])

  const handleDelete = useCallback(async () => {
    if (!task) return

    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      router.push("/")
    } catch (error) {
      console.error("Delete error:", error)
      setError(error instanceof Error ? error.message : "Failed to delete task")
    } finally {
      setIsDeleting(false)
      setIsDeleteOpen(false)
    }
  }, [task, deleteTask, router])

  if (error || storeError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground">{error || storeError}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => initialize()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <Loading />
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
          <CardDescription>Update task details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            title={title}
            setTitle={setTitle}
            completed={completed}
            setCompleted={setCompleted}
            userId={userId}
            setUserId={setUserId}
            users={users}
            isUpdating={isUpdating}
          />
          <Separator className="my-6" />
          <TaskInfo task={task} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Task"}
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>

      <DeleteTaskDialog
        task={task}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {error && (
        <Card className="mt-4 border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
