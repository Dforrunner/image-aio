"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Package, TrendingDown, Loader2, Eye } from "lucide-react"
import type { ProcessedImage } from "@/types/image"
import { formatFileSize, downloadImage, downloadAllAsZip } from "@/lib/download-utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ImageComparisonDialog } from "@/components/image-comparison-dialog"

interface ResultsGridProps {
  images: ProcessedImage[]
}

export function ResultsGrid({ images }: ResultsGridProps) {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null)
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const { toast } = useToast()

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalProcessedSize = images.reduce((sum, img) => sum + img.processedSize, 0)
  const totalSaved = totalOriginalSize - totalProcessedSize
  const averagePercentageSaved = Math.round((totalSaved / totalOriginalSize) * 100)

  const handleDownload = async (image: ProcessedImage) => {
    setDownloadingIds((prev) => new Set(prev).add(image.id))
    const result = await downloadImage(image)

    if (result.success) {
      toast({
        title: "Download Complete",
        description: `${image.originalName} has been downloaded successfully.`,
      })
    } else {
      toast({
        title: "Download Failed",
        description: result.error || "Failed to download image",
        variant: "destructive",
      })
    }

    setDownloadingIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(image.id)
      return newSet
    })
  }

  const handleDownloadAll = async () => {
    setIsDownloadingZip(true)
    const result = await downloadAllAsZip(images)

    if (result.success) {
      toast({
        title: "ZIP Download Complete",
        description: `${images.length} images have been packaged and downloaded.`,
      })
    } else {
      toast({
        title: "ZIP Download Failed",
        description: result.error || "Failed to create zip file",
        variant: "destructive",
      })
    }

    setIsDownloadingZip(false)
  }

  const handleCompareClick = (image: ProcessedImage) => {
    setSelectedImage(image)
    setIsComparisonOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Summary Stats */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Processing Complete</h3>
            <p className="text-sm text-muted-foreground">{images.length} images processed successfully</p>
          </div>
          <Button onClick={handleDownloadAll} disabled={isDownloadingZip} size="lg" className="gap-2">
            {isDownloadingZip ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating ZIP...
              </>
            ) : (
              <>
                <Package className="h-5 w-5" />
                Download All as ZIP
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Original Size</p>
            <p className="text-2xl font-bold text-foreground">{formatFileSize(totalOriginalSize)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Processed Size</p>
            <p className="text-2xl font-bold text-primary">{formatFileSize(totalProcessedSize)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Saved</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-500">{averagePercentageSaved}%</p>
              <TrendingDown className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* Images Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((image, index) => {
          const isDownloading = downloadingIds.has(image.id)

          return (
            <Card
              key={image.id}
              className="overflow-hidden group hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Preview */}
              <div className="relative aspect-video bg-secondary/50 overflow-hidden">
                <img
                  src={image.processedDataUrl || "/placeholder.svg"}
                  alt={image.originalName}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {image.width} × {image.height}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button onClick={() => handleCompareClick(image)} size="lg" className="gap-2 shadow-xl">
                    <Eye className="h-5 w-5" />
                    Compare Quality
                  </Button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground truncate mb-1">{image.originalName}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="uppercase">{image.originalFormat}</span>
                    <span>→</span>
                    <span className="uppercase text-primary font-medium">{image.processedFormat}</span>
                  </div>
                </div>

                {/* Size Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Before</span>
                    <span className="font-medium text-foreground">{formatFileSize(image.originalSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">After</span>
                    <span className="font-medium text-primary">{formatFileSize(image.processedSize)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium text-foreground">Saved</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          image.percentageSaved > 0 ? "text-green-500" : "text-muted-foreground",
                        )}
                      >
                        {image.percentageSaved}%
                      </span>
                      {image.percentageSaved > 0 && <TrendingDown className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(image)}
                  disabled={isDownloading}
                  variant="outline"
                  className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Comparison Dialog */}
      <ImageComparisonDialog image={selectedImage} open={isComparisonOpen} onOpenChange={setIsComparisonOpen} />
    </div>
  )
}
