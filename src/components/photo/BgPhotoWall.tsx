"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { proxyImageUrl } from "@/lib/image";

interface PhotoItem {
  src: string;
  alt: string;
}

export default function BgPhotoWall() {
  const wallRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const { isLoggedIn, isAdmin, permissions } = useAuth();
  const pathname = usePathname();

  const isBackend = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const showWall = !isBackend && (isAdmin || permissions.photos === true);

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
      <div className="grid grid-cols-4 gap-1 p-1 sm:grid-cols-6 md:grid-cols-8">
        {photos.filter(p => p.src).map((photo, i) => (
          <div key={i} className="overflow-hidden rounded-sm opacity-30">
            <Image
              src={proxyImageUrl(photo.src)}
              alt=""
              width={400}
              height={400}
              className="aspect-square w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
