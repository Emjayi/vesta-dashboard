"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter, Users, CheckCircle2, Clock } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTaskStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function TaskFiltersComponent() {
  const { users, filters, setFilters, applyFilters } = useTaskStore()
  const [localFilters, setLocalFilters] = useState({
    selectedUsers: filters.userIds || [],
    status: filters.status || "all",
    search: filters.search || ""
  })

  const handleUserSelection = useCallback((value: string) => {
    const userId = Number(value)
    setLocalFilters(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId]
    }))
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      status: value as "all" | "completed" | "pending"
    }))
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters(prev => ({
      ...prev,
      search: e.target.value
    }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    setFilters({
      userIds: localFilters.selectedUsers,
      status: localFilters.status,
      search: localFilters.search
    })
    applyFilters()
  }, [localFilters, setFilters, applyFilters])

  const clearAllFilters = useCallback(() => {
    setLocalFilters({
      selectedUsers: [],
      status: "all",
      search: ""
    })
    setFilters({})
    applyFilters()
  }, [setFilters, applyFilters])

  const hasActiveFilters = localFilters.selectedUsers.length > 0 ||
    localFilters.status !== "all" ||
    localFilters.search.length > 0

  const hasFilterChanges =
    JSON.stringify(localFilters.selectedUsers) !== JSON.stringify(filters.userIds || []) ||
    localFilters.status !== (filters.status || "all") ||
    localFilters.search !== (filters.search || "")

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={localFilters.search}
            onChange={handleSearchChange}
            className="w-full pl-9"
          />
        </div>

        <Select value={localFilters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={localFilters.selectedUsers.length > 0 ? localFilters.selectedUsers[0].toString() : ""}
          onValueChange={handleUserSelection}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="default"
          onClick={handleApplyFilters}
          disabled={!hasFilterChanges}
          className="shrink-0"
        >
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAllFilters}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {localFilters.selectedUsers.map((userId) => {
              const user = users.find((u) => u.id === userId)
              return (
                <Badge
                  key={userId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  {user?.name || "Unknown User"}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleUserSelection(userId.toString())}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )
            })}

            {localFilters.status !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                {localFilters.status === "completed" ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Clock className="h-3 w-3 text-yellow-500" />
                )}
                {localFilters.status === "completed" ? "Completed" : "Pending"}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleStatusChange("all")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {localFilters.search && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                Search: {localFilters.search}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleSearchChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
