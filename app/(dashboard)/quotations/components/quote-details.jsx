import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { detailLabelAndValue } from "@/lib/utils"
import { getPageItemImageUrl } from "@/constants/pb"
import { ProductImage } from "@/(dashboard)/components/products/product-image"

export function QuoteDetails({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const details = Object.entries(item.product_details || {})

        return (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.product}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Quantity: {item.quantity}</span>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {details.map(([key, entry]) => {
                  const { id, label, value, image } = detailLabelAndValue(entry)
                  const hasImage = Boolean(image)
                  return (
                    <div key={key} className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="mt-1 flex items-start gap-2">
                        {hasImage ? (
                          <div
                            key={`${id}-${idx}`}
                            className="w-12 h-12 border-2 rounded-full overflow-hidden ring-1 ring-background"
                          >
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
