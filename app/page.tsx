"use client"

import { useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { TaskFiltersComponent } from "@/components/task-filters"
import { TaskList } from "@/components/task-list"
import { TaskStats } from "@/components/task-stats"
import { useTaskStore } from "@/lib/store"
import { CreateTaskDialog } from "@/components/create-task-dialog"

export default function TasksContent() {
  const { error, initialize } = useTaskStore()

  // Initialize store on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Handle filters state
  const handleFiltersChange = useCallback((filters: {
    selectedUsers: number[]
    status: "all" | "completed" | "pending"
    search: string
  }) => {
    // Filters are now handled directly in the TaskList component
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error Loading Tasks</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => initialize()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Manage your tasks efficiently</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <CreateTaskDialog />
        </div>
      </div>

      <div className="grid gap-6">
        <TaskFiltersComponent onFiltersChange={handleFiltersChange} />
        <TaskList />
        <TaskStats />
      </div>
    </div>
  )
}
