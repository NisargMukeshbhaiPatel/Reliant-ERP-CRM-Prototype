"use client"

import { useState } from "react"
import { Check, ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductImage } from "./product-image"
import { Button } from "@/components/button"


const getResponsiveGrid = (itemCount) => {
  if (itemCount === 1) return "grid-cols-1 max-w-md mx-auto"
  if (itemCount === 2) return "grid-cols-1 md:grid-cols-2"
  if (itemCount === 3) return "grid-cols-1 md:grid-cols-3"

  const getSmartLayout = (count) => {
    if (count === 4) return "grid-cols-1 sm:grid-cols-2"
    if (count === 5) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    if (count === 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    if (count === 7) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    if (count === 8) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    if (count === 9) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    if (count === 10) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    if (count === 11) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    if (count === 12) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

    const rem4 = count % 4
    const rem3 = count % 3

    if (rem3 === 0) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    if (rem4 === 0 || rem4 >= 3) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
  }

  return getSmartLayout(itemCount)
}
export function ProductGrid({
  selections,
  selectedId,
  onSelectionChange,
  isLoading = false,
  isSubmitting = false,
  variant = "default",
  showButton = false,
  buttonText = "Select",
  loadingText = "Loading...",
  imageFit,
  expandable = true
}) {
  const [hoveredId, setHoveredId] = useState(null)

  const variantStyles = {
    default: {
      container: "gap-3",
      card: "border border-border/40 hover:border-border transition-all duration-500 hover:premium-shadow-lg",
      content: "p-5",
      image: "rounded-t-xl",
      title: "text-lg font-semibold text-balance tracking-tight",
      desc: "text-sm text-muted-foreground/80 text-pretty leading-relaxed",
    },
    minimal: {
      container: "gap-4",
      card: "bg-transparent border-0 hover:bg-card/30 transition-all duration-700",
      content: "p-4",
      image: "rounded-lg",
      title: "text-base font-semibold text-balance tracking-tight",
      desc: "text-xs text-muted-foreground/70 text-pretty leading-relaxed",
    },
    luxury: {
      container: "gap-4",
      card: "border-2 transition-all duration-700 backdrop-blur-sm",
      content: "p-3",
      image: "rounded-t-lg",
      title: "text-xl font-bold text-balance tracking-tight",
      desc: "mb-4 text-sm text-muted-foreground text-pretty leading-relaxed",
    },
  }

  const styles = variantStyles[variant]

  const handleCardClick = (e, selectionId) => {
    // Check if the click came from the image or expand button
    const target = e.target
    const isImageClick = target.closest("[data-image-expand]")

    if (isImageClick) {
      console.log("[v0] Image click detected, preventing card selection")
      return
    }

    if (!isLoading && !isSubmitting && !showButton) {
      onSelectionChange?.(selectionId)
    }
  }

  return (
    <div className={cn("grid w-full", getResponsiveGrid(selections?.length || 0), styles.container)}>
      {selections.map((selection) => {
        const isSelected = selectedId === selection.id
        const isHovered = hoveredId === selection.id
        const isDisabled = isLoading || isSubmitting

        return (
          <div
            key={selection.id}
            className={cn(
              "group cursor-pointer transition-all duration-500 rounded-xl flex flex-col",
              styles.card,
              isSelected &&
              "ring-2 ring-primary/60 ring-offset-2 ring-offset-background premium-shadow-lg scale-[1.02]",
              isDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
              "hover:scale-[1.01] active:scale-[0.99]",
            )}
            onClick={(e) => handleCardClick(e, selection.id)}
            onMouseEnter={() => setHoveredId(selection.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Image Section */}
            <div className="relative" data-image-expand>
              <ProductImage
                src={selection.image}
                alt={selection.title}
                className={cn(
                  "w-full h-48 md:h-56 lg:h-64 object-cover",
                  styles.image,
                  variant === "luxury" && "h-56 md:h-64 lg:h-72",
                )}
                aspectRatio="auto"
                expandable={expandable}
                priority={false}
                imageFit={imageFit}
              />

              {/* Selection indicator */}
              {isSelected && !showButton && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2 premium-shadow-lg animate-in zoom-in-50 duration-300">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Badge */}
              {selection.badge && (
                <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium premium-shadow">
                  {selection.badge}
                </div>
              )}

              {/* Hover overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300",
                  (isHovered || isSelected) && "opacity-100",
                )}
              />
            </div>

            {/* Content Section */}
            <div className={cn("flex-grow flex flex-col", styles.content)}>
              <div className="flex-1">
                <h3
                  className={cn(
                    styles.title,
                    isSelected && "text-primary",
                    "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent",
                    "leading-tight mb-2",
                  )}
                >
                  {selection.title}
                </h3>

                {selection.desc && <p className={cn(styles.desc)}>{selection.desc}</p>}
              </div>

              {/* Button or Selection indicator */}
              {showButton ? (
                <Button
                  variant="primary"
                  className="w-full mt-auto"
                  disabled={selectedId === selection.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange?.(selection.id);
                  }}
                >
                  {selectedId === selection.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {loadingText}
                    </>
                  ) : (
                    buttonText
                  )}
                </Button>
              ) : (
                <div
                  className={cn(
                    "flex items-center justify-between border-t border-border/20 transition-all duration-300",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors duration-300 uppercase tracking-wider",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </span>

                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isSelected ? "text-primary translate-x-1" : "text-muted-foreground group-hover:translate-x-1",
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
