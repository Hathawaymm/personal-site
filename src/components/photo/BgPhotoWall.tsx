"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const bgPhotos = [
  { src: "/photos/mei跟加贝在海边.jpg", alt: "" },
  { src: "/photos/mei的美照.jpg", alt: "" },
  { src: "/photos/hichens.jpg", alt: "" },
  { src: "/photos/加贝过圣诞.jpg", alt: "" },
  { src: "/photos/hichens跟加贝在海边.jpg", alt: "" },
  { src: "/photos/近期旅行照.jpg", alt: "" },
];

export default function BgPhotoWall() {
  const wallRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={wallRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="columns-3 gap-2 px-2 pt-24">
        {bgPhotos.map((photo, i) => (
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
