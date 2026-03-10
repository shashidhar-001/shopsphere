import { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from 'react-router-dom'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes slideLeft  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideRight { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes spin      { to { transform:rotate(360deg); } }
  @keyframes float     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-12px); } }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#0a0a0a; }
  ::-webkit-scrollbar-thumb { background:#f59e0b; border-radius:3px; }

  .auth-input {
    width: 100%;
    background: #141414;
    border: 1.5px solid #222;
    border-radius: 12px;
    padding: 13px 16px 13px 44px;
    color: #e5e7eb;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .auth-input:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
  }
  .auth-input::placeholder { color: #4b5563; }

  .auth-btn {
    width: 100%;
    padding: 14px;
    background: #f59e0b;
    color: #000;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 800;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .auth-btn:hover:not(:disabled) {
    background: #fbbf24;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(245,158,11,0.3);
  }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .tab-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.25s;
  }

  .strength-bar { height: 4px; border-radius: 2px; transition: all 0.3s; }
`;

function getStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "#222" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
        { label: "Too short", color: "#ef4444" },
        { label: "Weak", color: "#f97316" },
        { label: "Fair", color: "#eab308" },
        { label: "Good", color: "#22c55e" },
        { label: "Strong 💪", color: "#10b981" },
    ];
    return { score, ...map[score] };
}

function Toast({ msg, type }) {
    if (!msg) return null;
    const colors = { error: "#ef4444", success: "#10b981", info: "#3b82f6" };
    return (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999, background: colors[type] || "#333", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", animation: "fadeIn 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxWidth: 320 }}>
            {type === "error" ? "❌ " : type === "success" ? "✅ " : "ℹ️ "}{msg}
        </div>
    );
}

function Field({ icon, label, type = "text", value, onChange, placeholder, extra }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 7, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>
                {label}
            </label>
            <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#4b5563", pointerEvents: "none" }}>
                    {icon}
                </span>
                <input
                    className="auth-input"
                    type={isPassword && show ? "text" : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{ paddingRight: isPassword ? 44 : 16 }}
                />
                {isPassword && (
                    <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>
                        {show ? "🙈" : "👁️"}
                    </button>
                )}
            </div>
            {extra}
        </div>
    );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }) {
    const navigate = useNavigate()

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    const handleLogin = async () => {
        if (!email || !password) return showToast("Please fill in all fields.");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showToast("Welcome back! 🎉", "success")
            setTimeout(() => navigate('/'), 1200)

        } catch (err) {
            showToast(err.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: "slideRight 0.4s ease" }}>
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Welcome back 👋</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>Sign in to your ShopSphere account</p>

            <Field icon="✉️" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field icon="🔒" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
                extra={<div style={{ textAlign: "right", marginTop: 6 }}><span style={{ fontSize: 12, color: "#f59e0b", cursor: "pointer", fontWeight: 600 }}>Forgot password?</span></div>}
            />

            <button className="auth-btn" onClick={handleLogin} disabled={loading} style={{ marginTop: 8 }}>
                {loading
                    ? <><span style={{ width: 16, height: 16, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Signing in...</>
                    : "Sign In →"}
            </button>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                Don't have an account?{" "}<span onClick={onSwitch} style={{ color: "#f59e0b", fontWeight: 700, cursor: "pointer" }}>Create one</span>
            </p>
        </div>
    );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const strength = getStrength(form.password);

    const showToast = (msg, type = "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password || !form.confirm) return showToast("Please fill in all fields.");
        if (form.password !== form.confirm) return showToast("Passwords don't match.");
        if (strength.score < 2) return showToast("Please use a stronger password.");
        if (!agreed) return showToast("Please agree to the terms.");
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: { data: { full_name: form.name } },
            });
            if (error) throw error;
            showToast("Account created! Check your email ✉️", "success");
        } catch (err) {
            showToast(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ animation: "slideLeft 0.4s ease" }}>
            {toast && <Toast msg={toast.msg} type={toast.type} />}
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Create account ✨</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 32, fontFamily: "'DM Sans', sans-serif" }}>Join millions of ShopSphere shoppers</p>

            <Field icon="👤" label="Full Name" value={form.name} onChange={set("name")} placeholder="John Doe" />
            <Field icon="✉️" label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            <Field icon="🔒" label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 characters"
                extra={form.password && (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                            {[1, 2, 3, 4].map(i => <div key={i} className="strength-bar" style={{ flex: 1, background: i <= strength.score ? strength.color : "#222" }} />)}
                        </div>
                        <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                    </div>
                )}
            />
            <Field icon="✅" label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat your password"
                extra={form.confirm && (
                    <p style={{ fontSize: 11, marginTop: 5, fontWeight: 600, color: form.password === form.confirm ? "#10b981" : "#ef4444" }}>
                        {form.password === form.confirm ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </p>
                )}
            />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 22 }}>
                <div onClick={() => setAgreed(a => !a)} style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${agreed ? "#f59e0b" : "#333"}`, background: agreed ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}>
                    {agreed && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                    I agree to ShopSphere's <span style={{ color: "#f59e0b", cursor: "pointer" }}>Terms of Service</span> and <span style={{ color: "#f59e0b", cursor: "pointer" }}>Privacy Policy</span>
                </p>
            </div>

            <button className="auth-btn" onClick={handleRegister} disabled={loading}>
                {loading
                    ? <><span style={{ width: 16, height: 16, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Creating account...</>
                    : "Create Account →"}
            </button>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#6b7280", fontFamily: "'DM Sans', sans-serif" }}>
                Already have an account?{" "}<span onClick={onSwitch} style={{ color: "#f59e0b", fontWeight: 700, cursor: "pointer" }}>Sign in</span>
            </p>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AuthPage() {
    const [mode, setMode] = useState("login");

    return (
        <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex" }}>
            <style>{STYLES}</style>

            {/* LEFT — Branding */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px" }}>
                <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0a0a0a 35%, rgba(245,158,11,0.07) 100%)" }} />

                {/* Floating cards */}
                <div style={{ position: "absolute", top: "14%", right: "8%", background: "#141414", border: "1px solid #222", borderRadius: 16, padding: "14px 18px", animation: "float 4s ease-in-out infinite", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Just ordered</div>
                    <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>Sony WH-1000XM5</div>
                    <div style={{ fontSize: 14, color: "#f59e0b", fontWeight: 800, marginTop: 4 }}>$299.99</div>
                </div>
                <div style={{ position: "absolute", bottom: "20%", right: "6%", background: "#141414", border: "1px solid #1f1f1f", borderRadius: 16, padding: "14px 18px", animation: "float 5s ease-in-out infinite 1.2s", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                    <div style={{ fontSize: 11, color: "#10b981", marginBottom: 4 }}>✓ Delivered</div>
                    <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>Nike Air Max 270</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>⭐ 4.9 · 3.2k reviews</div>
                </div>

                <div style={{ position: "relative", zIndex: 10 }}>
                    {/* Logo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
                        <div style={{ width: 38, height: 38, background: "#f59e0b", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#000", fontWeight: 900, fontSize: 20 }}>S</span>
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Shop<span style={{ color: "#f59e0b" }}>Sphere</span></span>
                    </div>

                    <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Your Ultimate Store</p>
                    <h1 style={{ fontSize: 46, fontWeight: 800, color: "#fff", lineHeight: 1.15, fontFamily: "'Sora', sans-serif", marginBottom: 18 }}>
                        Shop Smarter,<br /><span style={{ color: "#f59e0b" }}>Live Better.</span>
                    </h1>
                    <p style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
                        Millions of products. Unbeatable prices. Lightning-fast delivery. Join the ShopSphere family today.
                    </p>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {[["🛡️", "Secure"], ["🚀", "Fast Delivery"], ["🔄", "Easy Returns"]].map(([icon, label]) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, background: "#141414", border: "1px solid #1f1f1f", borderRadius: 10, padding: "8px 14px" }}>
                                <span style={{ fontSize: 15 }}>{icon}</span>
                                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
                        <div style={{ display: "flex" }}>
                            {["#f97316", "#3b82f6", "#10b981", "#a855f7"].map((c, i) => (
                                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid #0a0a0a", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
                                    {["J", "S", "M", "A"][i]}
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>2M+ happy customers</div>
                            <div style={{ display: "flex", gap: 1, marginTop: 2 }}>
                                {"★★★★★".split("").map((s, i) => <span key={i} style={{ color: "#f59e0b", fontSize: 12 }}>{s}</span>)}
                                <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>4.9/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT — Form */}
            <div style={{ width: 480, background: "#0d0d0d", borderLeft: "1px solid #1a1a1a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px" }}>
                <div style={{ display: "flex", background: "#141414", borderRadius: 14, padding: 4, marginBottom: 36, border: "1px solid #1f1f1f" }}>
                    {["login", "register"].map(m => (
                        <button key={m} className="tab-btn" onClick={() => setMode(m)}
                            style={{ background: mode === m ? "#f59e0b" : "transparent", color: mode === m ? "#000" : "#6b7280" }}>
                            {m === "login" ? "Sign In" : "Register"}
                        </button>
                    ))}
                </div>
                {mode === "login"
                    ? <LoginForm onSwitch={() => setMode("register")} />
                    : <RegisterForm onSwitch={() => setMode("login")} />
                }
            </div>
        </div>
    );
}