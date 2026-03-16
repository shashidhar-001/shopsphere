import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/products";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
  .thumb { transition: all 0.2s; cursor: pointer; }
  .thumb:hover { border-color: #f59e0b !important; }
  .add-btn { transition: all 0.2s; }
  .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,158,11,0.35); }
  .related-card { transition: transform 0.3s, border-color 0.3s; cursor: pointer; }
  .related-card:hover { transform: translateY(-4px); border-color: #f59e0b44 !important; }
`;

const DUMMY_REVIEWS = [
  { id: 1, name: "Alex M.", rating: 5, date: "Jan 12, 2025", comment: "Absolutely love this product! Exceeded all my expectations. Build quality is top notch and it works exactly as described." },
  { id: 2, name: "Sarah K.", rating: 4, date: "Feb 3, 2025", comment: "Really good product overall. Shipping was fast and packaging was excellent. Minor nitpick on the design but nothing major." },
  { id: 3, name: "James R.", rating: 5, date: "Feb 18, 2025", comment: "Best purchase I've made this year. Highly recommend to anyone looking for quality at a fair price." },
  { id: 4, name: "Priya S.", rating: 4, date: "Mar 1, 2025", comment: "Great value for money. Works perfectly and looks even better in person than in the photos." },
];

function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#f59e0b" : "#2a2a2a"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === Number(id));

  const { addToCart } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  if (!product) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 56 }}>😕</div>
      <h2 style={{ color: "#fff", fontFamily: "'Sora', sans-serif" }}>Product not found</h2>
      <button onClick={() => navigate("/products")} style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
        Back to Products
      </button>
    </div>
  );

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

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
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginLeft: 16 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#f59e0b"} onMouseLeave={e => e.target.style.color = "#6b7280"}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/products")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#f59e0b"} onMouseLeave={e => e.target.style.color = "#6b7280"}>Products</span>
          <span>›</span>
          <span onClick={() => navigate("/products")} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#f59e0b"} onMouseLeave={e => e.target.style.color = "#6b7280"}>{product.category}</span>
          <span>›</span>
          <span style={{ color: "#e5e7eb" }}>{product.name.slice(0, 30)}...</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px" }}>

        {/* ── TOP: IMAGE + INFO ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, marginBottom: 64, animation: "fadeUp 0.5s ease" }}>

          {/* LEFT — Images */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 20, overflow: "hidden", background: "#111", border: "1px solid #1f1f1f", marginBottom: 14, position: "relative" }}>
              <img src={product.images[activeImg]} alt={product.name}
                style={{ width: "100%", height: 440, objectFit: "cover", display: "block", animation: "fadeIn 0.3s ease" }}
                key={activeImg}
              />
              {/* Discount badge */}
              <div style={{ position: "absolute", top: 16, left: 16, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 800, padding: "4px 12px", borderRadius: 8 }}>
                -{discount}% OFF
              </div>
              {/* Wishlist */}
              <button onClick={() => setWished(w => !w)}
                style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", background: "#0a0a0aaa", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#888"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
            {/* Thumbnails */}
            <div style={{ display: "flex", gap: 10 }}>
              {product.images.map((img, i) => (
                <div key={i} className="thumb" onClick={() => setActiveImg(i)}
                  style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", border: `2px solid ${activeImg === i ? "#f59e0b" : "#1f1f1f"}` }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Product Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Badge + Category */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <span style={{ background: "#f59e0b", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 12px", borderRadius: 20 }}>{product.badge}</span>
              <span style={{ background: "#1a1a1a", color: "#9ca3af", fontSize: 10, fontWeight: 600, padding: "3px 12px", borderRadius: 20, border: "1px solid #222" }}>{product.category}</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", lineHeight: 1.3, marginBottom: 12 }}>
              {product.name}
            </h1>

            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
              by <span style={{ color: "#f59e0b", fontWeight: 700 }}>{product.brand}</span>
            </p>

            {/* Rating row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #1a1a1a" }}>
              <StarRating rating={product.rating} size={16} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b" }}>{product.rating}</span>
              <span style={{ fontSize: 13, color: "#4b5563" }}>({product.reviews.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>₹{product.price}</span>
              <div>
                <span style={{ fontSize: 16, color: "#374151", textDecoration: "line-through", display: "block" }}>₹{product.originalPrice}</span>
                <span style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>You save ₹{(product.originalPrice - product.price).toFixed(2)}</span>
              </div>
            </div>

            {/* Features */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {product.features.map(f => (
                <span key={f} style={{ background: "#141414", border: "1px solid #222", color: "#9ca3af", fontSize: 12, padding: "5px 12px", borderRadius: 8 }}>
                  ✓ {f}
                </span>
              ))}
            </div>

            {/* Stock */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: product.stock < 10 ? "#f59e0b" : "#10b981" }} />
              <span style={{ fontSize: 13, color: product.stock < 10 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
                {product.stock < 10 ? `Only ${product.stock} items left!` : `In Stock (${product.stock} available)`}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              {/* Qty */}
              <div style={{ display: "flex", alignItems: "center", background: "#141414", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 42, height: 50, background: "none", border: "none", color: "#e5e7eb", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#1f1f1f"}
                  onMouseLeave={e => e.target.style.background = "none"}>−</button>
                <span style={{ width: 40, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  style={{ width: 42, height: 50, background: "none", border: "none", color: "#e5e7eb", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#1f1f1f"}
                  onMouseLeave={e => e.target.style.background = "none"}>+</button>
              </div>
              {/* Add to cart */}
              <button className="add-btn" onClick={handleAddToCart}
                style={{ flex: 1, height: 50, background: addedToCart ? "#10b981" : "#f59e0b", color: addedToCart ? "#fff" : "#000", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                {addedToCart ? "✓ Added to Cart!" : "Add to Cart"}
              </button>
            </div>

            {/* Buy Now */}
            <button style={{ width: "100%", height: 50, background: "transparent", color: "#e5e7eb", border: "1px solid #2a2a2a", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}
              onMouseEnter={e => { e.target.style.borderColor = "#f59e0b"; e.target.style.color = "#f59e0b"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#e5e7eb"; }}>
              Buy Now
            </button>

            {/* Trust row */}
            <div style={{ display: "flex", gap: 16, marginTop: 20, paddingTop: 20, borderTop: "1px solid #1a1a1a" }}>
              {[["🚚", "Free Shipping"], ["🔄", "30-Day Returns"], ["🛡️", "2yr Warranty"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS: Description / Reviews ── */}
        <div style={{ marginBottom: 64 }}>
          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1a1a1a", marginBottom: 32 }}>
            {["description", "reviews"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab ? "#f59e0b" : "transparent"}`, color: activeTab === tab ? "#f59e0b" : "#6b7280", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", textTransform: "capitalize", transition: "all 0.2s" }}>
                {tab} {tab === "reviews" && `(${DUMMY_REVIEWS.length})`}
              </button>
            ))}
          </div>

          {activeTab === "description" ? (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.8, maxWidth: 720, marginBottom: 28 }}>{product.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {product.features.map(f => (
                  <div key={f} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#f59e0b", fontSize: 18 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {/* Rating summary */}
              <div style={{ display: "flex", alignItems: "center", gap: 32, background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{product.rating}</div>
                  <StarRating rating={product.rating} size={16} />
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>{product.reviews.toLocaleString()} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#6b7280", width: 12 }}>{star}</span>
                      <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>
                      <div style={{ flex: 1, height: 6, background: "#1f1f1f", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#f59e0b", borderRadius: 3, width: star === 5 ? "70%" : star === 4 ? "20%" : "5%" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#4b5563", width: 28 }}>{star === 5 ? "70%" : star === 4 ? "20%" : "5%"}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Individual reviews */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {DUMMY_REVIEWS.map(r => (
                  <div key={r.id} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#000" }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#e5e7eb" }}>{r.name}</p>
                          <p style={{ fontSize: 11, color: "#4b5563" }}>{r.date}</p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>You may also like</p>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Related Products</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
              {related.map(p => (
                <div key={p.id} className="related-card" onClick={() => { navigate(`/products/${p.id}`); window.scrollTo(0, 0); }}
                  style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, overflow: "hidden" }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{p.brand}</p>
                    <h4 style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</h4>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 16, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${p.price}</span>
                      <div style={{ display: "flex", gap: 1 }}>
                        {[1, 2, 3, 4, 5].map(s => <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= Math.round(p.rating) ? "#f59e0b" : "#2a2a2a"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}