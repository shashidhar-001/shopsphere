import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'


const products = [
  { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 299.99, originalPrice: 399.99, rating: 4.8, reviews: 2341, badge: "Best Seller", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", category: "Electronics" },
  { id: 2, name: "Minimalist Leather Watch", price: 189.99, originalPrice: 249.99, rating: 4.6, reviews: 876, badge: "New", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", category: "Fashion" },
  { id: 3, name: "4K Ultra HD Smart Camera", price: 549.99, originalPrice: 699.99, rating: 4.9, reviews: 1203, badge: "Top Rated", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", category: "Electronics" },
  { id: 4, name: "Ergonomic Office Chair", price: 449.99, originalPrice: 599.99, rating: 4.7, reviews: 654, badge: "Deal", img: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80", category: "Home" },
  { id: 5, name: "Running Shoes Pro X", price: 129.99, originalPrice: 179.99, rating: 4.5, reviews: 3421, badge: "Best Seller", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", category: "Sports" },
  { id: 6, name: "Portable Bluetooth Speaker", price: 89.99, originalPrice: 129.99, rating: 4.4, reviews: 987, badge: "Sale", img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", category: "Electronics" },
  { id: 7, name: "Stainless Steel Water Bottle", price: 34.99, originalPrice: 49.99, rating: 4.8, reviews: 5670, badge: "Popular", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80", category: "Sports" },
  { id: 8, name: "Premium Skincare Set", price: 79.99, originalPrice: 110.00, rating: 4.6, reviews: 1120, badge: "New", img: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80", category: "Beauty" },
];

const categories = [
  { name: "Electronics", icon: "⚡", count: "2.4k items", color: "#f59e0b" },
  { name: "Fashion", icon: "👗", count: "5.1k items", color: "#ec4899" },
  { name: "Home & Living", icon: "🏡", count: "3.2k items", color: "#10b981" },
  { name: "Sports", icon: "🏃", count: "1.8k items", color: "#3b82f6" },
  { name: "Beauty", icon: "✨", count: "900 items", color: "#a855f7" },
  { name: "Books", icon: "📚", count: "12k items", color: "#f97316" },
];

const heroSlides = [
  { tag: "New Arrivals", title: "Next-Gen\nTech Awaits", subtitle: "Discover the latest electronics at unbeatable prices", cta: "Shop Electronics", img: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80", accent: "#f59e0b" },
  { tag: "Flash Deal", title: "Fashion\nForward", subtitle: "Up to 60% off on premium fashion brands today only", cta: "Shop Fashion", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80", accent: "#ec4899" },
  { tag: "Limited Time", title: "Home\nEssentials", subtitle: "Transform your space with our curated home collection", cta: "Shop Home", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", accent: "#10b981" },
];

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#f59e0b" : "#3a3a3a"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>{rating}</span>
    </div>
  );
}

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        background: "#141414",
        border: "1px solid #222",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
        animation: `fadeUp 0.5s ease ${index * 0.08}s both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.5)"; e.currentTarget.style.borderColor = "#f59e0b44"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#222"; }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={product.img} alt={product.name} style={{ width: "100%", height: 200, objectFit: "cover", display: "block", transition: "transform 0.4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />
        <div style={{ position: "absolute", top: 10, left: 10, background: "#f59e0b", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5 }}>{product.badge}</div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "#1a1a1a", borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #333", transition: "all 0.2s" }}
          onClick={() => setWished(!wished)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wished ? "#ef4444" : "none"} stroke={wished ? "#ef4444" : "#888"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>-{discount}%</div>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{product.category}</p>
        <h3 style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 600, marginBottom: 8, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.name}</h3>
        <StarRating rating={product.rating} />
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{product.reviews.toLocaleString()} reviews</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 18, color: "#f59e0b", fontWeight: 800 }}>₹{product.price}</span>
          <span style={{ fontSize: 13, color: "#4b5563", textDecoration: "line-through" }}>₹{product.originalPrice}</span>
        </div>
        <button onClick={handleCart} style={{
          width: "100%", padding: "10px", background: addedToCart ? "#10b981" : "#f59e0b",
          color: addedToCart ? "#fff" : "#000", border: "none", borderRadius: 10, fontSize: 13,
          fontWeight: 700, cursor: "pointer", transition: "all 0.2s", letterSpacing: 0.3
        }}>
          {addedToCart ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate()

  const { user, logout } = useAuth()          // ← ADD this
  const [dropdownOpen, setDropdownOpen] = useState(false)  // ← ADD this

  const [heroIdx, setHeroIdx] = useState(0);
  const { cartCount } = useCart();

  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // ADD this useEffect inside HomePage component
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#profile-dropdown')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const slide = heroSlides[heroIdx];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#e5e7eb" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: "#f59e0b", padding: "6px 0", textAlign: "center" }}>
        <p style={{ fontSize: 12, color: "#000", fontWeight: 600, letterSpacing: 0.5 }}>
          🚀 Free shipping on orders over ₹500 · Use code <strong>SAVE20</strong> for 20% off
        </p>
      </div>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: scrolled ? "rgba(10,10,10,0.95)" : "#111",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1f1f1f",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", gap: 24,
        transition: "all 0.3s",
        fontFamily: "'Sora', sans-serif"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 520, position: "relative" }}>
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && searchVal.trim()) {
                navigate(`/products?search=${searchVal.trim()}`)
              }
            }}
            placeholder="Search products, brands, categories..."
            style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, padding: "10px 16px 10px 44px", color: "#e5e7eb", fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
            onFocus={e => e.target.style.borderColor = "#f59e0b"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          {/* Clickable search icon */}
          <svg
            onClick={() => { if (searchVal.trim()) navigate(`/products?search=${searchVal.trim()}`) }}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>


        {/* Nav links */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", fontSize: 14, fontWeight: 500 }}>
          {["Deals", "Categories", "New In"].map(l => (
            <span key={l} style={{ color: "#9ca3af", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#f59e0b"}
              onMouseLeave={e => e.target.style.color = "#9ca3af"}>{l}</span>
          ))}
        </div>

        <div id="profile-dropdown" style={{ display: "flex", gap: 12, alignItems: "center", marginLeft: "auto" }}>
          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            style={{ position: "relative", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#e5e7eb" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span style={{ position: "absolute", top: -4, right: -4, background: "#f59e0b", color: "#000", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
          </button>

          {/* Sign In OR Profile */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(d => !d)}
                style={{ width: 42, height: 42, borderRadius: 12, background: "#f59e0b", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#000" }}
              >
                {user.user_metadata?.full_name?.charAt(0).toUpperCase() || "U"}
              </button>

              {dropdownOpen && (
                <div style={{ position: "absolute", top: 52, right: 0, background: "#141414", border: "1px solid #222", borderRadius: 16, padding: "8px", minWidth: 200, zIndex: 200, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
                  <div style={{ padding: "10px 12px 14px", borderBottom: "1px solid #222", marginBottom: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{user.email}</p>
                  </div>

                  {[
                    { icon: "👤", label: "My Profile", path: "/profile" },
                    { icon: "📦", label: "My Orders", path: "/orders" },
                    { icon: "❤️", label: "Wishlist", path: "/wishlist" },
                    { icon: "⚙️", label: "Settings", path: "/settings" },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", borderRadius: 10, color: "#d1d5db", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1f1f1f"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}

                  <div style={{ borderTop: "1px solid #222", marginTop: 6, paddingTop: 6 }}>
                    <button
                      onClick={async () => { await logout(); setDropdownOpen(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", borderRadius: 10, color: "#ef4444", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1f1f1f"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <span style={{ fontSize: 16 }}>🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{ background: "#f59e0b", border: "none", borderRadius: 12, padding: "10px 18px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
            >
              Sign In
            </button>
          )}
        </div>

      </nav>

      {/* HERO SECTION */}
      <div style={{ position: "relative", height: 540, overflow: "hidden" }}>
        {heroSlides.map((s, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            opacity: i === heroIdx ? 1 : 0,
            transition: "opacity 0.8s ease",
            pointerEvents: i === heroIdx ? "all" : "none"
          }}>
            <img src={s.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)" }} />
          </div>
        ))}

        <div style={{ position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center", padding: "0 60px", fontFamily: "'Sora', sans-serif" }}>
          <div style={{ animation: "slideIn 0.7s ease" }} key={heroIdx}>
            <div style={{ display: "inline-block", background: slide.accent + "22", border: `1px solid ${slide.accent}55`, color: slide.accent, fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>
              {slide.tag}
            </div>
            <h1 style={{ fontSize: 62, fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 16, whiteSpace: "pre-line" }}>{slide.title}</h1>
            <p style={{ fontSize: 17, color: "#d1d5db", maxWidth: 420, lineHeight: 1.6, marginBottom: 32 }}>{slide.subtitle}</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => navigate('/products')}
                style={{ background: slide.accent, color: "#000", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", letterSpacing: 0.3 }}>
                {slide.cta} →
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{ background: "transparent", color: "#fff", border: "1px solid #ffffff44", borderRadius: 14, padding: "14px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                View Deals
              </button>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ position: "absolute", bottom: 24, left: 60, display: "flex", gap: 8, zIndex: 20 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? 32 : 8, height: 8, borderRadius: 4, background: i === heroIdx ? "#f59e0b" : "#ffffff44", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Stats */}
        <div style={{ position: "absolute", bottom: 0, right: 0, display: "flex", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid #222", borderLeft: "1px solid #222", borderRadius: "16px 0 0 0" }}>
          {[["50K+", "Products"], ["4.9★", "Rating"], ["2M+", "Customers"]].map(([val, label]) => (
            <div key={label} style={{ padding: "16px 28px", textAlign: "center", borderRight: "1px solid #222" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding: "60px 40px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Browse</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop by Category</h2>
          </div>
          <span onClick={() => navigate('/products')} style={{ color: "#f59e0b", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {categories.map((cat, i) => (
            <div key={cat.name}
              onClick={() => navigate(`/products?category=${cat.name}`)}
              style={{
                background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "24px 16px",
                textAlign: "center", cursor: "pointer", transition: "all 0.3s",
                animation: `fadeUp 0.5s ease ${i * 0.07}s both`
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.borderColor = cat.color + "66"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>{cat.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{cat.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div style={{ padding: "20px 40px 60px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Hand-picked</p>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Featured Products</h2>
          </div>
          <span
            onClick={() => navigate('/products')}
            style={{ color: "#f59e0b", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>
            View all →
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>

      {/* DEALS BANNER */}
      <div style={{ margin: "0 40px 60px", borderRadius: 24, overflow: "hidden", position: "relative", height: 220 }}>
        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.85), rgba(0,0,0,0.3))", display: "flex", alignItems: "center", padding: "0 60px", gap: 40 }}>
          <div style={{ fontFamily: "'Sora', sans-serif" }}>
            <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, animation: "pulse 2s infinite" }}>⚡ Flash Sale — Ends in 4h 23m</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Up to <span style={{ color: "#f59e0b" }}>70% Off</span></h2>
            <p style={{ fontSize: 15, color: "#d1d5db" }}>On selected electronics and fashion items</p>
          </div>
          <button style={{ marginLeft: "auto", background: "#f59e0b", color: "#000", border: "none", borderRadius: 14, padding: "14px 36px", fontSize: 15, fontWeight: 800, cursor: "pointer", flexShrink: 0, fontFamily: "'Sora', sans-serif" }}>
            Grab Deals →
          </button>
        </div>
      </div>

      {/* WHY US */}
      <div style={{ background: "#0f0f0f", borderTop: "1px solid #1a1a1a", padding: "50px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {[
            { icon: "🚚", title: "Free Delivery", desc: "On all orders over ₹50 nationwide" },
            { icon: "🔄", title: "Easy Returns", desc: "30-day hassle-free return policy" },
            { icon: "🔒", title: "Secure Payment", desc: "256-bit SSL encrypted checkout" },
            { icon: "🎧", title: "24/7 Support", desc: "Expert help anytime you need it" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", animation: `fadeUp 0.5s ease ${i * 0.1}s both` }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#e5e7eb", marginBottom: 4, fontFamily: "'Sora', sans-serif" }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#080808", borderTop: "1px solid #161616", padding: "50px 40px 30px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
              </div>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 260 }}>Your one-stop destination for everything you need — delivered fast, priced right.</p>
            </div>
            {/* Shop column */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Shop</h4>
              {["All Products", "Deals", "New Arrivals", "Best Sellers"].map(l => (
                <div key={l}
                  onClick={() => navigate('/products')}
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#f59e0b"}
                  onMouseLeave={e => e.target.style.color = "#6b7280"}>{l}</div>
              ))}
            </div>

            {/* Account column */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Account</h4>
              {[
                { label: "Sign In", path: "/login" },
                { label: "Register", path: "/login" },
                { label: "Orders", path: "/orders" },
                { label: "Wishlist", path: "/wishlist" },
              ].map(l => (
                <div key={l.label}
                  onClick={() => navigate(l.path)}
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#f59e0b"}
                  onMouseLeave={e => e.target.style.color = "#6b7280"}>{l.label}</div>
              ))}
            </div>

            {/* Help column */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Help</h4>
              {["FAQs", "Shipping", "Returns", "Contact Us"].map(l => (
                <div key={l}
                  style={{ fontSize: 13, color: "#6b7280", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#f59e0b"}
                  onMouseLeave={e => e.target.style.color = "#6b7280"}>{l}</div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", marginBottom: 16, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>Newsletter</h4>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>Get exclusive deals straight to your inbox.</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="your@email.com" style={{ flex: 1, background: "#141414", border: "1px solid #222", borderRadius: 10, padding: "10px 14px", color: "#e5e7eb", fontSize: 13, outline: "none" }} />
                <button style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>→</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #161616", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, color: "#4b5563" }}>© 2025 ShopSphere. All rights reserved.</p>
            <div style={{ display: "flex", gap: 16 }}>
              {["Privacy", "Terms", "Cookies"].map(l => (
                <span key={l} style={{ fontSize: 12, color: "#4b5563", cursor: "pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}