"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { UploadZone } from "@/components/upload-zone"
import { SettingsPanel } from "@/components/settings-panel"
import { ResultsGrid } from "@/components/results-grid"
import { ImageProgressCard } from "@/components/image-progress-card"
import { useToast } from "@/hooks/use-toast"
import type { ProcessedImage, ProcessingSettings, ImageProgress } from "@/types/image"

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressList, setProgressList] = useState<ImageProgress[]>([])
  const { toast } = useToast()

  const [settings, setSettings] = useState<ProcessingSettings>({
    format: "webp",
    quality: 85,
    preserveMetadata: false,
    lossless: false,
    effort: 4,
  })

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles)
    setProcessedImages([])
    setProgressList([])
  }

  const handleProcess = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProcessedImages([])

    const initialProgress: ImageProgress[] = files.map((file, index) => ({
      id: `progress-${index}`,
      fileName: file.name,
      progress: 0,
      status: "pending",
    }))
    setProgressList(initialProgress)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))
      formData.append("settings", JSON.stringify(settings))

      const progressInterval = setInterval(() => {
        setProgressList((prev) =>
          prev.map((p) => {
            if (p.status === "pending" || p.status === "processing") {
              const newProgress = Math.min(p.progress + Math.random() * 30, 95)
              return {
                ...p,
                progress: newProgress,
                status: "processing",
              }
            }
            return p
          }),
        )
      }, 300)

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) throw new Error("Processing failed")

      const data = await response.json()

      setProgressList((prev) =>
        prev.map((p, index) => ({
          ...p,
          progress: 100,
          status: data.images[index]?.error ? "error" : "complete",
          error: data.images[index]?.error,
        })),
      )

      setProcessedImages(data.images)

      const successCount = data.images.filter((img: ProcessedImage) => !img.error).length
      const errorCount = data.images.filter((img: ProcessedImage) => img.error).length

      if (errorCount === 0) {
        toast({
          title: "Processing Complete",
          description: `Successfully processed ${successCount} image${successCount > 1 ? "s" : ""}`,
        })
      } else {
        toast({
          title: "Processing Complete with Errors",
          description: `${successCount} succeeded, ${errorCount} failed`,
          variant: "destructive",
        })
      }
    } catch (error) {
      setProgressList((prev) =>
        prev.map((p) => ({
          ...p,
          progress: 100,
          status: "error",
          error: "Processing failed",
        })),
      )
      toast({
        title: "Processing Failed",
        description: "An error occurred while processing your images",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-foreground text-balance">
            Transform your images with <span className="text-primary">professional quality</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
            Convert, compress, and resize images without losing quality. Built for professionals who demand the best.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <UploadZone onFilesSelected={handleFilesSelected} fileCount={files.length} />

            {isProcessing && progressList.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Processing Progress</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {progressList.map((progress) => (
                    <ImageProgressCard key={progress.id} progress={progress} />
                  ))}
                </div>
              </div>
            )}

            {processedImages.length > 0 && <ResultsGrid images={processedImages} />}
          </div>

          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onProcess={handleProcess}
            isProcessing={isProcessing}
            hasFiles={files.length > 0}
          />
        </div>
      </main>
    </div>
  )
}
