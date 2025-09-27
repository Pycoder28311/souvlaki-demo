"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

type ImageType = { id: number }

export default function GalleryPage() {
  const [images, setImages] = useState<ImageType[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/images")
      const data = await res.json()
      setImages(data)
    }
    fetchImages()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Γκαλερή</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative w-full aspect-square">
            <Image
              src={`/api/images/${img.id}`}
              alt={`Image ${img.id}`}
              fill  // makes the image cover the parent container
              className="rounded shadow object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
