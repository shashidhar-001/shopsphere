import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]); // array of product_ids (numbers)
  const [userId, setUserId]     = useState(null);
  const [loading, setLoading]   = useState(false);

  // ── Listen for auth changes ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadWishlist(uid);
      else setWishlist([]);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid) loadWishlist(uid);
      else setWishlist([]);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Load wishlist from Supabase ─────────────────────────────────────────────
  const loadWishlist = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("product_id")
      .eq("user_id", uid);

    if (!error && data) {
      setWishlist(data.map(item => item.product_id));
    }
    setLoading(false);
  };

  // ── Toggle wishlist item ────────────────────────────────────────────────────
  const toggleWishlist = async (productId) => {
    const isWished = wishlist.includes(productId);

    // Update UI immediately (optimistic)
    setWishlist(prev =>
      isWished ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    if (!userId) return; // guest — just keep in memory

    if (isWished) {
      await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
    } else {
      await supabase
        .from("wishlist_items")
        .insert({ user_id: userId, product_id: productId });
    }
  };

  const isWishlisted   = (productId) => wishlist.includes(productId);
  const wishlistCount  = wishlist.length;

  const clearWishlist = async () => {
    setWishlist([]);
    if (userId) {
      await supabase.from("wishlist_items").delete().eq("user_id", userId);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount,
      loading,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);