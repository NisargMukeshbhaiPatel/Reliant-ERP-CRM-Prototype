"use server"
import { globalPB as pb } from "./global";
import { createCustomer } from "./customer";

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

