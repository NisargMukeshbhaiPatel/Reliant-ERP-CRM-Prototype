"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { getProductImageUrl } from "@/constants/pb";
import { Button } from "@/components/button"
import { Badge } from "@/components/badge"
import { Separator } from "@/components/separator"
import { Plus, Check, Trash2, ShoppingCart } from "lucide-react"
import CustomerDialog from "../customer-form/customer-dialog";

export function WindowSummaryDialog({ products, open, onOpenChange, onDelete, handleSelectMoreProducts }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    console.log("Final Data", products)
    if (!products || products.length === 0) return;
    setIsDialogOpen(true);
  };

  const handleCustomerComplete = (customer) => {
    console.log('Customer created:', customer);
    console.log('Products:', products);
  };



  const renderSelectionValue = (selection) => {
    switch (selection.pageType) {
      case "SELECTION":
        return <span className="text-sm font-medium text-foreground">{selection.userInput.title}</span>

      case "NUMBER":
        return (
          <div className="flex flex-wrap gap-2">
            {Object.entries(selection.userInput).map(([key, item]) => (
              <span key={key} className="text-sm">
                <span className="text-muted-foreground">{item.title}:</span>
                <span className="font-medium ml-1">{item.value}</span>
              </span>
            ))}
          </div>
        )

      case "TEXT":
        return <span className="text-sm font-medium">{selection.userInput.textValue || "No text provided"}</span>

      default:
        return <span className="text-sm font-medium">{JSON.stringify(selection.userInput)}</span>
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-4 flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              Cart
              {products.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {products.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {products.map((productObj, productIndex) => {
              const product = productObj.product;

              return <div key={product.id} className="space-y-3">
                <div className="flex gap-3 items-center">
                  <img
                    src={getProductImageUrl(product.collectionId, product.id, product.image)}
                    alt={product.title}
                    className="h-36 w-36 rounded-lg border bg-muted object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-3xl leading-tight text-gray-900">
                      {product.title}
                    </h3>
                  </div>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {productObj.userSelections?.map((selection, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 py-1">
                      <span className="text-xs text-muted-foreground truncate">{selection.pageTitle}:</span>
                      <div className="flex-shrink-0">{renderSelectionValue(selection)}</div>
                    </div>
                  ))}
                </div>

                {productIndex < products.length - 1 && <Separator />}
              </div>
            })}

            <Separator />

            <div className="flex gap-4">
              <Button
                onClick={handleSelectMoreProducts}
                className="flex-1"
              >
                <Plus className="w-4 h-4" />
                Add More Products
              </Button>

              <Button
                variant="primary"
                onClick={handleClick}
                className="flex-1"
                disabled={!products || products.length === 0}
              >
                <Check className="w-4 h-4" />
                Complete Selection
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CustomerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onComplete={handleCustomerComplete}
      />
    </>
  )
}

