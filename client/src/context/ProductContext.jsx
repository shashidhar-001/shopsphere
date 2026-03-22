// src/context/ProductContext.jsx
import { createContext, useContext, useState } from "react";
import { PRODUCTS } from "../data/products";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(PRODUCTS);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      price: +product.price,
      originalPrice: +(product.originalPrice || product.price),
      stock: +(product.stock || 0),
      rating: 0,
      reviews: 0,
      features: [],
      images: [product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? {
        ...p, ...data,
        price: +data.price,
        stock: +data.stock,
        images: [data.image || p.images[0]],
      } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);