"use server"
import { globalPB as pb } from "./global";
import { createCustomer } from "./customer";
import { isManager } from "./user-actions";

export async function getAllQuotations() {
  if (!await isManager()) {
    throw new Error("Unauthorized: Only managers");
  }

  try {
    const quotations = await pb.collection('quotations').getFullList({
      expand: 'customer,items,items.product',
      sort: '-created'
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
          quotation.expand.items.map(async (item) => {
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
            return {
              id: item.id,
              product: item.expand?.product?.title || item.product, // Get expanded product title
              quantity: item.quantity,
              product_details: productDetails
            };
          })
        );
        return {
          id: quotation.id,
          customer: customer,
          items: items,
          pincode: quotation.pincode,
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

