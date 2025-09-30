import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function transformToQuotationItem(finalProdsObject) {
  console.log(finalProdsObject)
  const { id: productId, quantity, userSelections } = finalProdsObject;

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

      default:
        console.warn(`Unknown pageType: ${pageType}`);
    }
  });

  return {
    product: productId,
    product_details: productDetails,
    quantity,
  };
}

