"use client"

import { useState, useEffect } from "react"
import { getPageItemImageUrl } from "@/constants/pb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog"
import { Button } from "@/components/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/scroll-area"
import { ProductGrid } from "./product-grid";

export function SelectionDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  onPrevious,
  showPrevious = false,
  showNext = true,
  isLastStep = false,
  currentStep = 1,
  totalSteps = 1,
  isLoading = false,
  progressText = "",
}) {
  const [selectedId, setSelectedId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setSelectedId("")
    setIsSubmitting(false)
  }, [product?.id])

  const handleSubmit = async () => {
    if (selectedId && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const selectedItem = product.selections.find((s) => s.id === selectedId)
        await onSubmit(selectedItem)
      } finally {
        // don't reset isSubmitting here - let parent component handle state
      }
    }
  }

  const handleClose = () => {
    setSelectedId("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handlePrevious = async () => {
    if (onPrevious && !isSubmitting) {
      setIsSubmitting(true)
      try {
        setSelectedId("")
        await onPrevious()
      } finally {
      }
    }
  }

  const isNextDisabled = !selectedId || isSubmitting || isLoading

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[98vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-balance">{product?.title}</DialogTitle>
              <DialogDescription className="text-pretty">{product?.description}</DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              {(isLoading || isSubmitting) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLoading ? "Loading..." : "Processing..."}
                </div>
              )}
              {totalSteps > 1 && (
                <div className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {progressText || `Step ${currentStep} of ${totalSteps}`}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="mb-4 flex-1 overflow-y-auto rounded-xl">
          <div className="pt-4 px-6 pb-4 rounded-xl">
            <ProductGrid
              selections={product?.selections?.map(selection => ({
                ...selection,
                image: getPageItemImageUrl(selection.id, selection.image)
              })) || []}
              selectedId={selectedId}
              onSelectionChange={(id) => !isLoading && !isSubmitting && setSelectedId(id)}
              isLoading={isLoading || isSubmitting}
              variant="luxury"
            />
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 flex items-center justify-between">
          <div className="flex gap-2">
            {showPrevious && (
              <Button
                onClick={handlePrevious}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ChevronLeft className="h-4 w-4 mr-1" />
                )}
                Previous
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
          </div>

          <div className="flex flex-col items-end">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isNextDisabled}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSubmitting ? "Processing..." : "Loading..."}
                </>
              ) : showNext ? (
                <>
                  {isLastStep ? "Complete" : "Next"}
                  {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                </>
              ) : (
                "Submit Selection"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

