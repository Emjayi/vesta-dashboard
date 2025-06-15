"use client"

import { memo } from "react"
import { TaskCard } from "./task-card"
import type { Task } from "@/lib/types"
import { ErrorBoundary } from "./error-boundary"

interface TaskItemProps {
    task: Task
}

// Custom comparison function to determine if the task has actually changed
function areTasksEqual(prevProps: TaskItemProps, nextProps: TaskItemProps) {
    const prevTask = prevProps.task
    const nextTask = nextProps.task
    return (
        prevTask.id === nextTask.id &&
        prevTask.title === nextTask.title &&
        prevTask.completed === nextTask.completed &&
        prevTask.userId === nextTask.userId &&
        prevTask.user?.name === nextTask.user?.name
    )
}

// Memoized TaskItem component that properly passes task prop to TaskCard
export const TaskItem = memo<TaskItemProps>(function TaskItem({ task }) {
    if (!task) {
        console.error("TaskItem received undefined task")
        return null
    }

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error("TaskItem error:", { error, errorInfo, task })
            }}
        >
            <div className="transition-opacity duration-200">
                <TaskCard task={task} />
            </div>
        </ErrorBoundary>
    )
}, areTasksEqual) 