"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getPageItemImageUrl } from "@/constants/pb"

export function ImageThumb({ recordId, filename, alt, className, size = 48 }) {
  const [src, setSrc] = useState(getPageItemImageUrl(recordId, filename))
  if (!recordId || !filename) {
    console.log(recordId, filename, alt)
  }


  useEffect(() => {
    setSrc(getPageItemImageUrl(recordId, filename))
  }, [recordId, filename])

  return (
    <div
      className={cn("overflow-hidden rounded-md border bg-muted/20", "inline-flex", className)}
      style={{ width: size, height: size }}
      aria-label={alt || "Item image"}
    >
      <img
        src={src}
        alt={alt || "Item image"}
        className="h-full w-full object-cover aspect-square"
        crossOrigin="anonymous"
      />
    </div >
  )
}

