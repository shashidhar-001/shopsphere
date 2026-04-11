import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../supabase";
import { useResponsive } from "../hooks/useResponsive";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes spin   { to { transform:rotate(360deg); } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }

  .settings-row { transition: background 0.2s; }
  .settings-row:hover { background: #161616 !important; }
  .danger-btn { transition: all 0.2s; cursor: pointer; }
  .danger-btn:hover { background: #ef444418 !important; border-color: #ef4444 !important; color: #ef4444 !important; }
  .section-card { animation: fadeUp 0.4s ease both; }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const colors = { success: "#10b981", error: "#ef4444", info: "#3b82f6", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999, background: colors[type] || "#333", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, animation: "fadeIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8, maxWidth: 340 }}>
      {type === "success" ? "✅" : type === "error" ? "❌" : type === "warning" ? "⚠️" : "ℹ️"} {msg}
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 12, background: value ? "#f59e0b" : "#2a2a2a", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function Section({ title, icon, children, delay = 0 }) {
  return (
    <div className="section-card" style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 18, overflow: "hidden", animationDelay: `${delay}s` }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>{title}</h3>
      </div>
      <div style={{ padding: "8px 0" }}>{children}</div>
    </div>
  );
}

// ── Settings Row ──────────────────────────────────────────────────────────────
function Row({ label, desc, right }) {
  return (
    <div className="settings-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderRadius: 0, gap: 16 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 600 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

// ── MAIN SETTINGS PAGE ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate           = useNavigate();
  const { user, logout }   = useAuth();
  const { clearCart }      = useCart();
  const { clearWishlist }  = useWishlist();
  const { isMobile }       = useResponsive();
  const [toast, setToast]  = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Notification preferences (in real app save to Supabase profiles table)
  const [notifs, setNotifs] = useState({
    orderUpdates:  true,
    promotions:    false,
    newArrivals:   true,
    priceDrops:    true,
    newsletter:    false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    showWishlist:  false,
    showOrders:    false,
  });

  const toggleNotif  = (k) => setNotifs(n  => ({ ...n,  [k]: !n[k]  }));
  const togglePrivacy = (k) => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  // Save notification preferences to Supabase
  const saveNotifs = async () => {
    setLoading(true);
    try {
      await supabase
        .from("profiles")
        .update({ notification_prefs: notifs, privacy_settings: privacy })
        .eq("id", user.id);
      showToast("Settings saved!", "success");
    } catch (err) {
      showToast("Failed to save settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load saved settings
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("notification_prefs, privacy_settings")
        .eq("id", user.id)
        .single();
      if (data?.notification_prefs) setNotifs(data.notification_prefs);
      if (data?.privacy_settings)   setPrivacy(data.privacy_settings);
    };
    load();
  }, [user]);

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const handleClearCart = async () => {
    await clearCart();
    showToast("Cart cleared!", "success");
  };

  const handleClearWishlist = async () => {
    await clearWishlist();
    showToast("Wishlist cleared!", "success");
  };

  const handleDeleteAccount = () => {
    showToast("To delete your account, please contact support@shopsphere.com", "info");
  };

  if (!user) return null;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e5e7eb", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{STYLES}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* NAVBAR */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: isMobile ? "0 16px" : "0 40px", height: 64, display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>S</span>
          </div>
          {!isMobile && <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginLeft: 8 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="#6b7280"}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="#6b7280"}>Profile</span>
          <span>›</span>
          <span style={{ color: "#e5e7eb" }}>Settings</span>
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: "fadeUp 0.4s ease" }}>
          <h1 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Settings</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Manage your account preferences</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Account Info */}
          <Section title="Account" icon="👤" delay={0}>
            <Row
              label="Full Name"
              desc={user?.user_metadata?.full_name || "Not set"}
              right={
                <button onClick={() => navigate("/profile")}
                  style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "6px 14px", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Edit
                </button>
              }
            />
            <Row
              label="Email Address"
              desc={user?.email}
              right={<span style={{ fontSize: 11, color: "#10b981", background: "#10b98118", padding: "3px 10px", borderRadius: 8, fontWeight: 700 }}>Verified</span>}
            />
            <Row
              label="Password"
              desc="Last updated recently"
              right={
                <button onClick={() => navigate("/profile")}
                  style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: 8, padding: "6px 14px", color: "#9ca3af", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Change
                </button>
              }
            />
            <Row
              label="Member Since"
              desc={new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              right={null}
            />
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon="🔔" delay={0.05}>
            <Row label="Order Updates"   desc="Get notified about your order status changes" right={<Toggle value={notifs.orderUpdates}  onChange={() => toggleNotif("orderUpdates")}  />} />
            <Row label="Promotions"      desc="Exclusive deals, flash sales and discounts"   right={<Toggle value={notifs.promotions}    onChange={() => toggleNotif("promotions")}    />} />
            <Row label="New Arrivals"    desc="Be first to know about new products"          right={<Toggle value={notifs.newArrivals}   onChange={() => toggleNotif("newArrivals")}   />} />
            <Row label="Price Drops"     desc="Alert when wishlisted items go on sale"        right={<Toggle value={notifs.priceDrops}    onChange={() => toggleNotif("priceDrops")}    />} />
            <Row label="Newsletter"      desc="Weekly digest of trending products"            right={<Toggle value={notifs.newsletter}    onChange={() => toggleNotif("newsletter")}    />} />
            <div style={{ padding: "14px 24px", borderTop: "1px solid #1a1a1a" }}>
              <button onClick={saveNotifs} disabled={loading}
                style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                {loading
                  ? <><span style={{ width: 12, height: 12, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Saving...</>
                  : "Save Preferences"}
              </button>
            </div>
          </Section>

          {/* Privacy */}
          <Section title="Privacy" icon="🔐" delay={0.1}>
            <Row label="Public Wishlist" desc="Allow others to see your wishlist" right={<Toggle value={privacy.showWishlist} onChange={() => togglePrivacy("showWishlist")} />} />
            <Row label="Order History"   desc="Show your order history on profile" right={<Toggle value={privacy.showOrders}   onChange={() => togglePrivacy("showOrders")}   />} />
          </Section>

          {/* Quick Navigation */}
          <Section title="Quick Links" icon="🔗" delay={0.15}>
            {[
              { icon: "👤", label: "Edit Profile",  desc: "Update your personal information", path: "/profile"  },
              { icon: "📦", label: "My Orders",     desc: "View your order history",           path: "/orders"   },
              { icon: "❤️",  label: "My Wishlist",   desc: "Manage your saved products",        path: "/wishlist" },
              { icon: "🛍️", label: "Shop Products", desc: "Browse our catalog",                path: "/products" },
            ].map(l => (
              <div key={l.label} className="settings-row" onClick={() => navigate(l.path)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{l.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, color: "#e5e7eb", fontWeight: 600 }}>{l.label}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{l.desc}</p>
                  </div>
                </div>
                <span style={{ color: "#4b5563", fontSize: 16 }}>→</span>
              </div>
            ))}
          </Section>

          {/* Data Management */}
          <Section title="Data Management" icon="🗄️" delay={0.2}>
            <Row
              label="Clear Cart"
              desc="Remove all items from your cart"
              right={
                <button onClick={handleClearCart} className="danger-btn"
                  style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#9ca3af", fontSize: 12, fontWeight: 600 }}>
                  Clear
                </button>
              }
            />
            <Row
              label="Clear Wishlist"
              desc="Remove all items from your wishlist"
              right={
                <button onClick={handleClearWishlist} className="danger-btn"
                  style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#9ca3af", fontSize: 12, fontWeight: 600 }}>
                  Clear
                </button>
              }
            />
          </Section>

          {/* Danger Zone */}
          <Section title="Danger Zone" icon="⚠️" delay={0.25}>
            <div style={{ padding: "6px 0" }}>
              <Row
                label="Sign Out"
                desc="Sign out of your account on this device"
                right={
                  <button onClick={handleSignOut} className="danger-btn"
                    style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "8px 16px", color: "#9ca3af", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    🚪 Sign Out
                  </button>
                }
              />
              <div style={{ margin: "4px 24px", height: 1, background: "#1a1a1a" }} />
              <Row
                label="Delete Account"
                desc="Permanently delete your account and all data"
                right={
                  <button onClick={handleDeleteAccount} className="danger-btn"
                    style={{ background: "transparent", border: "1px solid #333", borderRadius: 8, padding: "8px 16px", color: "#9ca3af", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    🗑️ Delete
                  </button>
                }
              />
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}