"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
        this.setState({ errorInfo })
        this.props.onError?.(error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle>Something went wrong</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {this.state.error?.message || "An unexpected error occurred"}
                            </p>
                            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                                <pre className="mt-2 text-xs bg-muted p-2 rounded-md overflow-auto">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                            >
                                Try again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
} 