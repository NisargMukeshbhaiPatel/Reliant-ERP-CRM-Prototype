"use server"
import { globalPB as pb } from "./global";
import { createCustomer } from "./customer";
import { isManager } from "./user-actions";

export async function getAllQuotations() {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers");
  }
  try {
    const [quotations, numberItems, selectionItems, pages] = await Promise.all([
      pb.collection('actual_quotations').getFullList({
        expand: 'customer,items,items.product,prices',
        sort: '-created'
      }),
      pb.collection('page_number_items').getFullList(),
      pb.collection('page_selection_items').getFullList(),
      pb.collection('pages').getFullList()
    ]);

    // Create lookup maps for O(1) access
    const numberItemsMap = new Map(numberItems.map(item => [item.id, item]));
    const selectionItemsMap = new Map(selectionItems.map(item => [item.id, item]));
    const pagesMap = new Map(pages.map(page => [page.id, page]));

    return quotations.map(quotation => {
      const customer = {
        id: quotation.expand.customer.id,
        first_name: quotation.expand.customer.first_name,
        last_name: quotation.expand.customer.last_name,
        email: quotation.expand.customer.email,
        phone: quotation.expand.customer.phone,
      };

      const items = quotation.expand.items.map((item, index) => {
        const productDetails = {};
        for (const [key, value] of Object.entries(item.product_details || {})) {
          if (typeof value === 'number') {
            const numberItem = numberItemsMap.get(key);
            if (numberItem) {
              productDetails[key] = {
                id: numberItem.id,
                title: numberItem.title,
                value: value
              };
            }
          } else {
            const page = pagesMap.get(key);
            const selectionItem = selectionItemsMap.get(value);
            if (page && selectionItem) {
              productDetails[key] = {
                pageId: page.id,
                pageTitle: page.title,
                selection: {
                  id: selectionItem.id,
                  title: selectionItem.title,
                  image: selectionItem.image
                }
              };
            }
          }
        }

        // Get the corresponding price for this item using the same index
        const priceData = quotation.expand.prices?.[index];
        const price = priceData ? {
          id: priceData.id,
          base: priceData.base,
          installation: priceData.installation,
          logistics: priceData.logistics,
          vat: priceData.vat
        } : null;

        return {
          id: item.id,
          product: item.expand?.product?.title || item.product,
          quantity: item.quantity,
          product_details: productDetails,
          price: price
        };
      });

      return {
        id: quotation.id,
        customer: customer,
        items: items,
        pincode: quotation.pincode,
        price_id: quotation.price_id,
        status: quotation.status,
        created: quotation.created
      };
    });
  } catch (error) {
    throw error;
  }
}

export async function saveQuotation(quotationItems, customerData) {
  try {
    let customer;
    try {
      const existingCustomers = await pb.collection('customers').getList(1, 1, {
        filter: `email = "${customerData.email}"`
      });

      if (existingCustomers.items.length > 0) {
        customer = existingCustomers.items[0];
      } else {
        customer = await createCustomer(customerData);
      }
    } catch (error) {
      console.error('Error checking/creating customer:', error);
      throw error;
    }

    //save all quotation items
    const quotationItemIds = [];
    for (const item of quotationItems) {
      try {
        const record = await pb.collection('quotation_items').create(item);
        quotationItemIds.push(record.id);
        console.log('Quotation item saved:', record);
      } catch (error) {
        console.error('Error saving quotation item:', error);
        throw error;
      }
    }

    //Crate quotation record linking customer and items
    const quotation = await pb.collection('quotations').create({
      customer: customer.id,
      items: quotationItemIds,
      pincode: customerData.postcode,
    });

    return {
      customer,
      quotation,
      quotationItemIds
    };

  } catch (error) {
    console.error('Error saving quotation:', error);
    throw error;
  }
}

export async function updateQuotationItemPrice(priceId, { base, installation, logistics, vat }, itemId, quotationId) {
  try {
    const priceData = {
      base: base ?? null,
      installation: installation ?? null,
      logistics: logistics ?? null,
      vat: vat ?? null,
    };

    let finalPriceId = priceId;
    let quotationPriceId = quotationId;

    // If priceId doesn't exist, create new records
    if (!priceId) {
      priceData.item = itemId;
      const newItemPrice = await pb.collection('quotation_item_prices').create(priceData);
      finalPriceId = newItemPrice.id;

      //checkie checkie if quotations_prices exists for this quotation
      let quotationPrice;
      try {
        quotationPrice = await pb.collection('quotations_prices').getFirstListItem(
          `quotation="${quotationId}"`
        );

        // Update existing quotations_prices with the new price id
        const updatedPrices = [...(quotationPrice.prices || []), finalPriceId];
        await pb.collection('quotations_prices').update(quotationPrice.id, {
          prices: updatedPrices
        });
      } catch (error) {
        // quotations_prices doesn't exist, create it
        const newQuoPrice = await pb.collection('quotations_prices').create({
          quotation: quotationId,
          prices: [finalPriceId],
          status: 'REVIEW'
        });
        quotationPriceId = newQuoPrice.id
      }
    } else {
      // Update existing price record
      await pb.collection('quotation_item_prices').update(priceId, priceData);
    }

    return quotationPriceId;
  } catch (error) {
    console.error('Error updating quotation item price:', error);
    throw error;
  }
}

export async function updateQuotationPriceStatus(quotationPriceId, status) {
  try {
    const record = await pb.collection('quotations_prices').update(quotationPriceId, { status });
    console.log('Quotation price status updated:', record);
    return true;
  } catch (error) {
    console.error('Error updating quotation price status:', error);
    throw error;
  }
}

export async function updateQuotationPin(quotationId, newPincode) {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers");
  }
  try {
    const updated = await pb.collection('quotations').update(quotationId, {
      pincode: newPincode
    });
    return updated;
  } catch (error) {
    console.error('Error updating pincode:', error);
    throw error;
  }
}
