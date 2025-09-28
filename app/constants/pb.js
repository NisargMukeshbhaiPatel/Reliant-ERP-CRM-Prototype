export const PB_URL =
  "https://pb-reliant-proto.fly.dev/"

export const getProductImageUrl = (collectionId, recordId, filename) =>
  filename ? `${PB_URL}api/files/${collectionId}/${recordId}/${filename}` : "";


export const getPageItemImageUrl = (recordId, filename) =>
  recordId && filename ? `${PB_URL}api/files/pbc_1130117620/${recordId}/${filename}` : "";

