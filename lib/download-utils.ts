import JSZip from "jszip"
import type { ProcessedImage } from "@/types/image"

export async function downloadImage(image: ProcessedImage) {
  try {
    const link = document.createElement("a")
    link.href = image.processedDataUrl
    link.download = `${image.originalName.split(".")[0]}.${image.processedFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to download image" }
  }
}

export async function downloadAllAsZip(images: ProcessedImage[]) {
  try {
    const zip = new JSZip()

    images.forEach((image) => {
      const base64Data = image.processedDataUrl.split(",")[1]
      const fileName = `${image.originalName.split(".")[0]}.${image.processedFormat}`
      zip.file(fileName, base64Data, { base64: true })
    })

    const blob = await zip.generateAsync({ type: "blob" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `processed-images-${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to create zip file" }
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
