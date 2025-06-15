"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Pencil, CheckCircle2 } from "lucide-react"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

const dialogVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (task: Task) => void
}

export function EditTaskDialog({ task, open, onOpenChange, onUpdate }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [completed, setCompleted] = useState(task.completed)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(task.title)
    setCompleted(task.completed)
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Task title cannot be empty")
      return
    }

    setIsLoading(true)

    try {
      await onUpdate({
        ...task,
        title: title.trim(),
        completed,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update task:", error)
      setError("Failed to update task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            asChild
            className="sm:max-w-[425px]"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <motion.div
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              <DialogHeader>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
                    <Pencil className="h-5 w-5" />
                    Edit Task
                  </DialogTitle>
                </motion.div>
              </DialogHeader>
              <motion.form
                variants={formVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit}
                className="space-y-4 mt-4"
              >
                <motion.div variants={itemVariants}>
                  <Label htmlFor="edit-title" className="text-sm font-medium">
                    Task Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isLoading}
                    className={cn(
                      "mt-1.5 transition-all duration-200",
                      "focus:ring-2 focus:ring-primary/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50"
                >
                  <Checkbox
                    id="edit-completed"
                    checked={completed}
                    onCheckedChange={(checked) => setCompleted(checked as boolean)}
                    disabled={isLoading}
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  />
                  <Label
                    htmlFor="edit-completed"
                    className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    Mark as completed
                  </Label>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex justify-end gap-2 pt-4"
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="hover-lift focus-ring"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "hover-lift focus-ring",
                      "bg-gradient-to-r from-primary to-primary/80",
                      "hover:from-primary/90 hover:to-primary/70",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Task"
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
