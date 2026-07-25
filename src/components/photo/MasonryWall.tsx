import Image from "next/image";

interface MasonryWallProps {
  photos: { src: string; alt: string }[];
}

export default function MasonryWall({ photos }: MasonryWallProps) {
  return (
    <div className="columns-2 gap-3 px-4 sm:columns-3 sm:gap-4 sm:px-6">
      {photos.map((photo) => (
        <div
          key={photo.src}
          className="group mb-3 break-inside-avoid overflow-hidden rounded-md sm:mb-4"
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            width={600}
            height={600}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
