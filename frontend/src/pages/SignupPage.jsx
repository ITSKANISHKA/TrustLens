import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SignupPage({ onSwitch }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords don't match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try { await signup(form.name, form.email, form.password); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060f06", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "34px", marginBottom: "10px" }}>🔍</div>
          <div style={{ color: "#f0fdf4", fontWeight: "700", fontSize: "26px" }}>Trust<span style={{ color: "#22c55e" }}>Lens</span></div>
          <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "5px" }}>Create your fraud analytics workspace</div>
        </div>

        <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "16px", padding: "30px" }}>
          <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "16px", marginBottom: "22px" }}>Create account</div>

          <form onSubmit={handleSubmit}>
            <Field label="Full Name" type="text" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Raj Sharma" />
            <Field label="Email" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="you@company.com" />
            <Field label="Password" type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="Min. 6 characters" />
            <Field label="Confirm Password" type="password" value={form.confirm} onChange={v => setForm({ ...form, confirm: v })} placeholder="Re-enter password" />

            {error && <div style={{ background: "#450a0a", border: "1px solid #ef444433", borderRadius: "8px", padding: "10px 14px", color: "#ef4444", fontSize: "13px", marginBottom: "14px" }}>⚠ {error}</div>}

            <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "#166534" : "#22c55e", border: "none", borderRadius: "8px", padding: "12px", color: "#052e16", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#6b7280" }}>
            Already have an account? <span onClick={onSwitch} style={{ color: "#22c55e", cursor: "pointer", fontWeight: "600" }}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required placeholder={placeholder}
        style={{ width: "100%", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "11px 14px", color: "#f0fdf4", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        onFocus={e => e.target.style.borderColor = "#22c55e"} onBlur={e => e.target.style.borderColor = "#1a3a1a"} />
    </div>
  );
}
