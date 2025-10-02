import { getAllQuotations } from "@/lib/pb/quotation"
import { QuoteList } from "./components/quote-list"
import { Button } from "@/components/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function QuotationsPage() {
  let quotations
  try {
    quotations = await getAllQuotations()
  } catch (error) {
    console.error(error)
    return "ERROR IN LOADING QUOTATIONS:" + error.message
  }

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-pretty">
          Quotations
        </h1>
        <Link href="/?mode=new-quotation">
          <Button variant="primary" className="flex items-center">
            <Plus className="w-4 h-4" />
            New Quotation
          </Button>
        </Link>
      </header >

      <section>
        <QuoteList data={quotations} />
      </section>
    </>
  )
}
