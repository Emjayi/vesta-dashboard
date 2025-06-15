"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DeleteTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  isDeleting: boolean
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    },
  },
}

export function DeleteTaskDialog({ task, open, onOpenChange, onDelete, isDeleting }: DeleteTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <AnimatePresence>
          {open && (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              <DialogHeader className="px-6 pt-6 pb-4">
                <DialogTitle className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Delete Task
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Are you sure you want to delete this task? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-4 border-y bg-muted/30">
                <p className="font-medium text-sm">{task.title}</p>
                {task.user && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Assigned to: {task.user.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isDeleting}
                  className="h-9 px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onDelete}
                  disabled={isDeleting}
                  variant="destructive"
                  className="h-9 px-3"
                >
                  {isDeleting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </div>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
