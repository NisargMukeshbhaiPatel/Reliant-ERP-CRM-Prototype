"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog"
import { Phone, Mail, MapPin, Pencil, Calendar, ChevronRight } from "lucide-react"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Badge } from "@/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Loader2, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/scroll-area"
import { formatDate } from "@/lib/utils"
import { QuotationItemDialog } from "./quotation-item-dialog"
import { updateQuotationPriceStatus, updateQuotationPin } from "@/lib/pb/quotation"
import { updateCustomer } from "@/lib/pb/customer"

// Helper function to get status badge properties
const getStatusBadge = (status) => {
  switch (status) {
    case "REVIEW":
      return { label: "Review", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400" }
    case "FINALIZED":
      return { label: "Finalized", className: "bg-green-500/10 text-green-700 border-green-500/20 dark:bg-green-500/20 dark:text-green-400" }
    case "CANCELLED":
      return { label: "Cancelled", className: "bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400" }
    default:
      return { label: "Draft", className: "bg-gray-500/10 text-gray-700 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400" }
  }
}

export function QuotationDialog({ quotation, open, onOpenChange }) {
  const router = useRouter()
  const [itemPrices, setItemPrices] = useState({})
  const [aiSummary, setAiSummary] = useState("")
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [priceStatus, setPriceStatus] = useState("REVIEW")
  const [editingPincode, setEditingPincode] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const [selectedItem, setSelectedItem] = useState(null)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)

  // Customer edit states
  const [editCustomerOpen, setEditCustomerOpen] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })
  const [updatingCustomer, setUpdatingCustomer] = useState(false)

  useEffect(() => {
    if (quotation?.items) {
      const initialPrices = {}
      quotation.items.forEach((item) => {
        if (!item.price) {
          initialPrices[item.id] = {
            itemId: item.id,
            priceId: null,
            base: null,
            installation: null,
            logistics: null,
            vat: null,
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
      })
      setItemPrices(initialPrices)
      setPriceStatus(quotation.status || "REVIEW")

      if (quotation.id) {
        fetchAISummary(quotation.id)
      }
    }

    // Initialize customer form with existing data
    if (quotation?.customer) {
      setCustomerForm(getInitialCustomer())
    }
  }, [quotation])

  const getInitialCustomer = () => {
    return {
      firstName: quotation.customer.first_name || "",
      lastName: quotation.customer.last_name || "",
      email: quotation.customer.email || "",
      phone: quotation.customer.phone || "",
    }
  }

  const calculateItemPrice = (prices) => {
    const { base, installation, logistics, vat } = prices

    if (base == null || installation == null || logistics == null || vat == null) {
      return null
    }
    return base + installation + logistics + base * vat
  }

  const totalPrice = useMemo(() => {
    return Object.values(itemPrices).reduce((sum, prices) => {
      const itemPrice = calculateItemPrice(prices)
      return itemPrice !== null ? sum + itemPrice : sum
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
    if (!quotation.price_id) {
      toast({
        title: "Cannot change status",
        description: "Price information is incomplete. Please add prices to all items first.",
        variant: "destructive"
      })
      return
    }

    setPriceStatus(newStatus)
    setUpdatingStatus(true)
    try {
      await updateQuotationPriceStatus(quotation.price_id, newStatus)
      router.refresh()
    } catch (error) {
      toast({
        title: "Failed to Update Status (Retry)",
        variant: "destructive"
      })
      console.error("Failed to update status:", error)
      setPriceStatus(priceStatus)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
    setItemDialogOpen(true)
    onOpenChange(false)
  }

  const handleItemDialogClose = (shouldRefreshSummary = false) => {
    setItemDialogOpen(false)
    setSelectedItem(null)
    onOpenChange(true)

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

  const handleEditCustomer = () => {
    setCustomerForm(getInitialCustomer())
    setEditCustomerOpen(true)
    onOpenChange(false)
  }

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCustomerUpdate = async (e) => {
    e.preventDefault()
    setUpdatingCustomer(true)
    try {
      const res = await updateCustomer(quotation.customer.id, customerForm)
      if (res.error) throw new Error(res.error)
      //temp update the quotation object with new customer data
      quotation.customer = {
        ...quotation.customer,
        first_name: customerForm.firstName,
        last_name: customerForm.lastName,
        email: customerForm.email,
        phone: customerForm.phone,
      }
      toast({
        title: "Customer updated successfully",
      })
      setEditCustomerOpen(false)
      onOpenChange(true)
      router.refresh()
    } catch (error) {
      toast({
        title: error.message || "Failed to update customer",
        variant: "destructive"
      })
      console.error("Failed to update customer:", error)
    } finally {
      setUpdatingCustomer(false)
    }
  }

  if (!quotation) return null

  const statusBadge = getStatusBadge(priceStatus)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[98vh]">
          <DialogHeader className="mb-4 pb-4 border-b-2 border-b-gray-200">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-2xl font-semibold">Quotation Details</DialogTitle>
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="h-[calc(98vh-200px)]">
            <Card className="border-2 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Customer</Badge>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors gap-1"
                          onClick={handleEditCustomer}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Badge>
                      </div>
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
                      <Badge
                        variant="outline"
                        className="gap-1 justify-around p-0 border-2 px-2 relative"
                      >
                        <MapPin className="h-5 w-5" />
                        {editingPincode === quotation.id ? (
                          <input
                            type="text"
                            defaultValue={quotation.pincode}
                            autoFocus
                            onBlur={async (e) => {
                              const newPincode = e.target.value.trim();
                              if (newPincode && newPincode !== quotation.pincode) {
                                const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

                                if (!postcodeRegex.test(newPincode)) {
                                  toast({
                                    title: "Invalid postcode format",
                                    description: "Please enter a valid UK postcode (e.g., SW1A 1AA)",
                                    variant: "destructive"
                                  });
                                  setEditingPincode(null);
                                  return;
                                }

                                try {
                                  await updateQuotationPin(quotation.id, newPincode);
                                  toast({
                                    title: "Pincode updated successfully"
                                  });
                                  quotation.pincode = newPincode;
                                  router.refresh();
                                  setEditingPincode(null);
                                } catch (error) {
                                  toast({
                                    title: error.message || "Failed to update pincode",
                                    variant: "destructive"
                                  });
                                }
                              } else {
                                setEditingPincode(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                              if (e.key === 'Escape') {
                                setEditingPincode(null);
                              }
                            }}
                            className="py-2 bg-transparent border-none outline-none w-[5rem] text-xs font-medium uppercase focus:ring-1 focus:ring-primary rounded px-1"
                            maxLength="10"
                          />
                        ) : (
                          <>
                            <span className="text-xs font-medium uppercase pr-8 py-2">{quotation.pincode}</span>
                            <div className="p-2 right-[2px] absolute rounded-full bg-gray-400 cursor-pointer"
                              onClick={() => setEditingPincode(quotation.id)}
                            >
                              <Pencil className="h-3 w-3" />
                            </div>
                          </>
                        )}
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-2 py-1 justify-start gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium">{formatDate(quotation.created)}</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>           {/* Customer Hero Section */}

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
                              <p className="text-base font-semibold">
                                {itemPrice !== null ? `£${itemPrice.toFixed(2)}` : '-'}
                              </p>
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
        </DialogContent >
      </Dialog >

      {/* Customer Edit Dialog */}
      < Dialog open={editCustomerOpen} onOpenChange={(open) => {
        setEditCustomerOpen(open)
        if (!open) onOpenChange(true)
      }
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCustomerUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={customerForm.firstName}
                onChange={(e) => handleCustomerFormChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={customerForm.lastName}
                onChange={(e) => handleCustomerFormChange("lastName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerForm.email}
                onChange={(e) => handleCustomerFormChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={customerForm.phone}
                onChange={(e) => handleCustomerFormChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditCustomerOpen(false)
                  onOpenChange(true)
                }}
                disabled={updatingCustomer}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updatingCustomer}>
                {updatingCustomer ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Customer"
                )}
              </Button>
            </div>
          </form>
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
