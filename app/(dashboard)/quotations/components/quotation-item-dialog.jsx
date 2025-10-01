"use client"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dialog"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Badge } from "@/components/badge"
import { Card, CardContent } from "@/components/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/accordion"
import { Loader2, Sparkles, Save } from "lucide-react"
import { ScrollArea } from "@/components/scroll-area"
import { Separator } from "@/components/separator"

import { detailLabelAndValue } from "@/lib/utils"
import { updateQuotationItemPrice } from "@/lib/pb/quotation"
import { getPageItemImageUrl } from "@/constants/pb"
import { ProductImage } from "@/(dashboard)/components/products/product-image"

export function QuotationItemDialog({
  item,
  quotation,
  initialPrices,
  open,
  onOpenChange,
  onPriceUpdate,
  calculateItemPrice,
}) {
  const router = useRouter()
  const [prices, setPrices] = useState({
    base: null,
    installation: null,
    logistics: null,
    vat: null,
  })
  const [aiPredictions, setAiPredictions] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (initialPrices) {
      setPrices({
        base: initialPrices.base ?? null,
        installation: initialPrices.installation ?? null,
        logistics: initialPrices.logistics ?? null,
        vat: initialPrices.vat ?? null,
      })
      setHasChanges(false)
    }
  }, [initialPrices])

  const updatePriceField = (field, value) => {
    setPrices((prev) => ({
      ...prev,
      [field]: value,
    }))
    setHasChanges(true)
  }

  const fetchAIPredictions = async () => {
    if (!item || !quotation) return

    setLoadingAI(true)

    try {
      const response = await fetch(`/api/ai/prediction/${item.id}`, {
        method: "GET",
      })

      const data = await response.json()

      //transform the response to match the expected format
      setAiPredictions({
        label: ["Prediction from data", "AI suggested"],
        base: [data.prediction.base, data.ai.base],
        installation: [data.prediction.installation, data.ai.installation],
        logistics: [data.prediction.logistics, data.ai.logistics],
        vat: [data.prediction.vat, data.ai.vat],
      })
    } catch (error) {
      toast({
        title: "Failed to fetch AI predictions (Retry)",
        variant: "destructive"
      })
      console.error("Failed to fetch AI predictions:", error)
    } finally {
      setLoadingAI(false)
    }
  }

  const applyAIPrediction = (predictionIndex) => {
    if (!aiPredictions) return

    setPrices({
      base: aiPredictions.base[predictionIndex],
      installation: aiPredictions.installation[predictionIndex],
      logistics: aiPredictions.logistics[predictionIndex],
      vat: aiPredictions.vat[predictionIndex],
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const priceId = await updateQuotationItemPrice(
        item.price?.id,
        prices,
        item.id,
        quotation.id
      );
      onPriceUpdate(item.id, prices);
      setHasChanges(false);
      quotation.price_id = priceId //Temp to allow user to change quote status
      router.refresh();
      onOpenChange(false);
      setAiPredictions(null);
      setLoadingAI(false);
    } catch (error) {
      toast({
        title: "Failed to Save Prices (Retry)",
        variant: "destructive"
      });
      console.error("Failed to save prices:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    onOpenChange(hasChanges) // Pass hasChanges to determine if summary should refresh
    setAiPredictions(null);
    setLoadingAI(false);
    setSaving(false);
  }

  if (!item) return null

  const itemPrice = calculateItemPrice(prices)
  const details = Object.entries(item.product_details || {})
  const isPriceValid = itemPrice !== null

  return (
    <Dialog open={open} onOpenChange={() => handleBack()}>
      <DialogContent className="max-w-5xl max-h-[95vh]">
        <DialogHeader className="mb-4 pb-4 border-b-2 border-b-gray-400">
          <Button variant="primary" size="sm" onClick={handleBack} className="-mt-2 w-fit hover:scale-1">
            Go Back
          </Button>
          <DialogTitle className="text-xl pt-2">Edit Quotation Item</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mr-2">
              {item.product}
            </Badge>
            Quantity: {item.quantity}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-200px)] px-3">
          <div className="space-y-3 pb-6">
            {/* Product Configuration */}
            {details.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="config" className="border-none">
                      <AccordionTrigger className="text-md font-medium hover:no-underline py-2">
                        Product Configuration ({details.length} items)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 pt-2">
                          {details.map(([key, entry]) => {
                            const { id, label, value, image } = detailLabelAndValue(entry)
                            const hasImage = Boolean(image)
                            return (
                              <div key={key} className="rounded-md border p-3 bg-muted/30">
                                <div className="text-xs text-muted-foreground">{label}</div>
                                <div className="mt-1 flex items-start gap-2">
                                  {hasImage ? (
                                    <div className="w-10 h-10 border rounded-full overflow-hidden ring-1 ring-background flex-shrink-0">
                                      <ProductImage
                                        src={getPageItemImageUrl(id, image)}
                                        alt={label}
                                        className="w-full h-full object-cover"
                                        aspectRatio="1/1"
                                        expandable={true}
                                        priority={false}
                                        imageFit="cover"
                                      />
                                    </div>
                                  ) : null}
                                  <div className="text-sm">{value || "—"}</div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* AI Predictions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Price Predictions
                  </h3>
                  <Button
                    variant="default"
                    onClick={fetchAIPredictions}
                    disabled={loadingAI}
                    className="bg-transparent"
                  >
                    {loadingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Get Predictions
                      </>
                    )}
                  </Button>
                </div>

                {aiPredictions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[0, 1].map((predIdx) => (
                      <Card key={predIdx} className="bg-accent/30">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium">Option {predIdx + 1} ({aiPredictions.label[predIdx]})</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyAIPrediction(predIdx)}
                              className="h-7 text-xs"
                            >
                              Apply
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Base:</span>
                              <span className="ml-1 font-medium">£{aiPredictions.base[predIdx].toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Install:</span>
                              <span className="ml-1 font-medium">
                                £{aiPredictions.installation[predIdx].toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Logistics:</span>
                              <span className="ml-1 font-medium">£{aiPredictions.logistics[predIdx].toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">VAT:</span>
                              <span className="ml-1 font-medium">{(aiPredictions.vat[predIdx] * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Input Fields */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="text-sm font-medium">Price Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base">Base Price (£)</Label>
                    <Input
                      id="base"
                      type="number"
                      min="1"
                      step="0.01"
                      value={prices.base ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number.parseFloat(e.target.value);
                        if (value === null || value > 0) {
                          updatePriceField("base", value);
                        }
                      }}
                      placeholder="Enter base price (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installation">Installation (£)</Label>
                    <Input
                      id="installation"
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices.installation ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number.parseFloat(e.target.value);
                        if (value === null || value >= 0) {
                          updatePriceField("installation", value);
                        }
                      }}
                      placeholder="Enter installation cost (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logistics">Logistics (£)</Label>
                    <Input
                      id="logistics"
                      type="number"
                      min="0"
                      step="0.01"
                      value={prices.logistics ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number.parseFloat(e.target.value);
                        if (value === null || value >= 0) {
                          updatePriceField("logistics", value);
                        }
                      }}
                      placeholder="Enter logistics cost (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat">VAT Rate (decimal)</Label>
                    <Input
                      id="vat"
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={prices.vat ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : Number.parseFloat(e.target.value);
                        if (value === null || (value >= 0 && value <= 1)) {
                          updatePriceField("vat", value);
                        }
                      }}
                      placeholder="e.g., 0.2 for 20% (optional)"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3 bg-muted/50 rounded-md space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base:</span>
                    <span>{prices.base != null ? `£${prices.base.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installation:</span>
                    <span>{prices.installation != null ? `£${prices.installation.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Logistics:</span>
                    <span>{prices.logistics != null ? `£${prices.logistics.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      VAT {prices.vat != null ? `(${(prices.vat * 100).toFixed(0)}%)` : ''}:
                    </span>
                    <span>
                      {prices.base != null && prices.vat != null ? `£${(prices.base * prices.vat).toFixed(2)}` : '-'}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Item Total:</span>
                    <span>{isPriceValid ? `£${itemPrice.toFixed(2)}` : '-'}</span>
                  </div>
                </div>

                <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges} className="w-full gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog >
  )
}
