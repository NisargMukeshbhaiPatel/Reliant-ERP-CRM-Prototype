/**
 * Customer Clustering Utilities
 * Analyzes quotation data to segment customers into meaningful groups
 */

// Calculate total order value including VAT
function calculateOrderValue(quotation) {
  if (!quotation || !quotation.items) return 0;
  // Sum item totals and apply VAT per item if present. VAT could be represented
  // as a decimal (0.2) or as a percentage (20). Handle both.
  return quotation.items.reduce((total, item) => {
    if (!item) return total;

    const priceObj = item.price || {};
    const base = Number(priceObj.base || 0);
    const installation = Number(priceObj.installation || 0);
    const logistics = Number(priceObj.logistics || 0);
    const quantity = Number(item.quantity || 1);

    // VAT can be decimal like 0.2 or percentage like 20
    let vat = priceObj.vat;
    vat = vat == null ? 0 : Number(vat);
    if (vat > 1) vat = vat / 100;

    const lineNet = (base + installation + logistics) * quantity;
    const lineVAT = lineNet * vat;
    return total + lineNet + lineVAT;
  }, 0);
}

// Determine primary product preference using dynamic product names
function getProductPreference(quotation, products) {
  if (!quotation || !quotation.items || !products) return 'Other';

  // Create a map of product titles to IDs for matching
  // Build a lower-cased title map to make matching more robust
  const productTitleMap = products.reduce((map, product) => {
    const title = (product.title || '').toString();
    map[title.toLowerCase()] = product.id;
    return map;
  }, {});

  const productCounts = quotation.items.reduce((counts, item) => {
    if (item.product && item.quantity) {
      // Normalize the product name to match against our product list
      const productTitle = item.product;
      const normalized = productTitle.toLowerCase();
      if (productTitleMap[normalized]) {
        const key = products.find(p => (p.title || '').toLowerCase() === normalized)?.title || productTitle;
        counts[key] = (counts[key] || 0) + item.quantity;
      } else {
        // If exact match fails, try to find a partial match
        const matchedProduct = products.find(p => {
          const t = (p.title || '').toLowerCase();
          return t.includes(normalized) || normalized.includes(t);
        });
        if (matchedProduct) {
          counts[matchedProduct.title] = (counts[matchedProduct.title] || 0) + item.quantity;
        } else {
          counts['Other'] = (counts['Other'] || 0) + item.quantity;
        }
      }
    }
    return counts;
  }, {});

  // Count products by type
  const productTypes = Object.keys(productCounts);
  const totalProductTypes = productTypes.filter(type => type !== 'Other').length;

  if (totalProductTypes > 1) return 'Mixed';
  if (totalProductTypes === 1) return productTypes.find(type => type !== 'Other');
  return 'Other';
}

// Calculate order complexity score
function calculateComplexityScore(quotation) {
  if (!quotation || !quotation.items) return 0;

  let score = 0;

  // Base score for number of items
  score += quotation.items.length * 2;

  // Score for total quantity
  const totalQuantity = quotation.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  score += totalQuantity;

  // Score for customization options (more product details = more complex)
  quotation.items.forEach(item => {
    if (item.product_details && typeof item.product_details === 'object') {
      score += Object.keys(item.product_details).length;
    }
  });

  return score;
}

// Extract geographic region from postcode
function getGeographicRegion(postcode) {
  if (!postcode) return 'Unknown';

  // Normalize postcode: remove spaces and uppercase
  const p = postcode.toString().trim().toUpperCase();
  // Extract initial area letters (1-2 letters) - handle cases like 'EC1A 1BB'
  const areaMatch = p.match(/^[A-Z]{1,2}/);
  const area = areaMatch ? areaMatch[0] : 'Unknown';

  // Map common UK postcode areas to regions
  const regionMap = {
    'CR': 'South London',
    'TR': 'Cornwall',
    'B': 'Birmingham',
    'M': 'Manchester',
    'L': 'Liverpool',
    'LS': 'Leeds',
    'S': 'Sheffield',
    'NE': 'Newcastle',
    'G': 'Glasgow',
    'EH': 'Edinburgh',
    'LE': 'Leicester',
    'WC': 'West Central London',
    'NG': 'Nottingham',
    'TQ': 'Torquay',
    'BH': 'Bournemouth',
    'SE': 'South East London',
    'SW': 'South West London',
    'TW': 'Twickenham',
    'DT': 'Dorchester',
    'PO': 'Portsmouth',
    'GU': 'Guildford',
    'RH': 'Redhill',
    'PA': 'Paisley',
    'PL': 'Plymouth',
    'W': 'West London',
    'EC': 'East Central London'
  };

  return regionMap[area] || `${area} Area`;
}

// Utility: compute customer frequency (repeat vs one-time) from all quotations
function computeCustomerFrequency(quotations) {
  const freq = { repeat: 0, one_time: 0 };
  if (!quotations || quotations.length === 0) return freq;

  const counts = {};
  quotations.forEach(q => {
    const id = q?.customer?.id || q?.customerId || null;
    if (!id) return;
    counts[id] = (counts[id] || 0) + 1;
  });

  Object.values(counts).forEach(c => {
    if (c > 1) freq.repeat++;
    else freq.one_time++;
  });

  return freq;
}

function countQuotationsByStatus(quotations) {
  const statusCounts = {
    FINALIZED: 0,
    REVIEW: 0,
    CANCELLED: 0,
    DRAFT: 0  // add Draft for null status
  };

  if (!quotations || quotations.length === 0) {
    return statusCounts;
  }

  quotations.forEach(quotation => {
    const status = quotation?.status;

    if (!status) {
      statusCounts.DRAFT++;
    } else if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  });

  return statusCounts;
}

/**
 * Main clustering function
 */
export function clusterCustomers(quotations, products) {
  if (!quotations || quotations.length === 0) {
    return {
      clusters: {},
      stats: {
        totalCustomers: 0,
        totalQuotations: 0,
        averageOrderValue: 0,
        totalRevenue: 0,
        statusCounts: {
          FINALIZED: 0,
          REVIEW: 0,
          CANCELLED: 0
        }
      },
      chartData: {
        valueDistribution: [],
        productPreference: [],
        complexityDistribution: [],
        regionalDistribution: []
      }
    };
  }

  // Count quotations by status
  const statusCounts = countQuotationsByStatus(quotations);

  const finalizedQuotations = quotations.filter(q => q.status === 'FINALIZED');

  if (finalizedQuotations.length === 0) {
    return {
      clusters: {},
      stats: {
        totalCustomers: 0,
        totalQuotations: 0,
        averageOrderValue: 0,
        totalRevenue: 0,
        statusCounts
      },
      chartData: {
        valueDistribution: [],
        productPreference: [],
        complexityDistribution: [],
        regionalDistribution: []
      }
    };
  }

  // Process each finalized quotation
  const customerAnalysis = finalizedQuotations.map((quotation, index) => {
    try {
      const orderValue = calculateOrderValue(quotation);
      const productPreference = getProductPreference(quotation, products);
      const complexityScore = calculateComplexityScore(quotation);
      const region = getGeographicRegion(quotation.pincode);

      // Safely extract customer information
      const customer = quotation.customer || {};
      const firstName = customer.first_name || 'Unknown';
      const lastName = customer.last_name || 'Customer';

      return {
        id: quotation.id || `unknown-${index}`,
        customerId: customer.id || `unknown-customer-${index}`,
        customerName: `${firstName} ${lastName}`,
        email: customer.email || 'no-email@example.com',
        orderValue,
        productPreference,
        complexityScore,
        region,
        status: quotation.status || 'UNKNOWN',
        created: quotation.created ? new Date(quotation.created) : new Date(),
        itemCount: quotation.items ? quotation.items.length : 0,
        totalQuantity: quotation.items ? quotation.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0
      };
    } catch (error) {
      console.error(`Error processing quotation at index ${index}:`, error);
      console.error('Problematic quotation:', quotation);
      // Return a safe default
      return {
        id: `error-${index}`,
        customerId: `error-customer-${index}`,
        customerName: 'Error Processing Customer',
        email: 'error@example.com',
        orderValue: 0,
        productPreference: 'Other',
        complexityScore: 0,
        region: 'Unknown',
        status: 'ERROR',
        created: new Date(),
        itemCount: 0,
        totalQuantity: 0
      };
    }
  });

  // Calculate value thresholds
  const orderValues = customerAnalysis.map(c => c.orderValue).filter(val => val > 0).sort((a, b) => a - b);
  const lowThreshold = orderValues.length > 0 ? orderValues[Math.floor(orderValues.length * 0.33)] : 0;
  const highThreshold = orderValues.length > 0 ? orderValues[Math.floor(orderValues.length * 0.67)] : 0;

  // Calculate complexity thresholds
  const complexityScores = customerAnalysis.map(c => c.complexityScore).filter(score => score >= 0).sort((a, b) => a - b);
  const simpleThreshold = complexityScores.length > 0 ? complexityScores[Math.floor(complexityScores.length * 0.5)] : 0;

  // Create clusters with dynamic product preferences
  const allProductPreferences = new Set(customerAnalysis.map(c => c.productPreference));
  const productPreferenceClusters = {};
  allProductPreferences.forEach(pref => {
    const key = pref.toLowerCase().replace(/\s+/g, '_');
    productPreferenceClusters[key] = [];
  });

  const clusters = {
    byValue: {
      high: [],
      medium: [],
      low: []
    },
    byProductPreference: productPreferenceClusters,
    byComplexity: {
      simple: [],
      complex: []
    },
    byRegion: {}
  };

  // Assign customers to clusters
  customerAnalysis.forEach(customer => {
    // Value clustering
    if (customer.orderValue >= highThreshold) {
      clusters.byValue.high.push(customer);
    } else if (customer.orderValue >= lowThreshold) {
      clusters.byValue.medium.push(customer);
    } else {
      clusters.byValue.low.push(customer);
    }

    // Product preference clustering
    const prefKey = customer.productPreference.toLowerCase().replace(/\s+/g, '_');
    if (clusters.byProductPreference[prefKey]) {
      clusters.byProductPreference[prefKey].push(customer);
    }

    // Complexity clustering
    if (customer.complexityScore <= simpleThreshold) {
      clusters.byComplexity.simple.push(customer);
    } else {
      clusters.byComplexity.complex.push(customer);
    }

    // Regional clustering
    if (!clusters.byRegion[customer.region]) {
      clusters.byRegion[customer.region] = [];
    }
    clusters.byRegion[customer.region].push(customer);
  });

  // Calculate statistics
  const totalOrderValue = customerAnalysis.reduce((sum, c) => sum + (c.orderValue || 0), 0);

  // Calculate total quotations from all statuses
  const totalQuotations = statusCounts.DRAFT + statusCounts.REVIEW + statusCounts.FINALIZED + statusCounts.CANCELLED;

  // Calculate total unique customers from ALL quotations (not just finalized)
  const allCustomerIds = new Set();
  quotations.forEach(q => {
    if (q.customer && q.customer.id) {
      allCustomerIds.add(q.customer.id);
    }
  });

  const stats = {
    totalCustomers: allCustomerIds.size,
    totalQuotations: totalQuotations,
    averageOrderValue: customerAnalysis.length > 0 ? totalOrderValue / customerAnalysis.length : 0,
    totalRevenue: totalOrderValue,
    statusCounts
  };

  // Prepare chart data
  const chartData = {
    valueDistribution: [
      { name: 'High Value', value: clusters.byValue.high.length, amount: clusters.byValue.high.reduce((sum, c) => sum + c.orderValue, 0) },
      { name: 'Medium Value', value: clusters.byValue.medium.length, amount: clusters.byValue.medium.reduce((sum, c) => sum + c.orderValue, 0) },
      { name: 'Low Value', value: clusters.byValue.low.length, amount: clusters.byValue.low.reduce((sum, c) => sum + c.orderValue, 0) }
    ],
    productPreference: Object.entries(clusters.byProductPreference).map(([key, customers]) => {
      const displayName = key === 'mixed' ? 'Mixed Products' :
        key === 'other' ? 'Other Products' :
          key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        name: displayName,
        value: customers.length
      };
    }).filter(item => item.value > 0),  // Only include categories with customers
    complexityDistribution: [
      { name: 'Simple Orders', value: clusters.byComplexity.simple.length },
      { name: 'Complex Orders', value: clusters.byComplexity.complex.length }
    ],
    regionalDistribution: Object.entries(clusters.byRegion).map(([region, customers]) => ({
      name: region,
      value: customers.length,
      revenue: customers.reduce((sum, c) => sum + c.orderValue, 0)
    }))
  };

  // Add frequency data (repeat vs one-time) derived from all quotations
  const frequency = computeCustomerFrequency(quotations);
  chartData.frequency = [
    { name: 'Repeat Customers', value: frequency.repeat },
    { name: 'One-time Customers', value: frequency.one_time }
  ];

  return {
    clusters,
    stats,
    chartData,
    rawAnalysis: customerAnalysis
  };
}

/**
 * Get customer insights and recommendations
 */
export function getCustomerInsights(clusteringResult) {
  const { clusters, stats, chartData } = clusteringResult;

  const insights = [];

  // Value insights
  const highValueCustomers = clusters.byValue.high.length;
  const totalCustomers = stats.totalCustomers;
  if (highValueCustomers > 0) {
    insights.push({
      type: 'value',
      title: 'High-Value Customer Segment',
      description: `${highValueCustomers} customers (${((highValueCustomers / totalCustomers) * 100).toFixed(1)}%) represent your premium segment`,
      recommendation: 'Focus on premium product offerings and personalized service for these customers'
    });
  }

  // Product preference insights - find the most popular product type
  const productPrefs = Object.entries(clusters.byProductPreference)
    .filter(([key, customers]) => key !== 'mixed' && key !== 'other' && customers.length > 0)
    .sort(([, a], [, b]) => b.length - a.length);

  if (productPrefs.length > 0) {
    const [topProductKey, topCustomers] = productPrefs[0];
    const topProductName = topProductKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const secondPlace = productPrefs[1];

    insights.push({
      type: 'product',
      title: `${topProductName}-Focused Market`,
      description: `${topCustomers.length} customers prefer ${topProductName.toLowerCase()}${secondPlace ? ` vs ${secondPlace[1].length} for ${secondPlace[0].replace(/_/g, ' ')}` : ''}`,
      recommendation: `Consider expanding ${topProductName.toLowerCase()} product lines and targeted marketing`
    });
  }

  // Regional insights
  const topRegion = chartData.regionalDistribution.reduce((max, region) =>
    region.value > max.value ? region : max, { value: 0 }
  );

  if (topRegion.value > 0) {
    insights.push({
      type: 'geographic',
      title: 'Geographic Concentration',
      description: `${topRegion.name} has ${topRegion.value} customers generating £${topRegion.revenue.toFixed(2)} revenue`,
      recommendation: 'Consider targeted marketing campaigns in high-performing regions'
    });
  }

    // Frequency insight (repeat vs one-time) if available in chartData
    if (chartData.frequency && Array.isArray(chartData.frequency)) {
      const repeat = chartData.frequency.find(f => /repeat/i.test(f.name))?.value || 0;
      const oneTime = chartData.frequency.find(f => /one/i.test(f.name))?.value || 0;
      const totalFreq = repeat + oneTime;
      if (totalFreq > 0) {
        insights.push({
          type: 'frequency',
          title: 'Customer Frequency',
          description: `${repeat} repeat customers and ${oneTime} one-time customers`,
          counts: { repeat, one_time: oneTime },
          recommendation: 'Focus retention efforts on repeat customers and identify opportunities to convert one-time buyers'
        });
      }
    }

  return insights;
}
