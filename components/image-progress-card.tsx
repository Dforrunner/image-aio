"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Loader2, FileImage } from "lucide-react"
import type { ImageProgress } from "@/types/image"
import { cn } from "@/lib/utils"

interface ImageProgressCardProps {
  progress: ImageProgress
}

export function ImageProgressCard({ progress }: ImageProgressCardProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      default:
        return <FileImage className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (progress.status) {
      case "complete":
        return "border-green-500/50 bg-green-500/5"
      case "error":
        return "border-red-500/50 bg-red-500/5"
      case "processing":
        return "border-primary/50 bg-primary/5"
      default:
        return "border-border bg-secondary/50"
    }
  }

  return (
    <Card className={cn("p-4 transition-all duration-300", getStatusColor())}>
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{progress.fileName}</p>
          {progress.error && <p className="text-xs text-red-500 mt-1">{progress.error}</p>}
        </div>
        <span className="text-xs font-bold text-muted-foreground">{progress.progress}%</span>
      </div>
      <Progress value={progress.progress} className="h-2" />
    </Card>
  )
}
