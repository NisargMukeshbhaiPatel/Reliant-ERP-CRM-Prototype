"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  Wrench,
  MapPin,
  Lightbulb,
  Users,
  DollarSign
} from "lucide-react";

// Simple Bar Chart Component
function BarChart({ data, colors, title }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const color = colors[index % colors.length];

          return (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-gray-600">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, colors, title, showLegend = true }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="flex items-center space-x-6">
        {/* SVG Donut Chart */}
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {data.map((item, index) => {
              const percentage = total > 0 ? item.value / total : 0;
              const circumference = 2 * Math.PI * 50;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const previousPercentages = data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total), 0);
              const strokeDashoffset = -previousPercentages * circumference;
              const strokeColor = colors[index % colors.length].replace('bg-', '').replace('-500', '');

              const colorMap = {
                'blue': '#3b82f6',
                'purple': '#8b5cf6',
                'indigo': '#6366f1',
                'green': '#10b981',
                'orange': '#f59e0b',
                'pink': '#ec4899',
                'red': '#ef4444',
                'yellow': '#eab308'
              };

              return (
                <circle
                  key={item.name}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={colorMap[strokeColor] || '#6b7280'}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-in-out"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="space-y-2">
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              const color = colors[index % colors.length];

              return (
                <div key={item.name} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <div className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Revenue Chart Component
function RevenueChart({ data, colors, title }) {
  const maxRevenue = Math.max(...data.map(d => d.amount || 0));

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const revenue = item.amount || 0;
          const customerCount = item.value || 0;
          const avgPrice = customerCount > 0 ? revenue / customerCount : 0;
          const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
          const color = colors[index % colors.length];

          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{item.name}</span>
                <div className="text-right">
                  <div className="font-bold text-green-600">£{revenue.toFixed(0)}</div>
                  <div className="text-xs text-gray-500">{customerCount} customers</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`${color} h-4 rounded-full transition-all duration-700 ease-out flex items-center justify-center px-2`}
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 25 && (
                    <span className="text-xs text-white font-semibold">
                      Avg: £{avgPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vertical Bar Chart Component with Hover and Legend
function VerticalBarChart({ data, colors, title }) {
  const [tooltip, setTooltip] = useState(null);
  const maxValue = Math.max(...data.map(d => d.value));
  // Sort by value descending and show ALL regions
  const displayData = data.sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4 relative">
      <h4 className="font-medium text-gray-900">{title}</h4>

      {/* Tooltip rendered outside - positioned absolutely */}
      {tooltip && (
        <div
          className="fixed bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          <div>{tooltip.value} customers</div>
          {tooltip.revenue && <div>£{tooltip.revenue.toFixed(0)} revenue</div>}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Chart with Y-axis and horizontal scroll */}
      <div className="flex bg-gray-50 rounded-lg p-4">
        {/* Y-axis (fixed) */}
        <div className="flex flex-col justify-between h-48 pr-3 py-2 flex-shrink-0">
          {(() => {
            // Calculate Y-axis steps of 5
            const maxStep = Math.ceil(maxValue / 5) * 5;
            const steps = [];
            for (let i = maxStep; i >= 0; i -= 5) {
              steps.push(i);
            }
            return steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <span className="text-xs text-gray-600 font-medium w-6 text-right">{step}</span>
                <div className="w-2 h-px bg-gray-300 ml-1"></div>
              </div>
            ));
          })()}
        </div>

        {/* Scrollable chart area */}
        <div className="flex-1 overflow-x-auto">
          <div className="relative" style={{ minWidth: `${displayData.length * 40}px` }}>
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-2">
              {(() => {
                const maxStep = Math.ceil(maxValue / 5) * 5;
                const steps = [];
                for (let i = maxStep; i >= 0; i -= 5) {
                  steps.push(i);
                }
                return steps.map((step, index) => (
                  <div key={step} className="w-full h-px bg-gray-200 opacity-50"></div>
                ));
              })()}
            </div>

            {/* Bars */}
            <div className="flex items-end justify-start space-x-3 h-48 relative z-10 px-4">
              {displayData.map((item, index) => {
                // Calculate height as percentage of container, with minimum 10px
                const barHeight = maxValue > 0 ? Math.max((item.value / maxValue) * 160, 10) : 10;
                const color = colors[index % colors.length];

                return (
                  <div
                    key={item.name}
                    className="flex flex-col items-center group relative flex-shrink-0"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        name: item.name,
                        value: item.value,
                        revenue: item.revenue
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    {/* Bar */}
                    <div
                      className={`${color} w-6 transition-all duration-700 ease-out hover:opacity-80 cursor-pointer rounded-t-md`}
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend as Cards */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {displayData.map((item, index) => {
            const color = colors[index % colors.length];

            return (
              <div key={item.name} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center shadow-sm hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{item.value} customers</div>
                  {item.revenue && <div className="text-xs text-gray-500">£{item.revenue.toFixed(0)}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsChart({ clusteringData, insights }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!clusteringData) {
    return (
      <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-center text-gray-500">No clustering data available</p>
      </div>
    );
  }

  const { chartData, clusters, stats } = clusteringData;

  // Tab navigation
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "value", label: "Customer Value", icon: TrendingUp },
    { id: "products", label: "Product Preferences", icon: Package },
    { id: "geography", label: "Geographic Distribution", icon: MapPin },
    { id: "insights", label: "Insights & Complexity", icon: Lightbulb },
    { id: "ml", label: "ML Clusters", icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <OverviewTab chartData={chartData} stats={stats} />}
        {activeTab === "value" && <ValueSegmentationTab data={chartData.valueDistribution} clusters={clusters.byValue} />}
        {activeTab === "products" && <ProductPreferenceTab data={chartData.productPreference} clusters={clusters.byProductPreference} />}
        {activeTab === "geography" && <GeographyTab data={chartData.regionalDistribution} clusters={clusters.byRegion} />}
        {activeTab === "insights" && <InsightsAndComplexityTab insights={insights} complexityData={chartData.complexityDistribution} complexityClusters={clusters.byComplexity} />}
        {activeTab === "ml" && <ModelClustersTab />}
      </div>
    </div>
  );
}

// ML Clusters Tab - client-side fetch to external model API
function ModelClustersTab() {
  const [state, setState] = useState({ loading: false, error: null, data: null });

  useEffect(() => {
    let mounted = true;
    setState({ loading: true, error: null, data: null });

    fetch('/api/ai/cluster')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setState({ loading: false, error: null, data: json });
      })
      .catch((err) => {
        if (mounted) setState({ loading: false, error: err.message || String(err), data: null });
      });

    return () => { mounted = false; };
  }, []);

  const { loading, error, data } = state;

  // Helpers
  const safeNumber = (v) => (typeof v === 'number' ? v : 0);

  // Derived data helpers
  const getSummaryByCluster = (summary = []) => {
    if (!summary || summary.length === 0) return [];

    // compute global stats to create relative labels
    const prices = summary.map(s => safeNumber(s.total_price_mean));
    const qtys = summary.map(s => safeNumber(s.total_qty_mean));

    const sortedPrices = [...prices].sort((a, b) => a - b);
    const p33 = sortedPrices[Math.floor(sortedPrices.length * 0.15)] || sortedPrices[0];
    const p66 = sortedPrices[Math.floor(sortedPrices.length * 0.66)] || sortedPrices[sortedPrices.length - 1];
    
    const meanQty = qtys.reduce((a, b) => a + b, 0) / qtys.length || 0;

    const tierForPrice = (v) => {
      if (v <= p33) return 'Low value';
      if (v <= p66) return 'Average';
      return 'High value';
    };

    const qtyTag = (q) => {
      if (q >= meanQty * 1.3) return 'Bulk buyers';
      if (q <= meanQty * 0.7) return 'Low frequency';
      return '';
    };

    return summary.map(s => {
      const avgPrice = safeNumber(s.total_price_mean);
      const avgQty = safeNumber(s.total_qty_mean);
      const parts = [tierForPrice(avgPrice)];
      const qTag = qtyTag(avgQty);
      if (qTag) parts.push(qTag);

      return {
        id: s.cluster_,
        count: s.customer_count,
        avgPrice: avgPrice,
        minPrice: s.total_price_min,
        maxPrice: s.total_price_max,
        avgQty: avgQty,
        label: parts.join(' • ')
      };
    });
  };

  // PCA scatter helper: normalize points to box
  const normalizePCA = (points = [], width = 420, height = 300, padding = 20) => {
    if (!points || points.length === 0) return [];
    const xs = points.map(p => p.pca1);
    const ys = points.map(p => p.pca2);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const scaleX = (v) => {
      if (maxX === minX) return width / 2;
      return padding + ((v - minX) / (maxX - minX)) * (width - padding * 2);
    };
    const scaleY = (v) => {
      if (maxY === minY) return height / 2;
      // invert Y so higher values are up
      return padding + (1 - (v - minY) / (maxY - minY)) * (height - padding * 2);
    };

    return points.map(p => ({
      ...p,
      x: scaleX(p.pca1),
      y: scaleY(p.pca2)
    }));
  };

  // UI state for cluster interactions
  const [selectedCluster, setSelectedCluster] = useState(null);

  // PCA plot dimensions (shared between axes and normalization)
  const WIDTH = 420;
  const HEIGHT = 300;
  const PADDING = 40; // match the visual margin used for axes

  // normalize visualizations once using shared dimensions
  const pcaPoints = normalizePCA(data?.visualizations || [], WIDTH, HEIGHT, PADDING);
  // computed summary with friendly labels
  const summaryBy = getSummaryByCluster(data?.summary || []);
  // tooltip for PCA points (floating HTML tooltip)
  const [pcaTooltip, setPcaTooltip] = useState(null);

  // compute PCA extents for tick labels
  const pcaXs = (data?.visualizations || []).map(p => p.pca1 || 0);
  const pcaYs = (data?.visualizations || []).map(p => p.pca2 || 0);
  const pcaMinX = pcaXs.length ? Math.min(...pcaXs) : 0;
  const pcaMaxX = pcaXs.length ? Math.max(...pcaXs) : 0;
  const pcaMinY = pcaYs.length ? Math.min(...pcaYs) : 0;
  const pcaMaxY = pcaYs.length ? Math.max(...pcaYs) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold pb-6">ML Clusters (from model)</h3>
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading cluster results...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            Error loading model clusters: {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {summaryBy.map((s) => (
                <div key={s.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm text-gray-500">{s.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">Cluster #{s.id + 1}</div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Customers</div>
                      <div className="text-xl font-semibold">{s.count}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <div>Avg £{safeNumber(s.avgPrice).toFixed(0)} • Qty {safeNumber(s.avgQty).toFixed(1)}</div>
                    <div className="text-xs text-gray-500">Range £{s.minPrice} - £{s.maxPrice}</div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedCluster(s.id)}
                      className={`px-3 py-1 rounded-md text-sm ${selectedCluster === s.id ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    >
                      Filter
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Main visual row: PCA + cluster list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* PCA Scatter */}
              <div className="col-span-2 bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-3">PCA Scatter (customers)</h4>
                <div className="flex flex-col gap-4 items-start">
                  <div className="w-full">
                    <svg width="100%" height="500" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                      <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#fff0" />
                      {/* axes using shared padding */}
                      <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#e5e7eb" />
                      <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} stroke="#e5e7eb" />
                      {/* axis ticks & labels (3 ticks each) */}
                      {([0, 0.5, 1].map((t, i) => {
                        const x = PADDING + t * (WIDTH - PADDING * 2);
                        const val = (pcaMinX + t * (pcaMaxX - pcaMinX));
                        return (
                          <g key={`xt-${i}`}>
                            <line x1={x} y1={HEIGHT - PADDING} x2={x} y2={HEIGHT - PADDING + 6} stroke="#e5e7eb" />
                            <text x={x} y={HEIGHT - PADDING + 18} fontSize={10} textAnchor="middle" fill="#6b7280">{val.toFixed(2)}</text>
                          </g>
                        );
                      }))}
                      {([0, 0.5, 1].map((t, i) => {
                        const y = PADDING + (1 - t) * (HEIGHT - PADDING * 2);
                        const val = (pcaMinY + t * (pcaMaxY - pcaMinY));
                        return (
                          <g key={`yt-${i}`}>
                            <line x1={PADDING - 6} y1={y} x2={PADDING} y2={y} stroke="#e5e7eb" />
                            <text x={PADDING - 10} y={y + 4} fontSize={10} textAnchor="end" fill="#6b7280">{val.toFixed(2)}</text>
                          </g>
                        );
                      }))}
                      {/* points (use precomputed pcaPoints) */}
                      {pcaPoints.map((p, idx) => {
                        const isSelected = selectedCluster === null || selectedCluster === p.cluster;
                        const color = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'][p.cluster % 6];
                        return (
                          <g
                            key={idx}
                            style={{ opacity: isSelected ? 1 : 0.18, cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setPcaTooltip({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                                customer: p.customer,
                                cluster: p.cluster,
                                pca1: p.pca1,
                                pca2: p.pca2
                              });
                            }}
                            onMouseLeave={() => setPcaTooltip(null)}
                          >
                            <circle cx={p.x} cy={p.y} r={6} fill={color} stroke="#fff" strokeWidth={1.5} />
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Small legend moved below SVG: horizontal, wrap when needed */}
                  <div className="w-full">
                    <div className="text-sm font-medium mb-2">Clusters</div>
                    <div className="flex flex-wrap gap-2">
                      {summaryBy.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedCluster(s.id)}
                          className={`flex-1 min-w-[140px] text-left p-2 rounded-md border ${selectedCluster === s.id ? 'border-blue-400 bg-blue-50' : 'bg-white'}`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">#{s.id + 1}</div>
                            <div className="text-sm text-gray-600">{s.count}</div>
                          </div>
                          <div className="text-xs text-gray-500">Avg £{safeNumber(s.avgPrice).toFixed(0)}</div>
                        </button>
                      ))}
                      <button onClick={() => setSelectedCluster(null)} className="min-w-[140px] p-2 rounded-md border bg-white">Show all</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clustered customers table */}
              <div className="col-span-1 bg-white p-4 rounded-lg border overflow-auto">
                <h4 className="font-medium text-gray-900 mb-3">Customers</h4>
                <div className="text-sm text-gray-600 mb-2">{selectedCluster === null ? 'All clusters' : `Cluster ${selectedCluster}`}</div>
                <div className="space-y-2">
                  {(data.clusters || []).filter(c => selectedCluster === null ? true : c.cluster === selectedCluster).slice(0, 50).map((c, idx) => (
                    <div key={idx} className="p-2 rounded-md border hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{c.customer}</div>
                          <div className="text-xs text-gray-500">{c.email} • {c.pincode}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">£{safeNumber(c.total_price).toFixed(0)}</div>
                          <div className="text-xs text-gray-500">Qty {safeNumber(c.total_qty)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ chartData, stats }) {
  const valueColors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];
  const productColors = ["bg-blue-500", "bg-purple-500", "bg-indigo-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
  const regionColors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-red-500", "bg-orange-500"];

  return (
    <div className="space-y-6">
      {/* Top Row - Key Metrics with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Value Donut Chart */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <DonutChart
            data={chartData.valueDistribution}
            colors={valueColors}
            title="Customer Value Distribution"
          />
        </div>

        {/* Product Preferences Donut Chart */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <DonutChart
            data={chartData.productPreference}
            colors={productColors}
            title="Product Preferences"
          />
        </div>
      </div>

      {/* Middle Row - Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Customer Segment */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <RevenueChart
            data={chartData.valueDistribution}
            colors={valueColors}
            title="Revenue by Customer Segment"
          />
        </div>

        {/* Customer Count Bar Chart */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <BarChart
            data={chartData.productPreference}
            colors={productColors}
            title="Customer Count by Product"
          />
        </div>
      </div>

      {/* Bottom Row - Geographic Distribution */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Geographic Distribution</h3>
        <VerticalBarChart
          data={chartData.regionalDistribution}
          colors={regionColors}
          title="Customer Amount by Region"
        />
      </div>
    </div>
  );
}

// Value Segmentation Tab
function ValueSegmentationTab({ data, clusters }) {
  const valueColors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <RevenueChart
            data={data}
            colors={valueColors}
            title="Revenue Distribution by Customer Value"
          />
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <DonutChart
            data={data}
            colors={valueColors}
            title="Customer Value Breakdown"
          />
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((segment, index) => {
          const colors = ["border-red-200 bg-red-50", "border-yellow-200 bg-yellow-50", "border-green-200 bg-green-50"];
          const clusterKey = segment.name.toLowerCase().replace(' value', '');
          const customers = clusters[clusterKey] || [];

          return (
            <div key={segment.name} className={`p-6 rounded-lg border-2 ${colors[index]}`}>
              <h3 className="text-lg font-semibold mb-3">{segment.name} Customers</h3>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{segment.value}</div>
                <div className="text-sm text-gray-600">customers</div>
                <div className="text-lg font-semibold text-green-600">£{segment.amount.toFixed(0)}</div>
                <div className="text-sm text-gray-500">total revenue</div>
                {customers.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Avg: £{(segment.amount / segment.value).toFixed(0)} per customer
                  </div>
                )}
              </div>

              {customers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Recent Customers:</h4>
                  <div className="space-y-1">
                    {customers.slice(0, 3).map((customer) => (
                      <div key={customer.id} className="text-sm">
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-gray-500">£{customer.orderValue.toFixed(0)} • {customer.productPreference}</div>
                      </div>
                    ))}
                    {customers.length > 3 && (
                      <div className="text-sm text-gray-500">+{customers.length - 3} more...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Product Preference Tab
function ProductPreferenceTab({ data, clusters }) {
  const productColors = ["bg-blue-500", "bg-purple-500", "bg-indigo-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <BarChart
            data={data.filter(item => item.value > 0)}
            colors={productColors}
            title="Product Preference Distribution"
          />
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <DonutChart
            data={data.filter(item => item.value > 0)}
            colors={productColors}
            title="Product Market Share"
          />
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.filter(item => item.value > 0).map((product, index) => {
          const colors = ["border-blue-200 bg-blue-50", "border-purple-200 bg-purple-50", "border-indigo-200 bg-indigo-50"];

          // Convert display name back to cluster key format
          let clusterKey = product.name.toLowerCase()
            .replace(' only', '')
            .replace(' products', '')
            .replace(/\s+/g, '_'); // Convert spaces to underscores

          // Handle specific cases
          if (clusterKey === 'mixed') clusterKey = 'mixed';
          if (clusterKey === 'other') clusterKey = 'other';

          const customers = clusters[clusterKey] || [];

          return (
            <div key={product.name} className={`p-6 rounded-lg border-2 ${colors[index % colors.length]}`}>
              <h3 className="text-lg font-semibold mb-3">{product.name}</h3>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{product.value}</div>
                <div className="text-sm text-gray-600">customers</div>

                {customers.length > 0 && (
                  <>
                    <div className="text-lg font-semibold text-green-600">
                      £{customers.reduce((sum, c) => sum + c.orderValue, 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-500">total revenue</div>
                  </>
                )}
              </div>

              {customers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-2">Sample Customers:</h4>
                  <div className="space-y-1">
                    {customers.slice(0, 2).map((customer) => (
                      <div key={customer.id} className="text-sm">
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-gray-500">£{customer.orderValue.toFixed(0)} • {customer.region}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Combined Insights and Complexity Tab
function InsightsAndComplexityTab({ insights, complexityData, complexityClusters }) {
  const getInsightIcon = (type) => {
    const iconMap = {
      value: TrendingUp,
      product: Package,
      geographic: MapPin,
      complexity: Wrench,
      default: Lightbulb
    };
    return iconMap[type] || iconMap.default;
  };

  const getInsightColor = (type) => {
    const colors = {
      value: "border-green-200 bg-green-50",
      product: "border-blue-200 bg-blue-50",
      geographic: "border-purple-200 bg-purple-50",
      complexity: "border-orange-200 bg-orange-50",
      default: "border-gray-200 bg-gray-50"
    };
    return colors[type] || colors.default;
  };

  return (
    <div className="space-y-8">
      {/* Order Complexity Section */}
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Order Complexity Analysis
          </h2>
          <p className="text-gray-600 mt-1">Understanding order patterns and complexity levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complexityData.map((complexity, index) => {
            const colors = ["border-green-200 bg-green-50", "border-orange-200 bg-orange-50"];
            const clusterKey = complexity.name.toLowerCase().replace(' orders', '');
            const customers = complexityClusters[clusterKey] || [];

            return (
              <div key={complexity.name} className={`p-6 rounded-lg border-2 ${colors[index]}`}>
                <h3 className="text-lg font-semibold mb-3">{complexity.name}</h3>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{complexity.value}</div>
                  <div className="text-sm text-gray-600">customers</div>

                  {customers.length > 0 && (
                    <>
                      <div className="text-lg font-semibold text-green-600">
                        £{customers.reduce((sum, c) => sum + c.orderValue, 0).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-500">total revenue</div>
                      <div className="text-sm text-gray-500">
                        Avg complexity: {(customers.reduce((sum, c) => sum + c.complexityScore, 0) / customers.length).toFixed(1)}
                      </div>
                    </>
                  )}
                </div>

                {customers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium mb-2">Sample Orders:</h4>
                    <div className="space-y-2">
                      {customers.slice(0, 3).map((customer) => (
                        <div key={customer.id} className="text-sm">
                          <div className="font-medium">{customer.customerName}</div>
                          <div className="text-gray-500">
                            {customer.itemCount} items • {customer.totalQuantity} products • Score: {customer.complexityScore}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Section */}
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Customer Insights & Recommendations
          </h2>
          <p className="text-gray-600 mt-1">Data-driven insights to help grow your business</p>
        </div>

        {insights && insights.length > 0 ? (
          <div className="grid gap-6">
            {insights.map((insight, index) => {
              const InsightIcon = getInsightIcon(insight.type);
              return (
                <div key={index} className={`p-6 rounded-lg border-2 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start space-x-4">
                    <InsightIcon className="w-8 h-8 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      <div className="bg-white bg-opacity-70 p-3 rounded-md">
                        <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" /> Recommendation:
                        </h4>
                        <p className="text-gray-800">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Data</h3>
            <p className="text-gray-600">More insights will appear as you gather more customer data.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Geography Tab
function GeographyTab({ data, clusters }) {
  const [tooltip, setTooltip] = useState(null);
  const [viewMode, setViewMode] = useState('customers'); // 'customers' or 'revenue'
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0, showAbove: false });
  const regionColors = ["bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-red-500", "bg-orange-500"];

  // Calculate max value and sort data based on view mode
  const maxValue = viewMode === 'customers'
    ? Math.max(...data.map(d => d.value))
    : Math.max(...data.map(d => d.revenue));

  const sortedData = [...data].sort((a, b) =>
    viewMode === 'customers' ? b.value - a.value : b.revenue - a.revenue
  );

  return (
    <div className="space-y-6">
      {/* Large Vertical Bar Chart */}
      <div className="bg-white p-6 rounded-lg border shadow-sm relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Geographic Distribution Overview</h3>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('customers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'customers'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Users className="w-4 h-4" />
              Customers
            </button>
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'revenue'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <DollarSign className="w-4 h-4" />
              Revenue
            </button>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed bg-gray-900 text-white text-sm rounded py-3 px-4 whitespace-nowrap shadow-xl pointer-events-none z-50"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-12px'
            }}
          >
            <div className="font-bold text-base mb-1">{tooltip.name}</div>
            {tooltip.viewMode === 'customers' ? (
              <>
                <div className="text-blue-300 text-base font-semibold">{tooltip.value} customers</div>
                {tooltip.revenue && <div className="text-green-300 text-xs">£{tooltip.revenue.toFixed(0)} revenue</div>}
              </>
            ) : (
              <>
                <div className="text-green-300 text-base font-semibold">£{tooltip.revenue.toFixed(0)} revenue</div>
                <div className="text-blue-300 text-xs">{tooltip.value} customers</div>
              </>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Chart Container */}
        <div className="flex">
          {/* Y-axis */}
          <div className="flex flex-col justify-between pr-4 py-3 flex-shrink-0" style={{ height: '400px' }}>
            {(() => {
              const TARGET_STEPS = 12;

              let stepSize = 12;
              if (viewMode === 'revenue') {
                const roughStep = maxValue / TARGET_STEPS;

                // Round to nice numbers - FIXED THRESHOLDS
                if (roughStep >= 100000) stepSize = 500000;      // For millions
                else if (roughStep >= 50000) stepSize = 100000;  // 100k steps
                else if (roughStep >= 10000) stepSize = 50000;   // 50k steps
                else if (roughStep >= 5000) stepSize = 10000;    // 10k steps
                else if (roughStep >= 1000) stepSize = 5000;     // 5k steps
                else if (roughStep >= 500) stepSize = 1000;      // 1k steps
                else stepSize = 500;
              }

              const maxStep = Math.ceil(maxValue / stepSize) * stepSize;
              const steps = [];

              for (let i = 0; i <= maxStep; i += stepSize) {
                steps.push(i);
              }

              return steps.reverse().map((step) => (
                <div key={step} className="flex items-center">
                  <span className="text-sm text-gray-600 font-semibold w-16 text-right">
                    {viewMode === 'revenue' && step >= 1000
                      ? `£${(step / 1000).toFixed(0)}k`
                      : viewMode === 'revenue'
                        ? `£${step}`
                        : step}
                  </span>
                  <div className="w-3 h-px bg-gray-400 ml-2"></div>
                </div>
              ));
            })()}
          </div>

          {/* Scrollable Chart Area */}
          <div className="flex-1 overflow-x-auto rounded-lg bg-gray-50 p-4">
            <div className="relative" style={{ minWidth: `${sortedData.length * 60}px`, height: '400px' }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-3">
                {(() => {
                  const TARGET_STEPS = 6;

                  let stepSize = 5;
                  if (viewMode === 'revenue') {
                    const roughStep = maxValue / TARGET_STEPS;

                    if (roughStep >= 100000) stepSize = 500000;
                    else if (roughStep >= 50000) stepSize = 100000;
                    else if (roughStep >= 10000) stepSize = 50000;
                    else if (roughStep >= 5000) stepSize = 10000;
                    else if (roughStep >= 1000) stepSize = 5000;
                    else if (roughStep >= 500) stepSize = 1000;
                    else stepSize = 500;
                  }

                  const maxStep = Math.ceil(maxValue / stepSize) * stepSize;
                  const steps = [];

                  for (let i = 0; i <= maxStep; i += stepSize) {
                    steps.push(i);
                  }

                  return steps.reverse().map((step) => (
                    <div key={step} className="w-full h-px bg-gray-300"></div>
                  ));
                })()}
              </div>

              {/* Bars */}
              <div className="flex items-end justify-start gap-6 h-full relative z-10 px-2">
                {sortedData.map((region, index) => {
                  const currentValue = viewMode === 'customers' ? region.value : region.revenue;
                  const barHeight = maxValue > 0 ? Math.max((currentValue / maxValue) * 350, 15) : 15;
                  const color = regionColors[index % regionColors.length];

                  return (
                    <div
                      key={region.name}
                      className="flex flex-col items-center group relative flex-shrink-0"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          name: region.name,
                          value: region.value,
                          revenue: region.revenue,
                          viewMode: viewMode
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <div
                        className={`${color} w-10 transition-all duration-700 ease-out hover:opacity-80 cursor-pointer rounded-t-lg shadow-md`}
                        style={{ height: `${barHeight}px` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Legend Cards with Hover Details */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {sortedData.map((region, index) => {
              const color = regionColors[index % regionColors.length];
              const customers = clusters[region.name] || [];
              const avgOrderValue = customers.length > 0 ? region.revenue / region.value : 0;
              const topCustomers = customers.sort((a, b) => b.orderValue - a.orderValue).slice(0, 5);

              return (
                <div
                  key={region.name}
                  className="relative p-3 bg-white rounded-lg border shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-200 cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const popupHeight = 350; // Approximate height of popup
                    const spaceBelow = viewportHeight - rect.bottom;
                    const showAbove = spaceBelow < popupHeight && rect.top > popupHeight;

                    setHoveredRegion(region.name);
                    setPopupPosition({
                      x: rect.left,
                      y: showAbove ? rect.top : rect.bottom,
                      showAbove: showAbove
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredRegion(null);
                    setPopupPosition({ x: 0, y: 0, showAbove: false });
                  }}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="font-semibold text-sm truncate">{region.name}</span>
                  </div>
                  <div className="space-y-1">
                    {viewMode === 'customers' ? (
                      <>
                        <div className="text-lg font-bold text-blue-600">{region.value}</div>
                        <div className="text-xs text-gray-500">customers</div>
                        <div className="text-sm font-semibold text-green-600">£{region.revenue.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">revenue</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-bold text-green-600">£{region.revenue.toFixed(0)}</div>
                        <div className="text-xs text-gray-500">revenue</div>
                        <div className="text-sm font-semibold text-blue-600">{region.value}</div>
                        <div className="text-xs text-gray-400">customers</div>
                      </>
                    )}
                  </div>

                  {/* Hover Popup - Top 5 Customers (Fixed Position) */}
                  {hoveredRegion === region.name && topCustomers.length > 0 && (
                    <div
                      className="fixed w-80 bg-white rounded-lg border-2 border-blue-400 shadow-2xl p-4 z-50 pointer-events-none"
                      style={{
                        left: `${popupPosition.x}px`,
                        top: popupPosition.showAbove ? 'auto' : `${popupPosition.y + 8}px`,
                        bottom: popupPosition.showAbove ? `${window.innerHeight - popupPosition.y + 8}px` : 'auto',
                      }}
                    >
                      <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        <h4 className="font-bold text-base">{region.name}</h4>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-semibold mb-2">Top 5 Customers:</p>
                        {topCustomers.map((customer, idx) => (
                          <div key={customer.id} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                                <span className="font-semibold text-sm text-gray-900">{customer.customerName}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{customer.productPreference}</div>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-bold text-sm text-green-600">£{customer.orderValue.toFixed(0)}</div>
                              <div className="text-xs text-gray-400">{customer.itemCount} items</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {customers.length > 5 && (
                        <div className="mt-2 pt-2 border-t text-center text-xs text-gray-500">
                          +{customers.length - 5} more customers
                        </div>
                      )}
                      {/* Arrow pointing to card */}
                      {popupPosition.showAbove ? (
                        <div className="absolute top-full left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-400"></div>
                      ) : (
                        <div className="absolute bottom-full left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-400"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div >
    </div >
  );
}


