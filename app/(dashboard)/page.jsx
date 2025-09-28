import { getAllProducts } from "@/lib/pb/products";
import ProductList from "./components/products/product-list";

export default async function ProdPage() {
  let prods;
  try {
    prods = await getAllProducts();
  } catch (error) {
    console.error(error)
    return "ERROR IN LOADING PRODUCTS"
  }

  return <ProductList products={prods} />;
}

