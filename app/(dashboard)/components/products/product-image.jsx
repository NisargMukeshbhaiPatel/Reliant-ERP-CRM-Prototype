"use client"
import { useState, useRef, useEffect } from "react"
import { Expand, Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"

export function ProductImage({
  src,
  alt,
  className,
  aspectRatio = "square",
  expandable = true,
  imageFit = "contain",
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  }

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [])

  const handleExpand = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (expandable && !hasError && isLoaded) {
      setIsExpanded(true)
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden group bg-white",
          aspectRatioClasses[aspectRatio],
          className,
        )}
      >
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <X className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full transition-all duration-500",
            imageFit === "cover" ? "object-cover" : "object-contain",
            isLoaded ? "opacity-100" : "opacity-0",
            expandable && !hasError && "cursor-pointer",
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(true)
          }}
        />
        {expandable && isLoaded && !hasError && (
          <button
            onClick={handleExpand}
            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer group z-10"
          >
            <div className="bg-white/90 rounded-full p-3 scale-75 group-hover:scale-100 transition-transform pointer-events-none">
              <Expand className="h-5 w-5" />
            </div>
          </button>
        )}
      </div>
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent
          className="max-w-[95vw] w-auto min-w-[50vw] max-h-[95vh] h-auto p-8 border-0 bg-white sm:max-w-7xl"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            setIsExpanded(false)
          }}
        >
          <VisuallyHidden>
            <DialogTitle>{alt}</DialogTitle>
          </VisuallyHidden>
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ProductImageGrid({ images = [], ...imageProps }) {
  const getGridClass = (count) => {
    if (count <= 2) return "grid-cols-2"
    if (count === 3) return "grid-cols-3"
    if (count === 4) return "grid-cols-2"
    if (count === 5) return "grid-cols-3"
    return "grid-cols-3"
  }

  const getLastRowClass = (count) => {
    if (count === 5) return "last-row-center-2"
    if (count === 7) return "last-row-center-1"
    if (count === 8) return "last-row-center-2"
    if (count === 10) return "last-row-center-1"
    if (count === 11) return "last-row-center-2"
    return ""
  }

  const gridClass = getGridClass(images.length)
  const lastRowClass = getLastRowClass(images.length)

  return (
    <div className="w-full">
      <div className={cn("grid gap-4", gridClass)}>
        {images.map((img, idx) => {
          const isLastRow =
            (images.length === 5 && idx >= 3) ||
            (images.length === 7 && idx === 6) ||
            (images.length === 8 && idx >= 6) ||
            (images.length === 10 && idx === 9) ||
            (images.length === 11 && idx >= 9)

          return (
            <div
              key={idx}
              className={cn(
                isLastRow && lastRowClass === "last-row-center-1" && "col-start-2",
                isLastRow && lastRowClass === "last-row-center-2" && idx === images.length - 2 && images.length === 5 && "col-start-1",
                isLastRow && lastRowClass === "last-row-center-2" && idx === images.length - 2 && images.length !== 5 && "col-start-2"
              )}
            >
              <ProductImage
                src={img.src}
                alt={img.alt || `Product image ${idx + 1}`}
                {...imageProps}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

