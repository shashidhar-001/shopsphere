import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PRODUCTS, CATEGORIES } from "../data/products";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
  .product-card { transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
  .product-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.5); border-color: #f59e0b44 !important; }
  .filter-btn { transition: all 0.2s; cursor: pointer; }
  .filter-btn:hover { border-color: #f59e0b !important; color: #f59e0b !important; }
`;

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#f59e0b" : "#2a2a2a"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden", cursor: "pointer", animation: `fadeUp 0.4s ease ${index * 0.06}s both` }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: 200, objectFit: "cover", display: "block", transition: "transform 0.4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
        <div style={{ position: "absolute", top: 10, left: 10, background: "#f59e0b", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>{product.badge}</div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "#0a0a0a99", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #333" }}
          onClick={e => { e.stopPropagation(); setWished(w => !w); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#888"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5 }}>-{discount}%</div>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <p style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{product.category} · {product.brand}</p>
        <h3 style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</h3>
        <StarRating rating={product.rating} />
        <p style={{ fontSize: 11, color: "#4b5563", marginTop: 2, marginBottom: 8 }}>{product.reviews.toLocaleString()} reviews</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 17, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>${product.price}</span>
            <span style={{ fontSize: 12, color: "#374151", textDecoration: "line-through" }}>${product.originalPrice}</span>
          </div>
          <span style={{ fontSize: 11, color: product.stock < 10 ? "#ef4444" : "#10b981", fontWeight: 600 }}>
            {product.stock < 10 ? `Only ${product.stock} left!` : "In Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [sort, setSort]             = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 700]);
  const [minRating, setMinRating]   = useState(0);

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") list = list.filter(p => p.category === category);
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    list = list.filter(p => p.rating >= minRating);
    switch (sort) {
      case "price_low":  list.sort((a,b) => a.price - b.price); break;
      case "price_high": list.sort((a,b) => b.price - a.price); break;
      case "rating":     list.sort((a,b) => b.rating - a.rating); break;
      case "newest":     list.sort((a,b) => b.id - a.id); break;
      default: break;
    }
    return list;
  }, [search, category, sort, priceRange, minRating]);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
        </div>
        <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "9px 16px 9px 40px", color: "#e5e7eb", fontSize: 13, outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#f59e0b"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 14px", color: "#e5e7eb", fontSize: 13, outline: "none", cursor: "pointer", marginLeft: "auto" }}>
          <option value="featured">Featured</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="newest">Newest</option>
        </select>
      </nav>

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto", padding: "32px 40px", gap: 28 }}>

        {/* SIDEBAR FILTERS */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "20px", position: "sticky", top: 80 }}>

            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 20 }}>Filters</h3>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Category</p>
              {CATEGORIES.map(cat => (
                <button key={cat} className="filter-btn" onClick={() => setCategory(cat)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", marginBottom: 4, borderRadius: 10, border: `1px solid ${category === cat ? "#f59e0b" : "#1f1f1f"}`, background: category === cat ? "#f59e0b15" : "transparent", color: category === cat ? "#f59e0b" : "#9ca3af", fontSize: 13, fontWeight: category === cat ? 700 : 400 }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Range */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Max Price</p>
              <input type="range" min="0" max="700" value={priceRange[1]} onChange={e => setPriceRange([0, +e.target.value])}
                style={{ width: "100%", accentColor: "#f59e0b" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>$0</span>
                <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>${priceRange[1]}</span>
              </div>
            </div>

            {/* Min Rating */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Min Rating</p>
              {[4.5, 4, 3.5, 0].map(r => (
                <button key={r} className="filter-btn" onClick={() => setMinRating(r)}
                  style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "7px 12px", marginBottom: 4, borderRadius: 10, border: `1px solid ${minRating === r ? "#f59e0b" : "#1f1f1f"}`, background: minRating === r ? "#f59e0b15" : "transparent", color: minRating === r ? "#f59e0b" : "#9ca3af", fontSize: 12, fontWeight: minRating === r ? 700 : 400 }}>
                  <span style={{ color: "#f59e0b" }}>★</span>
                  {r === 0 ? "All Ratings" : `${r}+`}
                </button>
              ))}
            </div>

            {/* Reset */}
            <button onClick={() => { setCategory("All"); setPriceRange([0,700]); setMinRating(0); setSearch(""); }}
              style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #2a2a2a", borderRadius: 10, color: "#6b7280", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#6b7280"; }}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1 }}>

          {/* Results header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
                {category === "All" ? "All Products" : category}
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{filtered.length} products found</p>
            </div>
            {/* Category pills */}
            <div style={{ display: "flex", gap: 8 }}>
              {CATEGORIES.slice(1).map(cat => (
                <button key={cat} onClick={() => setCategory(cat === category ? "All" : cat)}
                  style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${category === cat ? "#f59e0b" : "#222"}`, background: category === cat ? "#f59e0b" : "transparent", color: category === cat ? "#000" : "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>No products found</h3>
              <p style={{ fontSize: 14, color: "#6b7280" }}>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}