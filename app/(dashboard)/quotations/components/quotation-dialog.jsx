"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { Phone, Mail, MapPin, Calendar, ChevronRight } from "lucide-react"
import { Label } from "@/components/label"
import { Badge } from "@/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Loader2, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/scroll-area"
import { formatDate } from "@/lib/utils"
import { QuotationItemDialog } from "./quotation-item-dialog"
import { updateQuotationPriceStatus } from "@/lib/pb/quotation"

export function QuotationDialog({ quotation, open, onOpenChange }) {
  const router = useRouter()
  const [itemPrices, setItemPrices] = useState({})
  const [aiSummary, setAiSummary] = useState("")
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [priceStatus, setPriceStatus] = useState("REVIEW")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [selectedItem, setSelectedItem] = useState(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)


  useEffect(() => {
    if (quotation?.items) {
      const initialPrices = {}
      quotation.items.forEach((item) => {
        if (!item.price) { //no quotation price set
          initialPrices[item.id] = {
            itemId: item.id,
            priceId: "",
            base: 0,
            installation: 0,
            logistics: 0,
            vat: 0,
          }
        } else {
          initialPrices[item.id] = {
            itemId: item.id,
            priceId: item.price.id,
            base: item.price.base,
            installation: item.price.installation,
            logistics: item.price.logistics,
            vat: item.price.vat,
          }
        }
        console.log(item)
      })
      setItemPrices(initialPrices)
      setPriceStatus(quotation.status || "REVIEW")

      if (quotation.id) {
        fetchAISummary(quotation.id)
      }
    }
  }, [quotation])

  const calculateItemPrice = (prices) => {
    const { base, installation, logistics, vat } = prices
    return base + installation + logistics + base * vat
  }

  const totalPrice = useMemo(() => {
    return Object.values(itemPrices).reduce((sum, prices) => {
      return sum + calculateItemPrice(prices)
    }, 0)
  }, [itemPrices])
  const fetchAISummary = async (quotationId) => {
    setLoadingSummary(true)
    try {
      const response = await fetch(`/api/ai/summary/${quotationId}`, {
        method: "GET",
      })
      const data = await response.text()
      setAiSummary(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoadingSummary(false)
    }
  }
  const handleStatusChange = async (newStatus) => {
    setPriceStatus(newStatus)
    setUpdatingStatus(true)
    try {
      await updateQuotationPriceStatus(quotation.price_id, newStatus)
      router.refresh() //TODO: replace this
    } catch (error) {
      toast({
        title: "Failed to Update Status (Retry)",
        variant: "destructive"
      })
      console.error("Failed to update status:", error)
      //Revert the status on error
      setPriceStatus(priceStatus)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setItemDialogOpen(true)
    onOpenChange(false) // Close main dialog
  }

  const handleItemDialogClose = (shouldRefreshSummary = false) => {
    setItemDialogOpen(false)
    setSelectedItem(null)
    onOpenChange(true) // Reopen main dialog

    if (shouldRefreshSummary && quotation?.id) {
      fetchAISummary(quotation.id)
    }
  }
  const handlePriceUpdate = (itemId, newPrices) => {
    setItemPrices((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...newPrices,
      },
    }))
  }

  if (!quotation) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[98vh]">
          <DialogHeader className="mb-4 pb-4 border-b-2 border-b-gray-400">
            <DialogTitle className="text-2xl font-semibold">Quotation Details</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(98vh-200px)] px-4">
            {/* Customer Hero Section */}
            <Card className="border-2 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">Customer</Badge>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {quotation.customer?.first_name} {quotation.customer?.last_name}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {quotation.customer?.phone && (
                        <a
                          href={`tel:${quotation.customer.phone}`}
                          className="inline-flex items-center gap-2.5 text-lg font-medium hover:text-primary transition-colors w-fit group"
                        >
                          <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <span>{quotation.customer.phone}</span>
                        </a>
                      )}

                      {quotation.customer?.email && (
                        <a
                          href={`mailto:${quotation.customer.email}`}
                          className="inline-flex items-center gap-2.5 text-md text-muted-foreground hover:text-primary transition-colors w-fit group"
                        >
                          <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                            <Mail className="h-4 w-4" />
                          </div>
                          <span>{quotation.customer.email}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {quotation.pincode && (
                      <Badge variant="outline" className="py-1 border-2 justify-start gap-1">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        <span className="text-sm font-medium">{quotation.pincode}</span>
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-2 py-1 justify-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">{formatDate(quotation.created)}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 mt-4">
              {/* AI Summary */}
              <Card>
                <CardHeader className="p-2 pl-3">
                  <CardTitle>
                    <span className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Summary
                    </span>
                    <span className="font-medium text-md text-muted-foreground">
                      {loadingSummary
                        ? "Fetching summary..."
                        : aiSummary
                          ? aiSummary
                          : "No summary available"}
                    </span>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Quotation Items */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Quotation Items ({quotation.items?.length || 0})</h3>

                {quotation.items?.map((item) => {
                  const prices = itemPrices[item.id] || {
                    base: 0,
                    installation: 0,
                    logistics: 0,
                    vat: 0.2,
                  }
                  const itemPrice = calculateItemPrice(prices)
                  const details = Object.entries(item.product_details || {})

                  return (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => handleItemClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Badge variant="secondary">{item.product}</Badge>
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Item Price</p>
                              <p className="text-base font-semibold">£{itemPrice.toFixed(2)}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <Card className="bg-primary/5 border-2">
                <CardContent className="p-4 flex items-center gap-3 flex-wrap justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quotation Price</p>
                      <p className="text-2xl font-bold">£{totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="price-status" className="text-sm">
                      Quotation Status
                    </Label>
                    <Select value={priceStatus} onValueChange={handleStatusChange} disabled={updatingStatus}>
                      <SelectTrigger id="price-status" className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="FINALIZED">Finalized</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingStatus && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog >

      <QuotationItemDialog
        item={selectedItem}
        quotation={quotation}
        initialPrices={selectedItem ? itemPrices[selectedItem.id] : null}
        open={itemDialogOpen}
        onOpenChange={handleItemDialogClose}
        onPriceUpdate={handlePriceUpdate}
        calculateItemPrice={calculateItemPrice}
      />
    </>
  )
}
