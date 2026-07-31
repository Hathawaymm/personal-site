const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE_MB = 20;

export interface CompressResult {
  blob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;
  if (originalSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`图片超过 ${MAX_FILE_SIZE_MB}MB，请压缩后再上传`);
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    throw new Error("不支持的文件类型");
  }

  if (isVideo) {
    return { blob: file, fileName: file.name, originalSize, compressedSize: file.size };
  }

  const blob = await resizeImage(file);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return {
    blob,
    fileName: `${baseName}.jpg`,
    originalSize,
    compressedSize: blob.size,
  };
}

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("无法创建画布"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("压缩失败"));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}
