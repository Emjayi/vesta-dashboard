"use client"

import { useEffect, useRef, useCallback } from "react"
import { useTaskStore } from "@/lib/store"
import { TaskItem } from "./task-item"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { ErrorBoundary } from "./error-boundary"
import { TaskSkeleton } from "./task-skeleton"

export function TaskList() {
    const { tasks, error, users, filteredTasks, updateTask, deleteTask, getTask, loading, error: storeError, initialize } = useTaskStore()
    const parentRef = useRef<HTMLDivElement>(null)

    // Set up virtualizer
    const rowVirtualizer = useVirtualizer({
        count: filteredTasks.length + (loading ? 3 : 0),
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 5,
    })

    if (loading && filteredTasks.length === 0) {
        return <TaskSkeleton count={5} />
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="text-center text-destructive">
                        <p className="font-medium">Error Loading Tasks</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <Button
                            onClick={() => initialize()}
                            className="mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Retrying...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error("TaskList error:", { error, errorInfo, tasks: filteredTasks })
            }}
        >
            <div
                ref={parentRef}
                className="h-[calc(100vh-200px)] pt-2 overflow-auto -mx-4"
                style={{
                    contain: "strict",
                }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const task = filteredTasks[virtualRow.index]
                        const isLoadingItem = virtualRow.index >= filteredTasks.length

                        if (isLoadingItem) {
                            return (
                                <div
                                    key={`loading-${virtualRow.index}`}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                    className="px-4"
                                >
                                    <TaskSkeleton count={1} />
                                </div>
                            )
                        }

                        if (!task) {
                            console.error("TaskList encountered undefined task at index:", virtualRow.index)
                            return null
                        }

                        return (
                            <div
                                key={task.id}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                className="px-4"
                            >
                                <div className={task.completed ? " opacity-70" : ""}>
                                    <TaskItem task={task} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </ErrorBoundary>
    )
} 