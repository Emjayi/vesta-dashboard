"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft } from "lucide-react"

export default function TaskDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Error Loading Task</CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">
              There was a problem loading this task. Please try again or return to the dashboard.
            </p>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Return to Dashboard
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
