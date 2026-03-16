import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { PRODUCTS } from "../data/products";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart]       = useState([]);
  const [userId, setUserId]   = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Listen for auth changes ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadCartFromSupabase(uid);
      else loadCartFromLocal();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadCartFromSupabase(uid);
      else {
        setCart([]);
        loadCartFromLocal();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Load cart from Supabase (logged in) ─────────────────────────────────────
  const loadCartFromSupabase = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", uid);

    if (error) {
      console.error("Cart load error:", error);
      setLoading(false);
      return;
    }

    const items = data
      .map(row => {
        const product = PRODUCTS.find(p => p.id === row.product_id);
        if (!product) return null;
        return { ...product, qty: row.quantity };
      })
      .filter(Boolean);

    setCart(items);
    setLoading(false);
  };

  // ── Load cart from localStorage (guests) ────────────────────────────────────
  const loadCartFromLocal = () => {
    try {
      const saved = localStorage.getItem("shopsphere_guest_cart");
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  };

  // ── Save to localStorage for guests only ────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      localStorage.setItem("shopsphere_guest_cart", JSON.stringify(cart));
    }
  }, [cart, userId]);

  // ── Add to cart ─────────────────────────────────────────────────────────────
  const addToCart = async (product, qty = 1) => {
    const exists = cart.find(item => item.id === product.id);
    const newQty = exists
      ? Math.min(exists.qty + qty, product.stock)
      : qty;

    // Update UI immediately
    setCart(prev => {
      if (exists) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: newQty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });

    // Sync to Supabase if logged in
    if (userId) {
      await supabase.from("cart_items").upsert(
        { user_id: userId, product_id: product.id, quantity: newQty },
        { onConflict: "user_id,product_id" }
      );
    }
  };

  // ── Remove from cart ────────────────────────────────────────────────────────
  const removeFromCart = async (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));

    if (userId) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
    }
  };

  // ── Update quantity ─────────────────────────────────────────────────────────
  const updateQty = async (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);

    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, qty } : item)
    );

    if (userId) {
      await supabase.from("cart_items")
        .update({ quantity: qty })
        .eq("user_id", userId)
        .eq("product_id", productId);
    }
  };

  // ── Clear entire cart ───────────────────────────────────────────────────────
  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("shopsphere_guest_cart");

    if (userId) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", userId);
    }
  };

  // ── Computed values ─────────────────────────────────────────────────────────
  const cartCount    = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartSavings  = cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, cartCount, cartSubtotal, cartSavings,
      loading, addToCart, removeFromCart, updateQty, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);