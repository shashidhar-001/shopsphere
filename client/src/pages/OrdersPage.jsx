import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { PRODUCTS } from "../data/products";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
  .order-card { transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
  .order-card:hover { border-color: #f59e0b44 !important; transform: translateY(-2px); }
  .filter-tab { transition: all 0.2s; cursor: pointer; }
  .filter-tab:hover { color: #f59e0b !important; border-color: #f59e0b !important; }
`;

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  delivered: { color: "#10b981", bg: "#10b98118", label: "Delivered",  icon: "✅" },
  shipped:   { color: "#3b82f6", bg: "#3b82f618", label: "Shipped",    icon: "🚚" },
  pending:   { color: "#f59e0b", bg: "#f59e0b18", label: "Pending",    icon: "⏳" },
  cancelled: { color: "#ef4444", bg: "#ef444418", label: "Cancelled",  icon: "❌" },
};

// ── Generate timeline ─────────────────────────────────────────────────────────
function getTimeline(status, createdAt) {
  const date = new Date(createdAt);
  const fmt  = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (status === "cancelled") return [
    { label: "Order Placed",     date: fmt(date),                                          done: true },
    { label: "Cancelled",        date: fmt(new Date(date.getTime() + 30 * 60000)),         done: true },
    { label: "Refund Initiated", date: fmt(new Date(date.getTime() + 60 * 60000)),         done: true },
  ];

  return [
    { label: "Order Placed",      date: fmt(date),                                                                              done: true },
    { label: "Payment Confirmed", date: fmt(new Date(date.getTime() + 5 * 60000)),                                              done: true },
    { label: "Packed",            date: status !== "pending"   ? fmt(new Date(date.getTime() + 3600000))   : "Pending",         done: status !== "pending" },
    { label: "Shipped",           date: status === "shipped" || status === "delivered" ? fmt(new Date(date.getTime() + 86400000)) : "Pending", done: status === "shipped" || status === "delivered" },
    { label: "Out for Delivery",  date: status === "delivered" ? fmt(new Date(date.getTime() + 172800000)) : "Pending",         done: status === "delivered" },
    { label: "Delivered",         date: status === "delivered" ? fmt(new Date(date.getTime() + 180000000)) : "Pending",         done: status === "delivered" },
  ];
}

// ── Order Detail Panel ────────────────────────────────────────────────────────
function OrderDetail({ order, onClose }) {
  const s = STATUS[order.status] || STATUS.pending;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end", animation: "fadeIn 0.2s ease" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "#000000aa" }} />
      <div style={{ position: "relative", width: 480, background: "#0d0d0d", borderLeft: "1px solid #1a1a1a", height: "100vh", overflowY: "auto", animation: "slideIn 0.3s ease", zIndex: 10 }}>

        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#0d0d0d", zIndex: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Order Details</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>{order.id}</h2>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Placed on {order.date}</p>
          </div>
          <button onClick={onClose} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", fontSize: 18 }}>×</button>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Status */}
          <div style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif" }}>{s.label}</p>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {order.status === "delivered" ? "Your order has been delivered!" :
                 order.status === "shipped"   ? "Your order is on the way!" :
                 order.status === "pending"   ? "Your order is being processed." :
                 "This order was cancelled."}
              </p>
            </div>
          </div>

          {/* Tracking */}
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 18, fontFamily: "'Sora', sans-serif" }}>Tracking</p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {order.timeline.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: step.done ? "#f59e0b" : "#1f1f1f", border: `2px solid ${step.done ? "#f59e0b" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                      {step.done && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />}
                    </div>
                    {i < order.timeline.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: step.done ? "#f59e0b44" : "#1f1f1f", minHeight: 24 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < order.timeline.length - 1 ? 18 : 0 }}>
                    <p style={{ fontSize: 13, fontWeight: step.done ? 700 : 500, color: step.done ? "#e5e7eb" : "#4b5563" }}>{step.label}</p>
                    <p style={{ fontSize: 11, color: step.done ? "#6b7280" : "#374151", marginTop: 2 }}>{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "20px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14, fontFamily: "'Sora', sans-serif" }}>Items Ordered</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <img src={item.img} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, lineHeight: 1.4 }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Qty: {item.qty}</p>
                  </div>
                  <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 16, paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping + Payment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "16px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>📦 Shipping</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 4 }}>{order.shipping?.firstName} {order.shipping?.lastName}</p>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{order.shipping?.address}</p>
              <p style={{ fontSize: 12, color: "#6b7280" }}>{order.shipping?.city}, {order.shipping?.state}</p>
            </div>
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "16px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>💳 Payment</p>
              <p style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.6 }}>{order.payment}</p>
              <p style={{ fontSize: 11, color: "#10b981", marginTop: 8, fontWeight: 700 }}>✓ Payment Confirmed</p>
            </div>
          </div>

          {/* Actions */}
          {order.status === "delivered" && (
            <button style={{ width: "100%", padding: "13px", background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
              ⭐ Write a Review
            </button>
          )}
          {order.status === "pending" && (
            <button style={{ width: "100%", padding: "13px", background: "transparent", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Cancel Order
            </button>
          )}
          {(order.status === "delivered" || order.status === "cancelled") && (
            <button style={{ width: "100%", padding: "13px", background: "transparent", color: "#9ca3af", border: "1px solid #222", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
              onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
              🔄 Buy Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ORDERS PAGE ──────────────────────────────────────────────────────────
export default function OrdersPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [filter, setFilter]          = useState("all");
  const [selectedOrder, setSelected] = useState(null);
  const [orders, setOrders]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const formatted = data.orders.map(order => ({
        id:       order.id.slice(0, 8).toUpperCase(),
        fullId:   order.id,
        date:     new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status:   order.status,
        total:    order.total,
        items:    (order.order_items || []).map(item => {
          const product = PRODUCTS.find(p => p.id === item.product_id);
          return {
            name:  product?.name     || "Product",
            price: item.price,
            qty:   item.quantity,
            img:   product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
          };
        }),
        shipping: order.shipping_address || {},
        payment:  order.payment_intent_id
          ? `Payment ID: ${order.payment_intent_id.slice(0, 12)}...`
          : "Cash on Delivery",
        timeline: getTimeline(order.status, order.created_at),
      }));

      setOrders(formatted);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not logged in
  if (!user) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Please sign in</h2>
      <p style={{ fontSize: 14, color: "#6b7280" }}>You need to be logged in to view your orders</p>
      <button onClick={() => navigate("/login")}
        style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
        Sign In →
      </button>
    </div>
  );

  const filtered = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

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
          <span style={{ color: "#e5e7eb" }}>My Orders</span>
        </div>
        <button onClick={() => navigate("/products")}
          style={{ marginLeft: "auto", background: "transparent", border: "1px solid #222", borderRadius: 10, padding: "8px 16px", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
          onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
          Continue Shopping →
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f59e0b22", border: "1px solid #f59e0b33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>My Orders</h1>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {user?.user_metadata?.full_name || "Your"}'s order history
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { id: "all",       label: "All Orders", count: orders.length },
            { id: "pending",   label: "Pending",    count: orders.filter(o => o.status === "pending").length   },
            { id: "shipped",   label: "Shipped",    count: orders.filter(o => o.status === "shipped").length   },
            { id: "delivered", label: "Delivered",  count: orders.filter(o => o.status === "delivered").length },
            { id: "cancelled", label: "Cancelled",  count: orders.filter(o => o.status === "cancelled").length },
          ].map(tab => (
            <button key={tab.id} className="filter-tab" onClick={() => setFilter(tab.id)}
              style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${filter === tab.id ? "#f59e0b" : "#222"}`, background: filter === tab.id ? "#f59e0b18" : "transparent", color: filter === tab.id ? "#f59e0b" : "#6b7280", fontSize: 13, fontWeight: filter === tab.id ? 700 : 500, display: "flex", alignItems: "center", gap: 6 }}>
              {tab.label}
              <span style={{ background: filter === tab.id ? "#f59e0b33" : "#1f1f1f", color: filter === tab.id ? "#f59e0b" : "#6b7280", fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 10 }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1a1a1a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, color: "#6b7280" }}>Loading your orders...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: 15, color: "#ef4444", marginBottom: 16 }}>{error}</p>
            <button onClick={fetchOrders}
              style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Try Again
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>No orders found</h3>
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                  You don't have any {filter !== "all" ? filter : ""} orders yet
                </p>
                <button onClick={() => navigate("/products")}
                  style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                  Start Shopping →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filtered.map((order, i) => {
                  const s = STATUS[order.status] || STATUS.pending;
                  const lastDoneStep = [...order.timeline].reverse().find(t => t.done);
                  return (
                    <div key={order.id} className="order-card"
                      onClick={() => setSelected(order)}
                      style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 18, padding: "20px 24px", animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>

                      {/* Top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>{order.id}</span>
                            <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8 }}>
                              {s.icon} {s.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#6b7280" }}>Placed on {order.date}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>${Number(order.total).toFixed(2)}</p>
                          <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{order.items.length} item{order.items.length > 1 ? "s" : ""}</p>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
                        {order.items.map((item, j) => (
                          <div key={j} style={{ position: "relative", flexShrink: 0 }}>
                            <img src={item.img} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid #1f1f1f" }} />
                            {item.qty > 1 && (
                              <span style={{ position: "absolute", top: -4, right: -4, background: "#f59e0b", color: "#000", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.qty}</span>
                            )}
                          </div>
                        ))}
                        <p style={{ fontSize: 13, color: "#9ca3af", marginLeft: 4 }}>
                          {order.items.map(it => it.name).join(", ").slice(0, 60)}
                          {order.items.map(it => it.name).join(", ").length > 60 ? "..." : ""}
                        </p>
                      </div>

                      {/* Status bar */}
                      {order.status !== "cancelled" && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            {["Placed", "Packed", "Shipped", "Delivered"].map((step, idx) => {
                              const stepMap = { 0: 0, 1: 2, 2: 3, 3: 5 };
                              const done = order.timeline[stepMap[idx]]?.done;
                              return (
                                <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: done ? "#f59e0b" : "#1f1f1f", border: `2px solid ${done ? "#f59e0b" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {done && <span style={{ fontSize: 9, color: "#000", fontWeight: 900 }}>✓</span>}
                                  </div>
                                  <span style={{ fontSize: 10, color: done ? "#f59e0b" : "#4b5563", fontWeight: done ? 700 : 400 }}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ height: 3, background: "#1f1f1f", borderRadius: 2, position: "relative", marginTop: 2 }}>
                            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 2, background: "#f59e0b", transition: "width 0.5s ease",
                              width: order.status === "delivered" ? "100%" : order.status === "shipped" ? "66%" : order.status === "pending" ? "16%" : "0%" }} />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                        <p style={{ fontSize: 12, color: "#6b7280" }}>
                          {lastDoneStep ? `Last update: ${lastDoneStep.date}` : ""}
                        </p>
                        <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>View Details →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Side Panel */}
      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelected(null)} />}
    </div>
  );
}