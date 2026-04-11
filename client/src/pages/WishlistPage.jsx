import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useResponsive } from "../hooks/useResponsive";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes heartPop { 0% { transform:scale(1); } 50% { transform:scale(1.4); } 100% { transform:scale(1); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }
  .wish-card { transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; }
  .wish-card:hover { transform: translateY(-5px) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important; border-color: #f59e0b44 !important; }
  .cart-btn { transition: all 0.2s; border: none; cursor: pointer; }
  .cart-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.3); }
  .remove-btn { transition: all 0.2s; }
  .remove-btn:hover { background: #ef444433 !important; }
`;

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? "#f59e0b" : "#2a2a2a"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

// ── Wish Card ─────────────────────────────────────────────────────────────────
function WishCard({ product, index }) {
  const navigate               = useNavigate();
  const { toggleWishlist }     = useWishlist();
  const { addToCart }          = useCart();
  const [added, setAdded]      = useState(false);
  const [popping, setPopping]  = useState(false);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPopping(true);
    setTimeout(() => {
      toggleWishlist(product.id);
      setPopping(false);
    }, 300);
  };

  return (
    <div
      className="wish-card"
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        background: "#111",
        border: "1px solid #1f1f1f",
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        animation: `fadeUp 0.4s ease ${index * 0.07}s both`,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={product.images[0]}
          alt={product.name}
          style={{ width: "100%", height: 210, objectFit: "cover", display: "block", transition: "transform 0.4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        />

        {/* Badge */}
        <div style={{ position: "absolute", top: 10, left: 10, background: "#f59e0b", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20 }}>
          {product.badge}
        </div>

        {/* Discount */}
        <div style={{ position: "absolute", bottom: 10, left: 10, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
          -{discount}%
        </div>

        {/* Remove button */}
        <button
          className="remove-btn"
          onClick={handleRemove}
          style={{
            position: "absolute", top: 10, right: 10,
            width: 36, height: 36, borderRadius: "50%",
            background: "#ef444422",
            border: "1.5px solid #ef444466",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            animation: popping ? "heartPop 0.3s ease" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px" }}>
        <p style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
          {product.category} · {product.brand}
        </p>
        <h3 style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 700, lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>
        <StarRating rating={product.rating} />
        <p style={{ fontSize: 11, color: "#4b5563", marginTop: 2, marginBottom: 10 }}>
          {product.reviews?.toLocaleString()} reviews
        </p>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            ${product.price}
          </span>
          <span style={{ fontSize: 12, color: "#374151", textDecoration: "line-through" }}>
            ${product.originalPrice}
          </span>
        </div>

        {/* Stock */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: product.stock < 10 ? "#f59e0b" : "#10b981" }} />
          <span style={{ fontSize: 11, color: product.stock < 10 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>
            {product.stock < 10 ? `Only ${product.stock} left!` : "In Stock"}
          </span>
        </div>

        {/* Add to cart */}
        <button
          className="cart-btn"
          onClick={handleAddToCart}
          style={{
            width: "100%", padding: "11px",
            background: added ? "#10b981" : "#f59e0b",
            color: added ? "#fff" : "#000",
            borderRadius: 12, fontSize: 13, fontWeight: 800,
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {added ? "✓ Added to Cart!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN WISHLIST PAGE ────────────────────────────────────────────────────────
export default function WishlistPage() {
  const navigate                                   = useNavigate();
  const { user }                                   = useAuth();
  const { wishlist, wishlistCount, loading, clearWishlist } = useWishlist();
  const { addToCart }                              = useCart();
  const { products }                               = useProducts();
  const { isMobile, isTablet }                     = useResponsive();

  // Get full product objects matching wishlist ids
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAll = () => {
    wishlistProducts.forEach(p => addToCart(p, 1));
    navigate("/cart");
  };

  const columns = isMobile
    ? "repeat(2, 1fr)"
    : isTablet
    ? "repeat(3, 1fr)"
    : "repeat(4, 1fr)";

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 64 }}>🔒</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Please sign in</h2>
      <p style={{ fontSize: 14, color: "#6b7280" }}>Sign in to view and manage your wishlist</p>
      <button
        onClick={() => navigate("/login")}
        style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
      >
        Sign In →
      </button>
    </div>
  );

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: isMobile ? "0 16px" : "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          {!isMobile && (
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
              Shop<span style={{ color: "#f59e0b" }}>Sphere</span>
            </span>
          )}
        </div>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginLeft: 8 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}
            onMouseEnter={e => e.target.style.color="#f59e0b"}
            onMouseLeave={e => e.target.style.color="#6b7280"}>Home</span>
          <span>›</span>
          <span style={{ color: "#e5e7eb" }}>Wishlist</span>
        </div>

        <button
          onClick={() => navigate("/products")}
          style={{ marginLeft: "auto", background: "transparent", border: "1px solid #222", borderRadius: 10, padding: "8px 16px", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all 0.2s", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
          onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}
        >
          {isMobile ? "Shop →" : "Continue Shopping →"}
        </button>
      </nav>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#ef444418", border: "1px solid #ef444433", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              ❤️
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>
                My Wishlist
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                {loading ? "Loading..." : wishlistCount === 0 ? "No items saved yet" : `${wishlistCount} item${wishlistCount > 1 ? "s" : ""} saved`}
              </p>
            </div>
          </div>

          {wishlistCount > 0 && (
            <button
              onClick={clearWishlist}
              style={{ background: "transparent", border: "1px solid #222", borderRadius: 10, padding: "9px 16px", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.target.style.borderColor="#ef4444"; e.target.style.color="#ef4444"; }}
              onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#6b7280"; }}
            >
              🗑️ {isMobile ? "Clear" : "Clear All"}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1a1a1a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ fontSize: 14, color: "#6b7280" }}>Loading your wishlist...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && wishlistCount === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>💔</div>
            <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 10 }}>
              Your wishlist is empty
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, maxWidth: 340, margin: "0 auto 32px" }}>
              Browse products and tap ❤️ to save items you love
            </p>
            <button
              onClick={() => navigate("/products")}
              style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}
            >
              Discover Products →
            </button>
          </div>
        )}

        {/* Wishlist products */}
        {!loading && wishlistCount > 0 && (
          <>
            {/* Add all to cart banner */}
            <div style={{ background: "#f59e0b12", border: "1px solid #f59e0b22", borderRadius: 14, padding: "14px 20px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, animation: "fadeUp 0.4s ease 0.1s both" }}>
              <p style={{ fontSize: 14, color: "#f59e0b", fontWeight: 600 }}>
                🎁 {wishlistCount} item{wishlistCount > 1 ? "s" : ""} saved
              </p>
              <button
                onClick={handleAddAll}
                style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap" }}
              >
                Add All to Cart →
              </button>
            </div>

            {/* Product grid */}
            <div style={{ display: "grid", gridTemplateColumns: columns, gap: isMobile ? 12 : 20 }}>
              {wishlistProducts.map((product, i) => (
                <WishCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}