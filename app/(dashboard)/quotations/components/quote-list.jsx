"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/badge"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select"
import { Card, CardContent } from "@/components/card"
import { QuotationDialog } from "./quotation-dialog"
import { Eye } from "lucide-react"
import {
  matchQuery,
  productChips,
  formatDate,
} from "@/lib/utils"

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

export function QuoteList({ data }) {
  const [query, setQuery] = useState("")
  const [productFilter, setProductFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const allProducts = useMemo(() => {
    const set = new Set()
    data?.forEach((q) => q.items?.forEach((i) => set.add(i.product)))
    return Array.from(set).sort()
  }, [data])

  const filtered = useMemo(() => {
    let base = data?.filter((q) => matchQuery(q, query)) || []

    if (productFilter !== "all") {
      base = base.filter((q) => q.items?.some((i) => i.product === productFilter))
    }

    if (statusFilter !== "all") {
      base = base.filter((q) => q.status === statusFilter)
    }

    // Sort so unknown/undefined status appears first
    base.sort((a, b) => {
      const aIsUnknown = !a.status || !["REVIEW", "FINALIZED", "CANCELLED"].includes(a.status)
      const bIsUnknown = !b.status || !["REVIEW", "FINALIZED", "CANCELLED"].includes(b.status)

      if (aIsUnknown && !bIsUnknown) return -1
      if (!aIsUnknown && bIsUnknown) return 1
      return 0
    })

    return base
  }, [data, query, productFilter, statusFilter])

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Customer, Phone, postcode, product…"
            containerClass="flex-grow max-w-4xl"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Product</label>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {allProducts.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="FINALIZED">Finalized</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => {
          const chips = productChips(q)
          const itemCount = q.items?.length ?? 0
          const statusBadge = getStatusBadge(q.status)

          return (
            <Card
              key={q.id}
              className="border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(q)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[18px] font-medium truncate">
                        {q.customer?.first_name} {q.customer?.last_name}
                      </span>
                      {q.customer?.email ? (
                        <span className="text-xs text-muted-foreground truncate">{q.customer.email}</span>
                      ) : null}
                      {q.customer?.phone ? (
                        <span className="text-xs text-muted-foreground truncate">• {q.customer.phone}</span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                      <span>Created {formatDate(q.created)}</span>
                      {q.pincode ? (
                        <>
                          <span>{q.pincode}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    {/*
                    <div className="flex -space-x-2">
                      {thumbs.map((t, idx) => (
                        <div
                          key={`${t.recordId}-${idx}`}
                          className="w-8 h-8 border rounded-full overflow-hidden ring-1 ring-background"
                        >
                          <ProductImage
                            src={getPageItemImageUrl(t.recordId, t.filename)}
                            alt={t.alt}
                            className="w-full h-full object-cover"
                            aspectRatio="1/1"
                            expandable={true}
                            priority={false}
                            imageFit="cover"
                          />
                        </div>
                      ))}
                    </div>
                      */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </Badge>
                      <div className="flex flex-wrap gap-1.5">
                        {chips.slice(0, 3).map((c) => (
                          <Badge key={c} variant="outline" className="text-sm">
                            {c}
                          </Badge>
                        ))}
                        {chips.length > 3 ? (
                          <Badge variant="outline" className="text-sm">
                            +{chips.length - 3} more
                          </Badge>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(q)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground border rounded-md">No quotations found.</div>
        ) : null}
      </div>

      <QuotationDialog quotation={selectedQuotation} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
