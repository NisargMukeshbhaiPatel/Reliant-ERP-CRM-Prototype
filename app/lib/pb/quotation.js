"use server"
import { globalPB as pb } from "./global";
import { createCustomer } from "./customer";
import { isManager } from "./user-actions";

export async function getAllQuotations() {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers");
  }
  try {
    const quotations = await pb.collection('actual_quotations').getFullList({
      expand: 'customer,items,items.product,prices',
      sort: "-updated"
    });
    return await Promise.all(
      quotations.map(async (quotation) => {
        const customer = {
          id: quotation.expand.customer.id,
          first_name: quotation.expand.customer.first_name,
          last_name: quotation.expand.customer.last_name,
          email: quotation.expand.customer.email,
          phone: quotation.expand.customer.phone,
        };
        const items = await Promise.all(
          quotation.expand.items.map(async (item, index) => {
            const productDetails = {};
            for (const [key, value] of Object.entries(item.product_details)) {
              if (typeof value === 'number') {
                const numberItem = await pb.collection('page_number_items').getOne(key);
                productDetails[key] = {
                  id: numberItem.id,
                  title: numberItem.title,
                  value: value
                };
              } else {
                const page = await pb.collection('pages').getOne(key);
                const selectionItem = await pb.collection('page_selection_items').getOne(value);
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
          })
        );
        return {
          id: quotation.id,
          customer: customer,
          items: items,
          pincode: quotation.pincode,
          price_id: quotation.price_id,
          status: quotation.status,
          created: quotation.created
        };
      })
    );
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
        await pb.collection('quotations_prices').create({
          quotation: quotationId,
          prices: [finalPriceId],
          status: 'REVIEW'
        });
      }
    } else {
      // Update existing price record
      await pb.collection('quotation_item_prices').update(priceId, priceData);
    }

    return finalPriceId;
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

