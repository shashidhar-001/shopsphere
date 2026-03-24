import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
  .cart-item { transition: border-color 0.2s; animation: fadeUp 0.4s ease both; }
  .cart-item:hover { border-color: #2a2a2a !important; }
  .qty-btn { transition: background 0.2s; }
  .qty-btn:hover { background: #2a2a2a !important; }
  .remove-btn { transition: color 0.2s; }
  .remove-btn:hover { color: #ef4444 !important; }
  .checkout-btn { transition: all 0.2s; }
  .checkout-btn:hover { background: #fbbf24 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
`;

function CartItem({ item, index }) {
  const { updateQty, removeFromCart } = useCart();
  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  return (
    <div className="cart-item" style={{
      display: "flex", gap: 20, padding: "20px", background: "#111",
      border: "1px solid #1f1f1f", borderRadius: 16, marginBottom: 14,
      animationDelay: `${index * 0.08}s`
    }}>
      {/* Product image */}
      <div style={{ width: 100, height: 100, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
        <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Product info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              {item.category} · {item.brand}
            </p>
            <h3 style={{ fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 6, maxWidth: 400 }}>
              {item.name}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>₹{item.price}</span>
              <span style={{ fontSize: 13, color: "#374151", textDecoration: "line-through" }}>₹{item.originalPrice}</span>
              <span style={{ fontSize: 11, background: "#ef444422", color: "#ef4444", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>-{discount}%</span>
            </div>
          </div>

          {/* Remove button */}
          <button className="remove-btn" onClick={() => removeFromCart(item.id)}
            style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Remove
          </button>
        </div>

        {/* Qty + subtotal row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          {/* Qty controls */}
          <div style={{ display: "flex", alignItems: "center", background: "#1a1a1a", border: "1px solid #222", borderRadius: 10, overflow: "hidden" }}>
            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}
              style={{ width: 36, height: 36, background: "none", border: "none", color: "#e5e7eb", fontSize: 16, cursor: "pointer" }}>−</button>
            <span style={{ width: 36, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{item.qty}</span>
            <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}
              style={{ width: 36, height: 36, background: "none", border: "none", color: "#e5e7eb", fontSize: 16, cursor: "pointer" }}>+</button>
          </div>

          {/* Item total */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Item total</p>
            <p style={{ fontSize: 18, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              ₹{(item.price * item.qty).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartSubtotal, cartSavings, clearCart } = useCart();
  const [coupon, setCoupon]   = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null);

  const shipping = cartSubtotal > 50 ? 0 : 9.99;
  const tax      = cartSubtotal * 0.08;
  const total    = cartSubtotal + shipping + tax - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === "SAVE20") {
      const d = cartSubtotal * 0.2; 
      setDiscount(d);
      setCouponMsg({ text: `20% discount applied! You save ₹${d.toFixed(2)}`, type: "success" });
    } else if (coupon.toUpperCase() === "FREE10") {
      setDiscount(10);
      setCouponMsg({ text: "$10 discount applied!", type: "success" });
    } else {
      setDiscount(0);
      setCouponMsg({ text: "Invalid coupon code.", type: "error" });
    }
    setTimeout(() => setCouponMsg(null), 3000);
  };

  // ── EMPTY CART ──
  if (cart.length === 0) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
        </div>
      </nav>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 16, animation: "fadeIn 0.5s ease" }}>
        <div style={{ fontSize: 80 }}>🛒</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Your cart is empty</h2>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 8 }}>Looks like you haven't added anything yet</p>
        <button onClick={() => navigate("/products")}
          style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          Start Shopping →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginLeft: 16 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="#6b7280"}>Home</span>
          <span>›</span>
          <span style={{ color: "#e5e7eb" }}>Cart</span>
        </div>
        <button onClick={() => navigate("/products")} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #222", borderRadius: 10, padding: "8px 16px", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          ← Continue Shopping
        </button>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
              My Cart
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{cartCount} item{cartCount !== 1 ? "s" : ""} in your cart</p>
          </div>
          <button onClick={clearCart}
            style={{ background: "none", border: "1px solid #222", borderRadius: 10, padding: "8px 16px", color: "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.borderColor="#ef4444"; e.target.style.color="#ef4444"; }}
            onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#6b7280"; }}>
            🗑️ Clear Cart
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28 }}>

          {/* LEFT — Cart Items */}
          <div>
            {cart.map((item, i) => <CartItem key={item.id} item={item} index={i} />)}

            {/* Savings banner */}
            {cartSavings > 0 && (
              <div style={{ background: "#10b98115", border: "1px solid #10b98133", borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                <span style={{ fontSize: 20 }}>🎉</span>
                <p style={{ fontSize: 14, color: "#10b981", fontWeight: 600 }}>
                  You're saving <strong>₹{cartSavings.toFixed(2)}</strong> on this order!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT — Order Summary */}
          <div style={{ position: "sticky", top: 80, height: "fit-content" }}>
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, padding: "24px", animation: "fadeUp 0.4s ease" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 20 }}>
                Order Summary
              </h2>

              {/* Price rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#9ca3af" }}>Subtotal ({cartCount} items)</span>
                  <span style={{ color: "#e5e7eb", fontWeight: 600 }}>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                {cartSavings > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#10b981" }}>Savings</span>
                    <span style={{ color: "#10b981", fontWeight: 600 }}>-₹{cartSavings.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#9ca3af" }}>Shipping</span>
                  <span style={{ color: shipping === 0 ? "#10b981" : "#e5e7eb", fontWeight: 600 }}>
                    {shipping === 0 ? "FREE 🎉" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#9ca3af" }}>Tax (8%)</span>
                  <span style={{ color: "#e5e7eb", fontWeight: 600 }}>₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#f59e0b" }}>Coupon Discount</span>
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>₹{total.toFixed(2)}</span>
              </div>

              {/* Free shipping notice */}
              {shipping > 0 && (
                <div style={{ background: "#f59e0b15", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
                  🚚 Add ${(50 - cartSubtotal).toFixed(2)} more for FREE shipping!
                </div>
              )}

              {/* Coupon */}
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Coupon Code</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="e.g. SAVE20"
                    style={{ flex: 1, background: "#1a1a1a", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#e5e7eb", fontSize: 13, outline: "none" }}
                    onFocus={e => e.target.style.borderColor="#f59e0b"}
                    onBlur={e => e.target.style.borderColor="#222"}
                    onKeyDown={e => e.key === "Enter" && applyCoupon()}
                  />
                  <button onClick={applyCoupon}
                    style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#f59e0b", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Apply
                  </button>
                </div>
                {couponMsg && (
                  <p style={{ fontSize: 12, marginTop: 6, color: couponMsg.type === "success" ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                    {couponMsg.type === "success" ? "✓ " : "✗ "}{couponMsg.text}
                  </p>
                )}
                <p style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>Try: SAVE20 or FREE10</p>
              </div>

              {/* Checkout button */}
              <button className="checkout-btn" onClick={() => navigate("/checkout")}
                style={{ width: "100%", padding: "16px", background: "#f59e0b", color: "#000", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
                Proceed to Checkout →
              </button>

              <button onClick={() => navigate("/products")}
                style={{ width: "100%", padding: "13px", background: "transparent", color: "#9ca3af", border: "1px solid #222", borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
                onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
                ← Continue Shopping
              </button>

              {/* Trust badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, paddingTop: 20, borderTop: "1px solid #1a1a1a" }}>
                {[["🔒", "Secure"], ["🚚", "Fast"], ["🔄", "Returns"]].map(([icon, label]) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 10, color: "#4b5563", fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}