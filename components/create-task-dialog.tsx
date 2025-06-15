"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useTaskStore } from "@/lib/store"

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { users, createTask } = useTaskStore()

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !userId) return

    setIsCreating(true)
    try {
      await createTask({
        title: title.trim(),
        userId: Number(userId),
        completed: false,
      })
      setOpen(false)
      setTitle("")
      setUserId("")
      router.refresh()
    } catch (error) {
      // Silent error handling
    } finally {
      setIsCreating(false)
    }
  }, [title, userId, createTask, router])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              disabled={isCreating}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user">Assign To</Label>
            <Select
              value={userId}
              onValueChange={setUserId}
              disabled={isCreating}
            >
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
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !userId || isCreating}
          >
            {isCreating ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
