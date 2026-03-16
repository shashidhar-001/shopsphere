import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes success { 0% { transform:scale(0.5); opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 3px; }

  .checkout-input {
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
  .checkout-input:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.1);
  }
  .checkout-input::placeholder { color: #4b5563; }

  .step-btn {
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
  }
  .step-btn:hover { background: #fbbf24; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(245,158,11,0.3); }
  .step-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .payment-option { transition: all 0.2s; cursor: pointer; }
  .payment-option:hover { border-color: #f59e0b44 !important; }
`;

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, placeholder, value, onChange, type = "text", half = false }) {
  return (
    <div style={{ flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 6, letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "'Sora', sans-serif" }}>
        {label}
      </label>
      <input className="checkout-input" type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = ["Shipping", "Payment", "Review"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: i < current ? "#10b981" : i === current ? "#f59e0b" : "#1a1a1a",
              border: `2px solid ${i < current ? "#10b981" : i === current ? "#f59e0b" : "#333"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: i <= current ? "#000" : "#4b5563",
              fontFamily: "'Sora', sans-serif", transition: "all 0.3s"
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: i === current ? "#f59e0b" : i < current ? "#10b981" : "#4b5563", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#10b981" : "#1a1a1a", margin: "0 12px", marginBottom: 20, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order Summary Sidebar ────────────────────────────────────────────────────
function OrderSummary({ cart, cartSubtotal, cartSavings }) {
  const shipping = cartSubtotal > 50 ? 0 : 9.99;
  const tax      = cartSubtotal * 0.08;
  const total    = cartSubtotal + shipping + tax;

  return (
    <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, padding: "24px", position: "sticky", top: 80 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 20 }}>Order Summary</h3>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20, maxHeight: 280, overflowY: "auto" }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={item.images[0]} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover" }} />
              <span style={{ position: "absolute", top: -6, right: -6, background: "#f59e0b", color: "#000", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.qty}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "#e5e7eb", fontWeight: 600, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</p>
              <p style={{ fontSize: 11, color: "#6b7280" }}>{item.brand}</p>
            </div>
            <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 800, fontFamily: "'Sora', sans-serif", flexShrink: 0 }}>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#9ca3af" }}>Subtotal</span>
          <span style={{ color: "#e5e7eb" }}>${cartSubtotal.toFixed(2)}</span>
        </div>
        {cartSavings > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "#10b981" }}>Savings</span>
            <span style={{ color: "#10b981" }}>-${cartSavings.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#9ca3af" }}>Shipping</span>
          <span style={{ color: shipping === 0 ? "#10b981" : "#e5e7eb" }}>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "#9ca3af" }}>Tax (8%)</span>
          <span style={{ color: "#e5e7eb" }}>${tax.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, paddingTop: 10, borderTop: "1px solid #1a1a1a", marginTop: 4 }}>
          <span style={{ color: "#fff", fontFamily: "'Sora', sans-serif" }}>Total</span>
          <span style={{ color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Trust */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1a1a1a", display: "flex", flexDirection: "column", gap: 8 }}>
        {[["🔒", "SSL Encrypted Checkout"], ["🚚", "Free shipping over $50"], ["🔄", "30-day easy returns"]].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280" }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 1: Shipping ─────────────────────────────────────────────────────────
function ShippingStep({ data, setData, onNext }) {
  const isValid = data.firstName && data.lastName && data.email && data.phone && data.address && data.city && data.state && data.zip && data.country;

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Shipping Address</h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Where should we deliver your order?</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <Field label="First Name"    placeholder="John"            value={data.firstName} onChange={e => setData(d => ({ ...d, firstName: e.target.value }))} half />
        <Field label="Last Name"     placeholder="Doe"             value={data.lastName}  onChange={e => setData(d => ({ ...d, lastName: e.target.value }))}  half />
        <Field label="Email Address" placeholder="you@example.com" value={data.email}     onChange={e => setData(d => ({ ...d, email: e.target.value }))}     type="email" />
        <Field label="Phone Number"  placeholder="+1 234 567 8900" value={data.phone}     onChange={e => setData(d => ({ ...d, phone: e.target.value }))}     half />
        <Field label="Street Address" placeholder="123 Main Street" value={data.address}  onChange={e => setData(d => ({ ...d, address: e.target.value }))} />
        <Field label="City"           placeholder="New York"         value={data.city}     onChange={e => setData(d => ({ ...d, city: e.target.value }))}     half />
        <Field label="State"          placeholder="NY"               value={data.state}    onChange={e => setData(d => ({ ...d, state: e.target.value }))}    half />
        <Field label="ZIP Code"       placeholder="10001"            value={data.zip}      onChange={e => setData(d => ({ ...d, zip: e.target.value }))}      half />
        <Field label="Country"        placeholder="United States"    value={data.country}  onChange={e => setData(d => ({ ...d, country: e.target.value }))}  half />
      </div>

      {/* Delivery options */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12, fontFamily: "'Sora', sans-serif" }}>Delivery Method</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { id: "standard", label: "Standard Delivery", time: "5-7 business days", price: "FREE", color: "#10b981" },
            { id: "express",  label: "Express Delivery",  time: "2-3 business days", price: "$9.99", color: "#f59e0b" },
            { id: "next_day", label: "Next Day Delivery",  time: "1 business day",    price: "$19.99", color: "#3b82f6" },
          ].map(opt => (
            <div key={opt.id} className="payment-option"
              onClick={() => setData(d => ({ ...d, delivery: opt.id }))}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: data.delivery === opt.id ? "#f59e0b12" : "#141414", border: `1.5px solid ${data.delivery === opt.id ? "#f59e0b" : "#222"}`, borderRadius: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${data.delivery === opt.id ? "#f59e0b" : "#333"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {data.delivery === opt.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb" }}>{opt.label}</p>
                  <p style={{ fontSize: 11, color: "#6b7280" }}>{opt.time}</p>
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: opt.color, fontFamily: "'Sora', sans-serif" }}>{opt.price}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="step-btn" onClick={onNext} disabled={!isValid}>
        Continue to Payment →
      </button>
    </div>
  );
}

// ─── STEP 2: Payment ──────────────────────────────────────────────────────────
function PaymentStep({ data, setData, onNext, onBack }) {
  const [payMethod, setPayMethod] = useState("card");
  const isValid = payMethod === "card"
    ? data.cardNumber && data.expiry && data.cvv && data.cardName
    : true;

  const formatCard   = v => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = v => v.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Payment Method</h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Choose how you'd like to pay</p>

      {/* Payment method tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        {[
          { id: "card",   label: "💳 Credit Card" },
          { id: "upi",    label: "📱 UPI" },
          { id: "cod",    label: "💵 Cash on Delivery" },
        ].map(m => (
          <button key={m.id} onClick={() => setPayMethod(m.id)}
            style={{ flex: 1, padding: "12px", background: payMethod === m.id ? "#f59e0b" : "#141414", color: payMethod === m.id ? "#000" : "#9ca3af", border: `1.5px solid ${payMethod === m.id ? "#f59e0b" : "#222"}`, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Card form */}
      {payMethod === "card" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28, animation: "fadeIn 0.3s ease" }}>
          {/* Card preview */}
          <div style={{ width: "100%", height: 160, background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)", borderRadius: 16, padding: "24px", border: "1px solid #333", position: "relative", overflow: "hidden", marginBottom: 8 }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "#f59e0b08", borderRadius: "50%", transform: "translate(40%, -40%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, width: 150, height: 150, background: "#f59e0b05", borderRadius: "50%", transform: "translate(-30%, 40%)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div style={{ width: 36, height: 28, background: "#f59e0b", borderRadius: 4 }} />
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>CREDIT CARD</span>
            </div>
            <p style={{ fontSize: 17, color: "#e5e7eb", letterSpacing: 3, fontFamily: "monospace", marginBottom: 16 }}>
              {data.cardNumber || "•••• •••• •••• ••••"}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 9, color: "#6b7280", letterSpacing: 1, marginBottom: 2 }}>CARD HOLDER</p>
                <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{data.cardName || "YOUR NAME"}</p>
              </div>
              <div>
                <p style={{ fontSize: 9, color: "#6b7280", letterSpacing: 1, marginBottom: 2 }}>EXPIRES</p>
                <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{data.expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>

          <Field label="Card Number" placeholder="1234 5678 9012 3456"
            value={data.cardNumber || ""}
            onChange={e => setData(d => ({ ...d, cardNumber: formatCard(e.target.value) }))} />
          <Field label="Card Holder Name" placeholder="John Doe"
            value={data.cardName || ""}
            onChange={e => setData(d => ({ ...d, cardName: e.target.value }))} />
          <Field label="Expiry Date" placeholder="MM/YY" half
            value={data.expiry || ""}
            onChange={e => setData(d => ({ ...d, expiry: formatExpiry(e.target.value) }))} />
          <Field label="CVV" placeholder="•••" half type="password"
            value={data.cvv || ""}
            onChange={e => setData(d => ({ ...d, cvv: e.target.value.slice(0, 4) }))} />

          <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "#10b98112", border: "1px solid #10b98133", borderRadius: 10, padding: "10px 14px" }}>
            <span>🔒</span>
            <p style={{ fontSize: 12, color: "#10b981" }}>Your card details are encrypted and secure. We never store your CVV.</p>
          </div>
        </div>
      )}

      {/* UPI form */}
      {payMethod === "upi" && (
        <div style={{ marginBottom: 28, animation: "fadeIn 0.3s ease" }}>
          <Field label="UPI ID" placeholder="yourname@upi"
            value={data.upiId || ""}
            onChange={e => setData(d => ({ ...d, upiId: e.target.value }))} />
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Enter your UPI ID (e.g. name@okicici, name@paytm)</p>
        </div>
      )}

      {/* COD */}
      {payMethod === "cod" && (
        <div style={{ marginBottom: 28, background: "#f59e0b12", border: "1px solid #f59e0b33", borderRadius: 14, padding: "20px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>💵</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Cash on Delivery</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6 }}>Pay with cash when your order is delivered. Please keep exact change ready. An extra charge of $2.99 applies for COD orders.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack}
          style={{ flex: "0 0 120px", padding: "14px", background: "transparent", color: "#9ca3af", border: "1px solid #222", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Sora', sans-serif" }}
          onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
          onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
          ← Back
        </button>
        <button className="step-btn" onClick={() => { setData(d => ({ ...d, payMethod })); onNext(); }} disabled={!isValid} style={{ flex: 1 }}>
          Review Order →
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: Review ───────────────────────────────────────────────────────────
function ReviewStep({ shipping, payment, cart, cartSubtotal, cartSavings, onBack, onPlace }) {
  const [loading, setLoading] = useState(false);
  const shippingCost = cartSubtotal > 50 ? 0 : 9.99;
  const tax   = cartSubtotal * 0.08;
  const total = cartSubtotal + shippingCost + tax;

  const handlePlace = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000)); // simulate API call
    setLoading(false);
    onPlace();
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 6 }}>Review Your Order</h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Please confirm everything looks correct</p>

      {/* Shipping summary */}
      <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>📦 Shipping To</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{shipping.firstName} {shipping.lastName}</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{shipping.address}</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>{shipping.city}, {shipping.state} {shipping.zip}</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>{shipping.country}</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>{shipping.phone} · {shipping.email}</p>
          </div>
          <span style={{ fontSize: 11, background: "#f59e0b22", color: "#f59e0b", padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>
            {shipping.delivery === "express" ? "Express" : shipping.delivery === "next_day" ? "Next Day" : "Standard"}
          </span>
        </div>
      </div>

      {/* Payment summary */}
      <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>💳 Payment</p>
        {payment.payMethod === "card" && <p style={{ fontSize: 14, color: "#e5e7eb" }}>Card ending in <strong>{payment.cardNumber?.slice(-4) || "••••"}</strong></p>}
        {payment.payMethod === "upi"  && <p style={{ fontSize: 14, color: "#e5e7eb" }}>UPI: {payment.upiId}</p>}
        {payment.payMethod === "cod"  && <p style={{ fontSize: 14, color: "#e5e7eb" }}>Cash on Delivery</p>}
      </div>

      {/* Items summary */}
      <div style={{ background: "#141414", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>🛍️ Items ({cart.length})</p>
        {cart.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={item.images[0]} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
              <div>
                <p style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600 }}>{item.name}</p>
                <p style={{ fontSize: 11, color: "#6b7280" }}>Qty: {item.qty}</p>
              </div>
            </div>
            <span style={{ fontSize: 14, color: "#f59e0b", fontWeight: 800 }}>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", fontFamily: "'Sora', sans-serif" }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={onBack}
          style={{ flex: "0 0 120px", padding: "14px", background: "transparent", color: "#9ca3af", border: "1px solid #222", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
          onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
          ← Back
        </button>
        <button className="step-btn" onClick={handlePlace} disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          {loading
            ? <><span style={{ width: 18, height: 18, border: "2px solid #00000044", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Placing Order...</>
            : "🎉 Place Order"}
        </button>
      </div>
    </div>
  );
}

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
function SuccessScreen({ orderId }) {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", padding: "60px 40px", animation: "fadeIn 0.5s ease" }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#10b98122", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "success 0.6s ease" }}>
        <span style={{ fontSize: 44 }}>✓</span>
      </div>
      <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif", marginBottom: 10 }}>Order Placed! 🎉</h2>
      <p style={{ fontSize: 16, color: "#9ca3af", marginBottom: 8 }}>Thank you for your order!</p>
      <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 32 }}>
        Order ID: <span style={{ color: "#f59e0b", fontWeight: 700 }}>#{orderId}</span>
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={() => navigate("/orders")}
          style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          Track Order →
        </button>
        <button onClick={() => navigate("/")}
          style={{ background: "transparent", color: "#9ca3af", border: "1px solid #222", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.target.style.borderColor="#f59e0b"; e.target.style.color="#f59e0b"; }}
          onMouseLeave={e => { e.target.style.borderColor="#222"; e.target.style.color="#9ca3af"; }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ─── MAIN CHECKOUT PAGE ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, cartSavings, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep]       = useState(0);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [shipping, setShipping] = useState({
    firstName: user?.user_metadata?.full_name?.split(" ")[0] || "",
    lastName:  user?.user_metadata?.full_name?.split(" ")[1] || "",
    email:     user?.email || "",
    phone: "", address: "", city: "", state: "", zip: "", country: "",
    delivery: "standard",
  });

  const [payment, setPayment] = useState({
    cardNumber: "", cardName: "", expiry: "", cvv: "", upiId: "", payMethod: "card"
  });

  // Redirect if cart is empty
  if (cart.length === 0 && !success) {
    return (
      <div style={{ background: "#0a0a0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{STYLES}</style>
        <div style={{ fontSize: 64 }}>🛒</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif" }}>Your cart is empty</h2>
        <button onClick={() => navigate("/products")}
          style={{ background: "#f59e0b", color: "#000", border: "none", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
          Shop Now →
        </button>
      </div>
    );
  }

  const handleOrderPlaced = () => {
    const id = Math.random().toString(36).substr(2, 9).toUpperCase();
    setOrderId(id);
    setSuccess(true);
    clearCart();
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", marginLeft: 16 }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="#6b7280"}>Home</span>
          <span>›</span>
          <span onClick={() => navigate("/cart")} style={{ cursor: "pointer" }} onMouseEnter={e => e.target.style.color="#f59e0b"} onMouseLeave={e => e.target.style.color="#6b7280"}>Cart</span>
          <span>›</span>
          <span style={{ color: "#e5e7eb" }}>Checkout</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 40px" }}>

        {success ? (
          <SuccessScreen orderId={orderId} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28 }}>
            {/* LEFT — Steps */}
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, padding: "32px" }}>
              <StepBar current={step} />
              {step === 0 && <ShippingStep data={shipping} setData={setShipping} onNext={() => setStep(1)} />}
              {step === 1 && <PaymentStep  data={payment}  setData={setPayment}  onNext={() => setStep(2)} onBack={() => setStep(0)} />}
              {step === 2 && <ReviewStep   shipping={shipping} payment={payment} cart={cart} cartSubtotal={cartSubtotal} cartSavings={cartSavings} onBack={() => setStep(1)} onPlace={handleOrderPlaced} />}
            </div>

            {/* RIGHT — Summary */}
            <OrderSummary cart={cart} cartSubtotal={cartSubtotal} cartSavings={cartSavings} />
          </div>
        )}
      </div>
    </div>
  );
}