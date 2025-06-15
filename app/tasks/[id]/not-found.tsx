import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TaskNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Task Not Found</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">The task you're looking for doesn't exist or has been deleted.</p>
          </CardContent>

          <CardFooter>
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
