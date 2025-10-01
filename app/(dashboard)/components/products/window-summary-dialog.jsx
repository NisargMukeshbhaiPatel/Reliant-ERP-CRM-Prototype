"use client"

import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { getPageItemImageUrl, getProductImageUrl } from "@/constants/pb";
import { Button } from "@/components/button"
import { Separator } from "@/components/separator"
import { Minus, Plus, Check, Trash2, ShoppingCart } from "lucide-react"
import CustomerDialog from "../customer-form/customer-dialog";

import { transformToQuotationItem } from "@/lib/utils";
import { saveQuotation } from "@/lib/pb/quotation";

export function WindowSummaryDialog({ products, setProducts, open, onOpenChange, onDelete, handleSelectMoreProducts }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    console.log("Final Data", products)
    if (!products || products.length === 0) return;
    onOpenChange(false);
    setIsDialogOpen(true);
  };

  const handleCustomerComplete = async (customer) => {
    const quotationItems = transformToQuotationItem(products);
    try {
      await saveQuotation(quotationItems, customer);
      toast({
        title: "Quotation Created Successfully!",
        description: "We've received your request and will get back to you shortly",
      });
      setProducts([])

    } catch (error) {
      console.error("Error saving quotation", error)
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (productId, delta) => {
    setProducts(prevProducts =>
      prevProducts.map(productObj => {
        if (productObj.product.id === productId) {
          const currentQuantity = productObj.quantity || 1;
          const newQuantity = Math.max(1, currentQuantity + delta);
          return { ...productObj, quantity: newQuantity };
        }
        return productObj;
      })
    );
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
              const prodTypeSelection = productObj.userSelections[0]?.userInput;
              const img = prodTypeSelection && getPageItemImageUrl(prodTypeSelection.id, prodTypeSelection.image)
              const quantity = productObj.quantity || 1;

              return <div key={productObj.id} className="space-y-3">
                <div className="flex gap-3 items-start">
                  <img
                    src={img || getProductImageUrl(product.collectionId, product.id, product.image)}
                    alt={product.title}
                    className="h-36 w-36 rounded-lg border bg-white object-contain flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-2xl md:text-3xl leading-tight text-gray-900 mb-3">
                      {product.title}
                    </h3>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Quantity:</span>
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={quantity <= 1}
                          className="h-8 w-8 p-0 hover:bg-gray-400 rounded-md"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[2rem] text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="h-8 w-8 p-0 hover:bg-gray-400 rounded-md"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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

                <div>
                  {productObj.userSelections?.map((selection, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 p-3 bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                    >
                      <span className="text-sm font-medium text-foreground/80 flex-1 min-w-0">
                        {selection.pageTitle}
                      </span>
                      <div className="flex-shrink-0 font-semibold text-sm">
                        {renderSelectionValue(selection)}
                      </div>
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
        product={products[0]?.product}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onComplete={handleCustomerComplete}
      />
    </>
  )
}
