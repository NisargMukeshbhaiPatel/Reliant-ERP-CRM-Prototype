"use server"
import { globalPB as pb } from "./global";

export async function createCustomer(customerData) {
  try {
    const customer = await pb.collection('customers').create({
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
    });
    return customer;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to Add customer');
  }
}

export async function updateCustomer(customerId, customerData) {
  try {
    const customer = await pb.collection('customers').update(customerId, {
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
    });
    return customer;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw new Error('Failed to update customer');
  }
}


// TODO: check postcode
export async function checkPostcode(postcode) {
  try {
    return true
  } catch (error) {
    return false;
  }
}

