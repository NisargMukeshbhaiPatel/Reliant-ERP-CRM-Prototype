import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

//quotation utils
export function transformToQuotationItem(finalProdsArray) {
  return finalProdsArray.map(finalProdsObject => {
    const { product, quantity, userSelections } = finalProdsObject;
    const productDetails = {};

    userSelections.forEach(selection => {
      const { pageId, pageType, userInput } = selection;
      switch (pageType) {
        case 'SELECTION':
          // Store the selected item's id
          productDetails[pageId] = userInput.id;
          break;
        case 'NUMBER':
          // Extract all number input values
          Object.entries(userInput).forEach(([key, data]) => {
            productDetails[key] = data.value;
          });
          break;
        case 'TEXT':
          productDetails[pageId] = userInput.value
          break;
        default:
          console.warn(`Unknown pageType: ${pageType}`);
      }
    });

    return {
      product: product.id,
      product_details: productDetails,
      quantity,
    };
  });
}

export function matchQuery(q, query) {
  if (!query) return true
  const needle = query.trim().toLowerCase()
  const fields = []

  fields.push(q.id || "", q.pincode || "", q.created || "")

  const c = q.customer || {}
  fields.push(c.first_name || "", c.last_name || "", c.email || "", c.phone || "")

  q.items?.forEach(item => {
    fields.push(item.product || "", String(item.quantity ?? ""))

    Object.values(item.product_details || {}).forEach(entry => {
      if ("selection" in entry) {
        fields.push(entry.pageTitle || "", entry.selection?.title || "")
      } else {
        fields.push(entry.title || "", String(entry.value ?? ""))
      }
    })
  })

  return fields.join(" ").toLowerCase().includes(needle)
}


export function productChips(quotation) {
  const products = quotation.items?.map((item) => item.product) || [];
  return [...new Set(products)];
}

/*
export function collectPreviewImages(quotation, limit = 3) {
  const images = [];

  for (const item of quotation.items || []) {
    if (images.length >= limit) break;

    const details = item.product_details || {};
    for (const [key, entry] of Object.entries(details)) {
      if (images.length >= limit) break;

      const parsed = detailLabelAndValue(entry);
      if (parsed.image) {
        images.push({
          recordId: parsed.id,
          filename: parsed.image,
          alt: parsed.label || key,
        });
      }
    }
  }

  return images;
}
*/

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


export function detailLabelAndValue(entry) {
  if ("selection" in entry) {
    return {
      id: entry.selection.id,
      label: entry.pageTitle,
      value: entry.selection?.title ?? "",
      image: entry.selection?.image,
    }
  }
  return {
    label: entry.title,
    value: String(entry.value ?? ""),//for num/text only product config values
    image: undefined,
  }
}
