"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatFileSize } from "@/lib/download-utils"
import { MoveHorizontal } from "lucide-react"
import type { ProcessedImage } from "@/types/image"

interface ImageComparisonDialogProps {
  image: ProcessedImage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageComparisonDialog({ image, open, onOpenChange }: ImageComparisonDialogProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setSliderPosition(50)
    }
  }, [open])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp)
      return () => document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  if (!image) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">{image.originalName}</DialogTitle>
          <DialogDescription>Drag the slider to compare the original and compressed images</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Comparison Container */}
          <div
            ref={containerRef}
            className="relative aspect-video bg-secondary/50 rounded-lg overflow-hidden cursor-col-resize select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Compressed Image (Background) */}
            <div className="absolute inset-0">
              <img
                src={image.processedDataUrl || "/placeholder.svg"}
                alt="Compressed"
                className="h-full w-full object-contain"
                draggable={false}
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground shadow-lg">Compressed</Badge>
              </div>
            </div>

            {/* Original Image (Foreground with clip) */}
            <div
              className="absolute inset-0 transition-none"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
            >
              <img
                src={image.originalDataUrl || "/placeholder.svg"}
                alt="Original"
                className="h-full w-full object-contain"
                draggable={false}
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-background text-foreground shadow-lg">Original</Badge>
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg transition-none z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              {/* Slider Handle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full shadow-xl flex items-center justify-center cursor-col-resize hover:scale-110 transition-transform"
                onMouseDown={handleMouseDown}
                onTouchStart={() => setIsDragging(true)}
              >
                <MoveHorizontal className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Stats Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Original Stats */}
            <div className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-semibold text-sm text-muted-foreground">Original</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium uppercase">{image.originalFormat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{formatFileSize(image.originalSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-medium">
                    {image.width} × {image.height}
                  </span>
                </div>
              </div>
            </div>

            {/* Compressed Stats */}
            <div className="space-y-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-sm text-primary">Compressed</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium uppercase text-primary">{image.processedFormat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium text-primary">{formatFileSize(image.processedSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved</span>
                  <span className="font-bold text-green-500">{image.percentageSaved}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
