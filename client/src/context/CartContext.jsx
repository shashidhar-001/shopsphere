import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // Load cart from localStorage on startup
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("shopsphere_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shopsphere_cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: Math.min(item.qty + qty, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQty = (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    setCart(prev =>
      prev.map(item => item.id === productId ? { ...item, qty } : item)
    );
  };

  // Clear entire cart
  const clearCart = () => setCart([]);

  // Computed values
  const cartCount    = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartSavings  = cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      cartSubtotal,
      cartSavings,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);