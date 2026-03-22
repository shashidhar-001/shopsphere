import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }

  .nav-item { transition: all 0.2s; cursor: pointer; border-radius: 10px; }
  .nav-item:hover { background: #1a1a1a !important; color: #f59e0b !important; }
  .stat-card { transition: transform 0.2s, border-color 0.2s; }
  .stat-card:hover { transform: translateY(-3px); border-color: #f59e0b33 !important; }
  .table-row { transition: background 0.15s; }
  .table-row:hover { background: #141414 !important; }
  .action-btn { transition: all 0.15s; cursor: pointer; }
  .action-btn:hover { opacity: 0.8; }
  .admin-input {
    width: 100%; background: #0a0a0a; border: 1.5px solid #222;
    border-radius: 10px; padding: 11px 14px; color: #e5e7eb;
    font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color 0.2s;
  }
  .admin-input:focus { border-color: #f59e0b; }
  .admin-input::placeholder { color: #4b5563; }
`;

// ── Dummy orders data ─────────────────────────────────────────────────────────
const DUMMY_ORDERS = [
  { id: "ORD-001", customer: "Alex Johnson", email: "alex@gmail.com", items: 3, total: 589.97, status: "delivered", date: "Mar 15, 2025" },
  { id: "ORD-002", customer: "Sarah Kim", email: "sarah@gmail.com", items: 1, total: 299.99, status: "shipped", date: "Mar 16, 2025" },
  { id: "ORD-003", customer: "James Roy", email: "james@gmail.com", items: 2, total: 219.98, status: "pending", date: "Mar 17, 2025" },
  { id: "ORD-004", customer: "Priya Singh", email: "priya@gmail.com", items: 4, total: 749.96, status: "delivered", date: "Mar 14, 2025" },
  { id: "ORD-005", customer: "Mike Chen", email: "mike@gmail.com", items: 1, total: 549.99, status: "cancelled", date: "Mar 13, 2025" },
  { id: "ORD-006", customer: "Emma Davis", email: "emma@gmail.com", items: 2, total: 389.98, status: "shipped", date: "Mar 17, 2025" },
  { id: "ORD-007", customer: "Raj Patel", email: "raj@gmail.com", items: 3, total: 459.97, status: "pending", date: "Mar 18, 2025" },
];

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    delivered: { bg: "#10b98122", color: "#10b981", label: "Delivered" },
    shipped: { bg: "#3b82f622", color: "#3b82f6", label: "Shipped" },
    pending: { bg: "#f59e0b22", color: "#f59e0b", label: "Pending" },
    cancelled: { bg: "#ef444422", color: "#ef4444", label: "Cancelled" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
      {s.label}
    </span>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, navigate }) {
  const { logout, user } = useAuth();
  const navItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "products", icon: "📦", label: "Products" },
    { id: "orders", icon: "🛍️", label: "Orders" },
    { id: "customers", icon: "👥", label: "Customers" },
  ];

  return (
    <div style={{ width: 240, background: "#0d0d0d", borderRight: "1px solid #1a1a1a", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, background: "#f59e0b", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 17 }}>S</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
        </div>
        <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Admin Panel</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(item => (
          <div key={item.id} className="nav-item"
            onClick={() => setActive(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: active === item.id ? "#f59e0b18" : "transparent", color: active === item.id ? "#f59e0b" : "#6b7280", fontWeight: active === item.id ? 700 : 500, fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: active === item.id ? "1px solid #f59e0b33" : "1px solid transparent" }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #1a1a1a", marginTop: 16 }}>
          <div className="nav-item"
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", color: "#6b7280", fontSize: 14 }}>
            <span style={{ fontSize: 18 }}>🏠</span> View Store
          </div>
          <div className="nav-item"
            onClick={async () => { await logout(); navigate("/"); }}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
            <span style={{ fontSize: 18 }}>🚪</span> Logout
          </div>
        </div>
      </nav>

      {/* Admin info */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#000", flexShrink: 0 }}>
          {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || "A"}
        </div>
        <div style={{ overflow: "hidden" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.user_metadata?.full_name || "Admin"}</p>
          <p style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>Administrator</p>
        </div>
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab() {
  const stats = [
    { label: "Total Revenue", value: "$48,290", change: "+12.5%", up: true, icon: "💰", color: "#f59e0b" },
    { label: "Total Orders", value: "1,284", change: "+8.2%", up: true, icon: "📦", color: "#3b82f6" },
    { label: "Total Customers", value: "3,847", change: "+15.1%", up: true, icon: "👥", color: "#10b981" },
    { label: "Cancelled", value: "23", change: "-4.3%", up: false, icon: "❌", color: "#ef4444" },
  ];

  const recentOrders = DUMMY_ORDERS.slice(0, 5);

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Dashboard Overview</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card"
            style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "20px", animation: `fadeUp 0.4s ease ${i * 0.08}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#10b981" : "#ef4444", background: s.up ? "#10b98122" : "#ef444422", padding: "3px 8px", borderRadius: 6 }}>{s.change}</span>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Recent Orders</h3>
          <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, cursor: "pointer" }}>View all →</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d0d0d" }}>
              {["Order ID", "Customer", "Items", "Total", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o, i) => (
              <tr key={o.id} className="table-row" style={{ borderTop: "1px solid #1a1a1a", animationDelay: `${i * 0.05}s` }}>
                <td style={{ padding: "14px 24px", fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>{o.id}</td>
                <td style={{ padding: "14px 24px" }}>
                  <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{o.customer}</p>
                  <p style={{ fontSize: 11, color: "#6b7280" }}>{o.email}</p>
                </td>
                <td style={{ padding: "14px 24px", fontSize: 13, color: "#9ca3af" }}>{o.items} items</td>
                <td style={{ padding: "14px 24px", fontSize: 14, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${o.total}</td>
                <td style={{ padding: "14px 24px" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "14px 24px", fontSize: 12, color: "#6b7280" }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PRODUCTS TAB ──────────────────────────────────────────────────────────────
function ProductsTab() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", stock: "", badge: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    deleteProduct(id);
    showToast("Product deleted successfully");
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({ name: product.name, price: product.price, category: product.category, stock: product.stock, badge: product.badge });
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return showToast("Please fill required fields", "error");
    if (editId) {
      updateProduct(editId, form);
      showToast("Product updated successfully");
    } else {
      addProduct(form);
      showToast("Product added successfully");
    }
    setShowAdd(false);
    setEditId(null);
    setForm({ name: "", price: "", category: "", stock: "", badge: "", originalPrice: "", brand: "", description: "", image: "" });
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999, background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, animation: "fadeIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {toast.type === "success" ? "✅ " : "❌ "}{toast.msg}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Products</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>{products.length} total products</p>
        </div>
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: "", price: "", category: "", stock: "", badge: "" }); }}
          style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "11px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
          + Add Product
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease", padding: "20px" }}>
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: "28px", width: 480, maxHeight: "90vh", overflowY: "auto", animation: "fadeUp 0.3s ease" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 24 }}>
              {editId ? "Edit Product" : "Add New Product"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Product Name *", key: "name", placeholder: "e.g. Wireless Headphones" },
                { label: "Price ($) *", key: "price", placeholder: "e.g. 299.99" },
                { label: "Original Price", key: "originalPrice", placeholder: "e.g. 399.99" },
                { label: "Category", key: "category", placeholder: "e.g. Electronics" },
                { label: "Brand", key: "brand", placeholder: "e.g. Sony" },
                { label: "Stock", key: "stock", placeholder: "e.g. 50" },
                { label: "Badge", key: "badge", placeholder: "e.g. Best Seller" },
                { label: "Description", key: "description", placeholder: "Product description..." },
                { label: "Image URL *", key: "image", placeholder: "https://images.unsplash.com/..." },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, display: "block", fontFamily: "'Sora', sans-serif" }}>{f.label}</label>
                  <input className="admin-input" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(d => ({ ...d, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={() => { setShowAdd(false); setEditId(null); }}
                style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #222", borderRadius: 10, color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave}
                style={{ flex: 1, padding: "12px", background: "#f59e0b", border: "none", borderRadius: 10, color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                {editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input className="admin-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d0d0d" }}>
              {["Product", "Category", "Price", "Stock", "Badge", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="table-row" style={{ borderTop: "1px solid #1a1a1a" }}>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover" }} />
                    <div>
                      <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#6b7280" }}>{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 12, color: "#9ca3af" }}>{p.category}</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${p.price}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ fontSize: 12, color: p.stock < 10 ? "#ef4444" : "#10b981", fontWeight: 700 }}>{p.stock} units</span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ background: "#f59e0b22", color: "#f59e0b", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>{p.badge}</span>
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="action-btn" onClick={() => handleEdit(p)}
                      style={{ background: "#3b82f622", color: "#3b82f6", border: "1px solid #3b82f633", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Edit
                    </button>
                    <button className="action-btn" onClick={() => handleDelete(p.id)}
                      style={{ background: "#ef444422", color: "#ef4444", border: "1px solid #ef444433", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ORDERS TAB ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Orders</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>{orders.length} total orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <input className="admin-input" placeholder="Search orders or customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        {["all", "pending", "shipped", "delivered", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${filter === f ? "#f59e0b" : "#222"}`, background: filter === f ? "#f59e0b22" : "transparent", color: filter === f ? "#f59e0b" : "#6b7280", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}>
            {f === "all" ? "All Orders" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d0d0d" }}>
              {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="table-row" style={{ borderTop: "1px solid #1a1a1a" }}>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>{o.id}</td>
                <td style={{ padding: "14px 20px" }}>
                  <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{o.customer}</p>
                  <p style={{ fontSize: 11, color: "#6b7280" }}>{o.email}</p>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#9ca3af" }}>{o.items} items</td>
                <td style={{ padding: "14px 20px", fontSize: 14, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${o.total}</td>
                <td style={{ padding: "14px 20px" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "14px 20px", fontSize: 12, color: "#6b7280" }}>{o.date}</td>
                <td style={{ padding: "14px 20px" }}>
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                    style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "6px 10px", color: "#e5e7eb", fontSize: 12, cursor: "pointer", outline: "none" }}>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14 }}>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CUSTOMERS TAB ─────────────────────────────────────────────────────────────
function CustomersTab() {
  const customers = [
    { name: "Alex Johnson", email: "alex@gmail.com", orders: 8, spent: "$1,240", joined: "Jan 2025", status: "active" },
    { name: "Sarah Kim", email: "sarah@gmail.com", orders: 3, spent: "$589", joined: "Feb 2025", status: "active" },
    { name: "James Roy", email: "james@gmail.com", orders: 12, spent: "$2,890", joined: "Dec 2024", status: "active" },
    { name: "Priya Singh", email: "priya@gmail.com", orders: 1, spent: "$299", joined: "Mar 2025", status: "active" },
    { name: "Mike Chen", email: "mike@gmail.com", orders: 5, spent: "$749", joined: "Jan 2025", status: "inactive" },
    { name: "Emma Davis", email: "emma@gmail.com", orders: 7, spent: "$1,120", joined: "Nov 2024", status: "active" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Customers</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>{customers.length} registered customers</p>
      </div>

      <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d0d0d" }}>
              {["Customer", "Orders", "Total Spent", "Joined", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 24px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 0.8, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i} className="table-row" style={{ borderTop: "1px solid #1a1a1a" }}>
                <td style={{ padding: "14px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#000", flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: "#6b7280" }}>{c.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 24px", fontSize: 13, color: "#9ca3af" }}>{c.orders} orders</td>
                <td style={{ padding: "14px 24px", fontSize: 14, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>{c.spent}</td>
                <td style={{ padding: "14px 24px", fontSize: 12, color: "#6b7280" }}>{c.joined}</td>
                <td style={{ padding: "14px 24px" }}>
                  <span style={{ background: c.status === "active" ? "#10b98122" : "#6b707022", color: c.status === "active" ? "#10b981" : "#6b7280", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8 }}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [active, setActive] = useState("overview");

  // Block non-admins
  if (loading) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: 32, height: 32, border: "3px solid #1a1a1a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
    </div>
  );

  if (!user || role !== "admin") return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 64 }}>🚫</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Access Denied</h2>
      <p style={{ fontSize: 14, color: "#6b7280" }}>You don't have permission to view this page.</p>
      <button onClick={() => navigate("/")}
        style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
        Go Home
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <Sidebar active={active} setActive={setActive} navigate={navigate} />
      <main style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        {active === "overview" && <OverviewTab />}
        {active === "products" && <ProductsTab />}
        {active === "orders" && <OrdersTab />}
        {active === "customers" && <CustomersTab />}
      </main>
    </div>
  );
}