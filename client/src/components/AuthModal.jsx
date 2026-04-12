import { useNavigate } from "react-router-dom";

const STYLES = `
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
`;

export default function AuthModal({ message = "Please sign in to continue", onClose }) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Save current page so we can redirect back after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
      animation: "fadeIn 0.2s ease",
    }}
      onClick={onClose}
    >
      <style>{STYLES}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 20,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f59e0b22", border: "2px solid #f59e0b44", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
          🔒
        </div>

        {/* Text */}
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>
          Sign in Required
        </h2>
        <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, marginBottom: 28 }}>
          {message}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #222", borderRadius: 12, color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => { e.target.style.borderColor="#444"; e.target.style.color="#e5e7eb"; }}
            onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}
          >
            Not Now
          </button>
          <button
            onClick={handleSignIn}
            style={{ flex: 1, padding: "12px", background: "#f59e0b", border: "none", borderRadius: 12, color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}
            onMouseEnter={e => { e.target.style.background="#fbbf24"; e.target.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.target.style.background="#f59e0b"; e.target.style.transform="translateY(0)"; }}
          >
            Sign In →
          </button>
        </div>

        {/* Register link */}
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 16 }}>
          Don't have an account?{" "}
          <span
            onClick={() => { navigate("/login"); onClose(); }}
            style={{ color: "#f59e0b", fontWeight: 700, cursor: "pointer" }}
          >
            Register free
          </span>
        </p>
      </div>
    </div>
  );
}