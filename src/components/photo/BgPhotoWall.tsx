"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PhotoItem {
  src: string;
  alt: string;
}

export default function BgPhotoWall() {
  const wallRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const { isLoggedIn, isAdmin, permissions } = useAuth();

  const showWall = isAdmin || permissions.photos === true;

  useEffect(() => {
    if (!showWall) return;
    fetch("/api/site-data")
      .then((res) => res.json())
      .then((data) => setPhotos(data.photos || []))
      .catch((err) => { console.error("加载照片失败:", err); });
  }, [showWall]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (wallRef.current) {
          wallRef.current.style.transform = `translateY(${window.scrollY * 0.05}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!showWall) return null;

  return (
    <div ref={wallRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="columns-3 gap-2 px-2 pt-24">
        {photos.filter(p => p.src).map((photo, i) => (
          <div key={i} className="mb-2 break-inside-avoid overflow-hidden rounded-sm opacity-25">
            <Image
              src={photo.src}
              alt=""
              width={400}
              height={400}
              className="w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
