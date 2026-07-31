"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { proxyImageUrl } from "@/lib/image";

interface PhotoItem {
  src: string;
  alt: string;
}

interface SizedItem {
  photo: PhotoItem;
  colSpan: number;
  rowSpan: number;
}

const SPAN_PATTERN: [number, number][] = [
  [2, 2],
  [1, 1],
  [1, 2],
  [1, 1],
  [2, 1],
  [1, 1],
  [1, 1],
  [2, 2],
  [1, 1],
];

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
    if (!showWall) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (wallRef.current) {
          wallRef.current.style.transform = `translateY(${window.scrollY * 0.06}px)`;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [showWall]);

  const sizedItems = useMemo<SizedItem[]>(() => {
    const valid = photos.filter(p => p.src);
    const offset = Math.floor(Math.random() * SPAN_PATTERN.length);
    return valid.map((photo, i) => {
      const [colSpan, rowSpan] = SPAN_PATTERN[(i + offset) % SPAN_PATTERN.length];
      return { photo, colSpan, rowSpan };
    });
  }, [photos]);

  if (!showWall) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={wallRef}
        className="grid grid-cols-6 gap-1 p-1"
        style={{ gridAutoRows: "minmax(80px, auto)", gridAutoFlow: "dense", minHeight: "100%" }}
      >
        {sizedItems.map(({ photo, colSpan, rowSpan }, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-sm opacity-40"
            style={{ gridColumnEnd: `span ${colSpan}`, gridRowEnd: `span ${rowSpan}` }}
          >
            <Image
              src={proxyImageUrl(photo.src)}
              alt=""
              width={400}
              height={400}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
