import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const SUPPORTED_INPUT_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "tiff",
  "tif",
  "svg",
  "heif",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const settings = JSON.parse(formData.get("settings") as string);

    const processedImages = await Promise.allSettled(
      files.map(async (file) => {
        try {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds 50MB limit`);
          }

          const fileExt = file.name.split(".").pop()?.toLowerCase();
          if (!fileExt || !SUPPORTED_INPUT_FORMATS.includes(fileExt)) {
            throw new Error(`Unsupported file format: ${fileExt}`);
          }

          const buffer = Buffer.from(await file.arrayBuffer());
          const originalSize = buffer.length;

          // Get original image metadata
          const metadata = await sharp(buffer).metadata();

          const originalDataUrl = `data:image/${
            metadata.format
          };base64,${buffer.toString("base64")}`;

          let sharpInstance = sharp(buffer, {
            failOnError: false,
            unlimited: true,
          });

          if (settings.preserveMetadata) {
            sharpInstance = sharpInstance.withMetadata();
          }

          // Apply resize if specified
          if (settings.resize?.width || settings.resize?.height) {
            const mode = settings.resize.mode || "both";
            const maxWidth = settings.resize.width;
            const maxHeight = settings.resize.height;
            const currentWidth = metadata.width || 0;
            const currentHeight = metadata.height || 0;

            let shouldResize = false;

            // Determine if resize is needed based on mode
            if (mode === "maxWidth" && maxWidth && currentWidth > maxWidth) {
              shouldResize = true;
            } else if (
              mode === "maxHeight" &&
              maxHeight &&
              currentHeight > maxHeight
            ) {
              shouldResize = true;
            } else if (mode === "both") {
              if (
                (maxWidth && currentWidth > maxWidth) ||
                (maxHeight && currentHeight > maxHeight)
              ) {
                shouldResize = true;
              }
            }

            if (shouldResize) {
              sharpInstance = sharpInstance.resize({
                width: maxWidth,
                height: maxHeight,
                fit: "inside",
                withoutEnlargement: true,
              });
            }
          }

          let processedBuffer: Buffer;

          switch (settings.format) {
            case "webp":
              processedBuffer = await sharpInstance
                .webp({
                  quality: settings.quality,
                  lossless: settings.lossless || false,
                  effort: settings.effort || 4,
                })
                .toBuffer();
              break;
            case "jpeg":
              processedBuffer = await sharpInstance
                .jpeg({
                  quality: settings.quality,
                  mozjpeg: true,
                  optimiseCoding: true,
                  progressive: true,
                })
                .toBuffer();
              break;
            case "png":
              processedBuffer = await sharpInstance
                .png({
                  quality: settings.quality,
                  compressionLevel: 9,
                  effort: settings.effort || 7,
                })
                .toBuffer();
              break;
            case "avif":
              processedBuffer = await sharpInstance
                .avif({
                  quality: settings.quality,
                  lossless: settings.lossless || false,
                  effort: settings.effort || 4,
                })
                .toBuffer();
              break;
            case "tiff":
              processedBuffer = await sharpInstance
                .tiff({
                  quality: settings.quality,
                  compression: "lzw",
                })
                .toBuffer();
              break;
            case "gif":
              processedBuffer = await sharpInstance
                .gif({
                  effort: settings.effort || 7,
                })
                .toBuffer();
              break;
            default:
              processedBuffer = await sharpInstance.toBuffer();
          }

          const processedSize = processedBuffer.length;
          const percentageSaved = Math.round(
            ((originalSize - processedSize) / originalSize) * 100
          );

          // Get processed image metadata
          const processedMetadata = await sharp(processedBuffer).metadata();

          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            originalName: file.name,
            originalSize,
            originalFormat: metadata.format || "unknown",
            processedSize,
            processedFormat: settings.format,
            originalDataUrl,
            processedDataUrl: `data:image/${
              settings.format
            };base64,${processedBuffer.toString("base64")}`,
            percentageSaved,
            width: processedMetadata.width,
            height: processedMetadata.height,
          };
        } catch (error) {
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            originalName: file.name,
            originalSize: file.size,
            originalFormat: "unknown",
            processedSize: 0,
            processedFormat: settings.format,
            processedDataUrl: "",
            percentageSaved: 0,
            error: error instanceof Error ? error.message : "Processing failed",
          };
        }
      })
    );

    const images = processedImages.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          id: `error-${Date.now()}`,
          originalName: "Unknown",
          originalSize: 0,
          originalFormat: "unknown",
          processedSize: 0,
          processedFormat: settings.format,
          processedDataUrl: "",
          percentageSaved: 0,
          error: "Processing failed",
        };
      }
    });

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process images" },
      { status: 500 }
    );
  }
}
