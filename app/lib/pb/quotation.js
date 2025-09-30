"use server"
import { globalPB as pb } from "./global";

export async function saveQuotationItem(quotationItem) {
  try {
    const record = await pb.collection('quotation_items').create(quotationItem);
    console.log('Quotation item saved:', record);
    return record;
  } catch (error) {
    console.error('Error saving quotation item:', error);
    throw error;
  }
}

