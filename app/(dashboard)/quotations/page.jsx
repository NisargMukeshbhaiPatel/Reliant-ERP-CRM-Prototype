import { getAllQuotations } from "@/lib/pb/quotation";
import { QuoteList } from "./components/quote-list"

export default async function QuotationsPage() {
  let quotations;
  try {
    quotations = await getAllQuotations();
  } catch (error) {
    console.error(error)
    return "ERROR IN LOADING QUOTATIONS"
  }

  return <>
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-pretty">Quotations</h1>
    </header>
    <section>
      <QuoteList data={quotations} />
    </section>

  </>
}

