//Server page
import { getAllQuotations } from "@/lib/pb/quotation";
import { AnalyticsChart } from "./components/analytics-chart";

export default async function AnalyticsPage() {
  let quotations;

  try {
    quotations = await getAllQuotations();
  } catch (error) {
    console.error("Error loading quotations:", error);
    return "ERROR IN LOADING QUOTATIONS";
  }

  // TODO: Process quotations data here and pass to client components
  console.log("Quotations loaded:", quotations);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-2">View quotation analytics and insights</p>
      </header>

      {/* TODO Pass final chart/graph data to this main client component */}
      <AnalyticsChart />
    </>
  );
}
