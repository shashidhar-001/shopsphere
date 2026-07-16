import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const ProductContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get auth token helper
const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Load products from Supabase on mount ───────────────────────────────────
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_URL}/api/products`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      // Map backend field names to frontend field names
      const mapped = data.products.map(p => ({
        id:            p.id,
        name:          p.name,
        description:   p.description || "",
        price:         p.price,
        originalPrice: p.original_price || p.price,
        stock:         p.stock || 0,
        category:      p.category || "",
        brand:         p.brand || "",
        images:        p.images?.length ? p.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"],
        badge:         p.badge || "New",
        rating:        p.rating || 0,
        reviews:       p.review_count || 0,
        features:      p.features || [],
        created_at:    p.created_at,
      }));

      setProducts(mapped);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(err.message);
      // Fallback to empty array — no dummy data
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Add product (admin only) ───────────────────────────────────────────────
  const addProduct = async (form) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:          form.name,
          description:   form.description || "",
          price:         +form.price,
          originalPrice: +(form.originalPrice || form.price),
          stock:         +(form.stock || 0),
          category:      form.category || "",
          brand:         form.brand || "",
          badge:         form.badge || "New",
          images:        form.image ? [form.image] : [],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add to local state immediately
      const newProduct = {
        id:            data.product.id,
        name:          data.product.name,
        description:   data.product.description || "",
        price:         data.product.price,
        originalPrice: data.product.original_price || data.product.price,
        stock:         data.product.stock || 0,
        category:      data.product.category || "",
        brand:         data.product.brand || "",
        images:        data.product.images?.length ? data.product.images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"],
        badge:         data.product.badge || "New",
        rating:        0,
        reviews:       0,
        features:      [],
      };

      setProducts(prev => [newProduct, ...prev]);
      return { success: true };
    } catch (err) {
      console.error("Add product error:", err);
      return { success: false, error: err.message };
    }
  };

  // ── Update product (admin only) ────────────────────────────────────────────
  const updateProduct = async (id, form) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:          form.name,
          description:   form.description || "",
          price:         +form.price,
          originalPrice: +(form.originalPrice || form.price),
          stock:         +(form.stock || 0),
          category:      form.category || "",
          brand:         form.brand || "",
          badge:         form.badge || "New",
          images:        form.image ? [form.image] : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === id ? {
          ...p,
          name:          data.product.name,
          description:   data.product.description || "",
          price:         data.product.price,
          originalPrice: data.product.original_price || data.product.price,
          stock:         data.product.stock || 0,
          category:      data.product.category || "",
          brand:         data.product.brand || "",
          badge:         data.product.badge || "New",
          images:        data.product.images?.length ? data.product.images : p.images,
        } : p
      ));
      return { success: true };
    } catch (err) {
      console.error("Update product error:", err);
      return { success: false, error: err.message };
    }
  };

  // ── Delete product (admin only) ────────────────────────────────────────────
  const deleteProduct = async (id) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete product error:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      error,
      fetchProducts,
      addProduct,
      updateProduct,
      deleteProduct,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);