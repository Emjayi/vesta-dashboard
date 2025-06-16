"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
}

interface TaskSkeletonProps {
    count?: number
    className?: string
}

export function TaskPageSkeleton({ count = 1, className }: TaskSkeletonProps) {
    return (
        <div className={`${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                    className="space-y-4"
                >
                    <div className="w-32 h-12">
                        <CardContent className="p-4 ">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1  space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                    <Card className="">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 h-80 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-5 w-52" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-48" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-96" />
                                    </div>
                                </div>
                                <div className="flex self-end items-center gap-2">
                                    <Skeleton className="h-8 w-32 rounded-lg" />
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))
            }
        </div >
    )
} 