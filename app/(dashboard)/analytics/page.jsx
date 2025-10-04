//Server page
import { getAllQuotations } from "@/lib/pb/quotation";
import { AnalyticsChart } from "./components/analytics-chart";
import { getCustomerInsights, clusterCustomers } from "@/lib/customer-clustering";
import { getAllProducts } from "@/lib/pb/products";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default async function AnalyticsPage() {
  let quotations, products;

  try {
    quotations = await getAllQuotations();
    products = await getAllProducts();
  } catch (error) {
    console.error("Error loading data:", error);
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Data: {error.message}</h1>
        <p className="text-gray-600">Unable to load quotation and product data for analytics</p>
      </div>
    );
  }

  // Process customer clustering with dynamic product names
  const clusteringResult = clusterCustomers(quotations, products);
  console.log(clusteringResult.stats)
  const insights = getCustomerInsights(clusteringResult);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Customer Analytics</h1>
        <p className="text-gray-600 mt-2">Customer segmentation and insights based on quotation data</p>

        {/* Key Stats Summary - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
            <p className="text-2xl font-bold text-blue-600">{clusteringResult.stats.totalCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Quotations</h3>
            <p className="text-2xl font-bold text-green-600">{clusteringResult.stats.totalQuotations}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(clusteringResult.stats.averageOrderValue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(clusteringResult.stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Quotation Status Cards - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Draft Quotations</h3>
            <p className="text-2xl font-bold text-gray-600">
              {clusteringResult.stats.statusCounts.DRAFT}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">In Review</h3>
            <p className="text-2xl font-bold text-amber-600">
              {clusteringResult.stats.statusCounts.REVIEW}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Finalized Quotations</h3>
            <p className="text-2xl font-bold text-emerald-600">
              {clusteringResult.stats.statusCounts.FINALIZED}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Cancelled Quotations</h3>
            <p className="text-2xl font-bold text-red-600">
              {clusteringResult.stats.statusCounts.CANCELLED}
            </p>
          </div>
        </div>
      </header>

      <AnalyticsChart
        clusteringData={clusteringResult}
        insights={insights}
      />
    </>
  );
}
