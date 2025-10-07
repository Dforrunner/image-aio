"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, FolderOpen, X, FileImage } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  fileCount: number
}

export function UploadZone({ onFilesSelected, fileCount }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return

      const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/"))

      if (imageFiles.length > 0) {
        setSelectedFiles(imageFiles)
        onFilesSelected(imageFiles)
      }
    },
    [onFilesSelected],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const items = Array.from(e.dataTransfer.items)
      const files: File[] = []

      const processItems = async () => {
        for (const item of items) {
          if (item.kind === "file") {
            const entry = item.webkitGetAsEntry()
            if (entry) {
              await traverseFileTree(entry, files)
            }
          }
        }

        const imageFiles = files.filter((file) => file.type.startsWith("image/"))
        if (imageFiles.length > 0) {
          setSelectedFiles(imageFiles)
          onFilesSelected(imageFiles)
        }
      }

      processItems()
    },
    [onFilesSelected],
  )

  const traverseFileTree = async (entry: any, files: File[]) => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => entry.file(resolve))
      if (file.type.startsWith("image/")) {
        files.push(file)
      }
    } else if (entry.isDirectory) {
      const reader = entry.createReader()
      const entries = await new Promise<any[]>((resolve) => reader.readEntries(resolve))
      for (const childEntry of entries) {
        await traverseFileTree(childEntry, files)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
  }

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const clearAll = () => {
    setSelectedFiles([])
    onFilesSelected([])
  }

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "relative overflow-hidden border-2 border-dashed transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-card/80",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className={cn(
                "mb-6 rounded-full bg-primary/10 p-6 transition-all duration-300",
                isDragging && "scale-110 bg-primary/20",
              )}
            >
              <Upload className={cn("h-12 w-12 text-primary transition-transform", isDragging && "animate-bounce")} />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-foreground">Drop your images here</h3>
            <p className="mb-6 text-muted-foreground">Support for single images or entire folders with mixed formats</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <label className="cursor-pointer">
                  <FileImage className="h-5 w-5" />
                  Select Files
                  <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
                </label>
              </Button>

              <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
                <label className="cursor-pointer">
                  <FolderOpen className="h-5 w-5" />
                  Select Folder
                  <input
                    type="file"
                    // @ts-ignore - webkitdirectory is not in types but works
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderInput}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">Supports JPG, PNG, GIF, WebP, TIFF, and more</p>
          </div>
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-foreground">Selected Files ({selectedFiles.length})</h4>
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-2">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 p-3 transition-all hover:bg-secondary animate-in fade-in slide-in-from-left duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <FileImage className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB • {file.type.split("/")[1].toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="ml-2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
