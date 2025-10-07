export type InputFormat =
  | "jpeg"
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "avif"
  | "tiff"
  | "svg"
  | "heif";
export type OutputFormat = "jpeg" | "png" | "webp" | "avif" | "tiff" | "gif";

export interface ProcessedImage {
  id: string;
  originalName: string;
  originalSize: number;
  originalFormat: string;
  processedSize: number;
  processedFormat: string;
  originalDataUrl?: string;
  processedDataUrl: string;
  percentageSaved: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface ProcessingSettings {
  format: OutputFormat;
  quality: number;
  resize?: {
    width?: number;
    height?: number;
    mode?: "maxWidth" | "maxHeight" | "both";
  };
  preserveMetadata?: boolean;
  lossless?: boolean;
  effort?: number; // 0-9 for compression effort (higher = better compression, slower)
}

export interface ImageProgress {
  id: string;
  fileName: string;
  progress: number; // 0-100
  status: "pending" | "processing" | "complete" | "error";
  error?: string;
}
