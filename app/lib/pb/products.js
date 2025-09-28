"use server"
import { globalPB as pb } from "./global";

export async function getAllProducts(options = {}) {
  return await pb.collection('products').getFullList(options);
}

export async function getProdPageById(id) {
  try {
    console.log(`Loading page: ${id}`);
    const page = await pb.collection('pages').getOne(id);

    switch (page.type) {
      case 'SELECTION':
        if (page.selections && page.selections.length > 0) {
          const selectionItems = await pb.collection('page_selection_items').getFullList({
            filter: page.selections.map(selId => `id="${selId}"`).join(' || ')
          });
          page.selections = selectionItems;
          console.log(`Loaded ${selectionItems.length} selection items for page ${id}`);
        }
        break;

      case 'NUMBER':
        if (page.number_inputs && page.number_inputs.length > 0) {
          const numberItems = await pb.collection('page_number_items').getFullList({
            filter: page.number_inputs.map(numId => `id="${numId}"`).join(' || ')
          });
          page.number_inputs = numberItems;
          console.log(`Loaded ${numberItems.length} number inputs for page ${id}`);
        }
        break;
    }

    return page;
  } catch (error) {
    console.error(`Error loading page ${id}:`, error);
    throw new Error(`Failed to load page: ${id}`);
  }
}

