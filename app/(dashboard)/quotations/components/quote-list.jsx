"use client"

import { useState, useMemo } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/accordion"
import { Input } from "@/components/input"
import { Badge } from "@/components/badge"
import { QuoteDetails } from "./quote-details"
import { cn } from "@/lib/utils"
import { ProductImage } from "@/(dashboard)/components/products/product-image"
import { matchQuery } from "@/lib/utils"
import { getPageItemImageUrl } from "@/constants/pb"

function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function productChips(quote) {
  const names = new Set()
  quote.items?.forEach(i => names.add(i.product))
  return Array.from(names)
}

function collectPreviewImages(q, limit = 2) {
  const results = []
  for (const item of q.items ?? []) {
    for (const [, entry] of Object.entries(item.product_details ?? {})) {
      if ("selection" in entry) {
        const sel = entry.selection
        if (sel?.image) {
          results.push({
            recordId: sel.id,
            filename: sel.image,
            alt: sel.title || "Selected option",
          })
          if (results.length >= limit) return results
        }
      }
    }
  }
  return results
}

export function QuoteList({ data }) {
  const [query, setQuery] = useState("")
  const [productFilter, setProductFilter] = useState("all")
  const [open, setOpen] = useState([])

  const allProducts = useMemo(() => {
    const set = new Set()
    data?.forEach(q => q.items?.forEach(i => set.add(i.product)))
    return Array.from(set).sort()
  }, [data])

  const filtered = useMemo(() => {
    const base = data?.filter(q => matchQuery(q, query)) || []
    if (productFilter === "all") return base
    return base.filter(q => q.items?.some(i => i.product === productFilter))
  }, [data, query, productFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by Customer, Phone, postcode, product…"
            className="border-4"
            containerClass="flex-grow max-w-4xl"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="product-filter">
              Product
            </label>
            <select
              id="product-filter"
              className={cn(
                "h-9 rounded-md border bg-background px-3 text-sm",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
            >
              <option value="all">All</option>
              {allProducts.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={open}
        onValueChange={v => setOpen(v)}
        className="divide-y rounded-md border"
      >
        {filtered.map(q => {
          const chips = productChips(q)
          const thumbs = collectPreviewImages(q, 3)
          const itemCount = q.items?.length ?? 0

          return (
            <AccordionItem key={q.id} value={q.id} className="px-3">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium truncate">
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
                      <span>Created {formatDate(q.created)}</span>
                      {q.pincode ? (
                        <>
                          <span>•</span>
                          <span>Postcode {q.pincode}</span>
                        </>
                      ) : null}
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline">Ref {q.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <div className="flex -space-x-2" onClick={(e) => e.stopPropagation()}>
                      {thumbs.map((t, idx) => (
                        <div
                          key={`${t.recordId}-${idx}`}
                          className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-background"
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
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </Badge>
                      <div className="flex flex-wrap gap-1.5">
                        {chips.slice(0, 3).map(c => (
                          <Badge key={c} variant="outline" className="text-[10px]">
                            {c}
                          </Badge>
                        ))}
                        {chips.length > 3 ? (
                          <Badge variant="outline" className="text-[10px]">
                            +{chips.length - 3} more
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <QuoteDetails items={q.items || []} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No quotations found.</div>
        ) : null}
      </Accordion>
    </div>
  )
}
