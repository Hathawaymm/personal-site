"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { PhotoItem } from "@/lib/data";
import { useAccessLog } from "@/hooks/useAccessLog";
import { proxyImageUrl } from "@/lib/image";

export default function PhotosPage() {
  useAccessLog("照片墙");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/site-data")
      .then(r => r.json())
      .then(d => setPhotos(d.photos || []))
      .catch((err) => { console.error("加载照片失败:", err); });
  }, []);

  return (
    <AuthGuard requirePermissions={["photos"]}>
      <div className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <header className="mb-12 text-center">
            <h1 className="diary-title text-3xl sm:text-4xl">照片墙</h1>
            <p className="caption-text mt-3">每一帧都是温柔的回忆</p>
          </header>

          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.src}
                className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
                onClick={() => setSelectedIdx(idx)}
              >
                <Image
                  src={proxyImageUrl(photo.src)}
                  alt={photo.alt || ""}
                  width={400}
                  height={400}
                  className="w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <p className="text-center text-text-muted caption-text">暂未上传照片</p>
          )}
        </div>

        {selectedIdx !== null && photos[selectedIdx] && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedIdx(null)}
          >
            <button
              className="absolute top-6 right-6 text-2xl text-white/80 hover:text-white"
              onClick={() => setSelectedIdx(null)}
            >
              ✕
            </button>
            <Image
              src={proxyImageUrl(photos[selectedIdx].src)}
              alt={photos[selectedIdx].alt || ""}
              width={1200}
              height={900}
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
              unoptimized
            />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
