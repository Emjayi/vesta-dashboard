"use client"

import { useEffect, useRef } from "react"
import { useTaskStore } from "@/lib/store"

export function StoreInitializer() {
    const initialize = useTaskStore(state => state.initialize)
    const initialized = useRef(false)
    const storeInitialized = useTaskStore(state => state.initialized)
    const tasks = useTaskStore(state => state.tasks)

    useEffect(() => {
        console.log("StoreInitializer mounted:", {
            initialized: initialized.current,
            storeInitialized,
            tasksCount: tasks.length
        })

        // Initialize store only once on mount
        if (!initialized.current) {
            console.log("Starting store initialization")
            initialized.current = true
            initialize().then(() => {
                console.log("Store initialization completed:", {
                    storeInitialized: useTaskStore.getState().initialized,
                    tasksCount: useTaskStore.getState().tasks.length
                })
            }).catch(error => {
                console.error("Store initialization failed:", error)
            })
        }
    }, [initialize, storeInitialized, tasks.length])

    // Log store state changes
    useEffect(() => {
        console.log("Store state updated:", {
            initialized: storeInitialized,
            tasksCount: tasks.length
        })
    }, [storeInitialized, tasks.length])

    return null
} 