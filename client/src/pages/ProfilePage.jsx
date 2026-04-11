import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

  .profile-input {
    width: 100%;
    background: #141414;
    border: 1.5px solid #222;
    border-radius: 12px;
    padding: 13px 16px;
    color: #e5e7eb;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .profile-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.1); }
  .profile-input:disabled { opacity: 0.5; cursor: not-allowed; background: #0d0d0d; }
  .profile-input::placeholder { color: #4b5563; }

  .save-btn {
    padding: 12px 28px;
    background: #f59e0b;
    color: #000;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 800;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .save-btn:hover:not(:disabled) { background: #fbbf24; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(245,158,11,0.3); }
  .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .tab-btn { transition: all 0.2s; cursor: pointer; border: none; }
  .tab-btn:hover { background: #1a1a1a !important; color: #f59e0b !important; }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  const colors = { success: "#10b981", error: "#ef4444", info: "#3b82f6" };
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999, background: colors[type] || "#333", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, animation: "fadeIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8, maxWidth: 320 }}>
      {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} {msg}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text", disabled = false, textarea = false }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>{label}</label>
      {textarea
        ? <textarea className="profile-input" value={value} onChange={onChange} placeholder={placeholder} rows={3} style={{ resize: "vertical", lineHeight: 1.6 }} />
        : <input className="profile-input" type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
      }
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ user, profile, onSave, isMobile }) {
  const [form, setForm]     = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || "",
    phone:    profile?.phone    || "",
    bio:      profile?.bio      || "",
    city:     profile?.city     || "",
    state:    profile?.state    || "",
    country:  profile?.country  || "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.fullName.trim()) return onSave("Full name cannot be empty.", "error");
    setLoading(true);
    try {
      // Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: form.fullName }
      });
      if (authError) throw authError;

      // Update profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          phone:     form.phone,
          bio:       form.bio,
          city:      form.city,
          state:     form.state,
          country:   form.country,
        })
        .eq("id", user.id);
      if (dbError) throw dbError;

      onSave("Profile updated successfully!", "success");
    } catch (err) {
      onSave(err.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Personal Information</h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>Update your name, bio and contact details</p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Field label="Full Name *"   value={form.fullName} onChange={set("fullName")} placeholder="John Doe" />
        <Field label="Email Address" value={user?.email || ""} disabled placeholder="you@email.com" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Field label="Bio" value={form.bio} onChange={set("bio")} placeholder="Tell us a little about yourself..." textarea />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Field label="Phone Number" value={form.phone}   onChange={set("phone")}   placeholder="+91 9876543210" />
        <Field label="City"         value={form.city}    onChange={set("city")}    placeholder="Hyderabad" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <Field label="State"   value={form.state}   onChange={set("state")}   placeholder="Telangana" />
        <Field label="Country" value={form.country} onChange={set("country")} placeholder="India" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="save-btn" onClick={handleSave} disabled={loading}>
          {loading
            ? <><span style={{ width: 14, height: 14, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Saving...</>
            : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── PASSWORD TAB ──────────────────────────────────────────────────────────────
function PasswordTab({ onSave }) {
  const [form, setForm]     = useState({ newPw: "", confirm: "" });
  const [show, setShow]     = useState({ newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const strength = (pw) => {
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return [
      { label: "",          color: "#222"    },
      { label: "Weak",      color: "#ef4444" },
      { label: "Fair",      color: "#eab308" },
      { label: "Good",      color: "#22c55e" },
      { label: "Strong 💪", color: "#10b981" },
    ][s];
  };

  const pw = strength(form.newPw);

  const handleChange = async () => {
    if (form.newPw.length < 8)       return onSave("Password must be at least 8 characters.", "error");
    if (form.newPw !== form.confirm)  return onSave("Passwords don't match.", "error");
    if (strength(form.newPw).label === "Weak") return onSave("Please use a stronger password.", "error");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: form.newPw });
      if (error) throw error;
      setForm({ newPw: "", confirm: "" });
      onSave("Password updated successfully!", "success");
    } catch (err) {
      onSave(err.message || "Failed to update password.", "error");
    } finally {
      setLoading(false);
    }
  };

  const PwField = ({ label, k }) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input className="profile-input" type={show[k] ? "text" : "password"} value={form[k]} onChange={set(k)} placeholder="••••••••" style={{ paddingRight: 44 }} />
        <button onClick={() => setShow(s => ({ ...s, [k]: !s[k] }))}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>
          {show[k] ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>Change Password</h2>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28 }}>Choose a strong password to keep your account safe</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28, maxWidth: 460 }}>
        <div>
          <PwField label="New Password" k="newPw" />
          {form.newPw && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= (pw.score || 0) ? pw.color : "#222", transition: "background 0.3s" }} />
                ))}
              </div>
              {pw.label && <span style={{ fontSize: 11, color: pw.color, fontWeight: 600 }}>{pw.label}</span>}
            </div>
          )}
        </div>
        <div>
          <PwField label="Confirm New Password" k="confirm" />
          {form.confirm && (
            <p style={{ fontSize: 11, marginTop: 5, fontWeight: 600, color: form.newPw === form.confirm ? "#10b981" : "#ef4444" }}>
              {form.newPw === form.confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="save-btn" onClick={handleChange} disabled={loading}>
          {loading
            ? <><span style={{ width: 14, height: 14, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Updating...</>
            : "🔒 Update Password"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN PROFILE PAGE ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();
  const { isMobile }     = useResponsive();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile]     = useState(null);
  const [stats, setStats]         = useState({ orders: 0, spent: 0, wishlist: 0 });
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchStats()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    const [ordersRes, wishlistRes] = await Promise.all([
      supabase.from("orders").select("total").eq("user_id", user.id),
      supabase.from("wishlist_items").select("id").eq("user_id", user.id),
    ]);
    setStats({
      orders:   ordersRes.data?.length || 0,
      spent:    ordersRes.data?.reduce((s, o) => s + (o.total || 0), 0) || 0,
      wishlist: wishlistRes.data?.length || 0,
    });
  };

  const showToast = (msg, type = "success") => setToast({ msg, type });

  if (!user) return null;

  const name     = profile?.full_name || user?.user_metadata?.full_name || "User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const joined   = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const tabs = [
    { id: "profile",  icon: "👤", label: "Profile"  },
    { id: "password", icon: "🔒", label: "Password" },
  ];

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
          <span style={{ color: "#e5e7eb" }}>My Profile</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1a1a1a", borderTopColor: "#f59e0b", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px 1fr", gap: 24 }}>

            {/* LEFT SIDEBAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Profile Card */}
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, padding: "28px 20px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
                {/* Avatar */}
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#000", fontFamily: "'Sora', sans-serif", margin: "0 auto 14px", position: "relative" }}>
                  {initials}
                  <div style={{ position: "absolute", bottom: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#10b981", border: "2px solid #111" }} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 3 }}>{name}</h2>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{user.email}</p>
                {profile?.bio && <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, marginBottom: 8 }}>{profile.bio}</p>}
                <span style={{ fontSize: 10, background: profile?.role === "admin" ? "#f59e0b22" : "#10b98122", color: profile?.role === "admin" ? "#f59e0b" : "#10b981", padding: "3px 12px", borderRadius: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {profile?.role || "user"}
                </span>

                {/* Stats */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #1a1a1a", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Orders",   value: stats.orders },
                    { label: "Spent",    value: `$${stats.spent.toFixed(0)}` },
                    { label: "Wishlist", value: stats.wishlist },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#0a0a0a", borderRadius: 10, padding: "10px 4px" }}>
                      <p style={{ fontSize: 16, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#4b5563", marginTop: 14 }}>Member since {joined}</p>
              </div>

              {/* Tabs */}
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "8px", animation: "fadeUp 0.4s ease 0.1s both" }}>
                {tabs.map(tab => (
                  <button key={tab.id} className="tab-btn"
                    onClick={() => setActiveTab(tab.id)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: activeTab === tab.id ? "#f59e0b18" : "transparent", border: `1px solid ${activeTab === tab.id ? "#f59e0b33" : "transparent"}`, borderRadius: 10, color: activeTab === tab.id ? "#f59e0b" : "#6b7280", fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500, textAlign: "left", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>
                    <span style={{ fontSize: 18 }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 16, padding: "12px", animation: "fadeUp 0.4s ease 0.2s both" }}>
                {[
                  { icon: "📦", label: "My Orders",  path: "/orders"   },
                  { icon: "❤️",  label: "Wishlist",   path: "/wishlist" },
                  { icon: "⚙️",  label: "Settings",  path: "/settings" },
                  { icon: "🛍️", label: "Shop Now",   path: "/products" },
                ].map(l => (
                  <button key={l.label} onClick={() => navigate(l.path)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "none", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", borderRadius: 10, textAlign: "left", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#1a1a1a"; e.currentTarget.style.color="#f59e0b"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="#9ca3af"; }}>
                    <span>{l.icon}</span> {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, padding: isMobile ? "24px 16px" : "32px", animation: "fadeUp 0.4s ease 0.15s both" }}>
              {activeTab === "profile"  && <ProfileTab  user={user} profile={profile} onSave={showToast} isMobile={isMobile} />}
              {activeTab === "password" && <PasswordTab onSave={showToast} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}