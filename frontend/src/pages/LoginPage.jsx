import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.message); }
    setLoading(false);
  };

  const DEMOS = [
    { email: "admin@trustlens.com", password: "admin123", role: "Owner" },
    { email: "analyst@trustlens.com", password: "analyst123", role: "Analyst" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060f06", display: "flex", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ fontSize: "34px", marginBottom: "10px" }}>🔍</div>
            <div style={{ color: "#f0fdf4", fontWeight: "700", fontSize: "26px" }}>Trust<span style={{ color: "#22c55e" }}>Lens</span></div>
            <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "5px" }}>AI-Powered Fraud Analytics Platform</div>
          </div>

          <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "16px", padding: "30px" }}>
            <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "16px", marginBottom: "22px" }}>Welcome back</div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "40px" }} onFocus={focusStyle} onBlur={blurStyle} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>

              {error && <div style={errorBox}>⚠ {error}</div>}

              <button type="submit" disabled={loading} style={primaryBtn(loading)}>{loading ? "Signing in..." : "Sign In →"}</button>
            </form>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#6b7280" }}>
              New here? <span onClick={onSwitch} style={{ color: "#22c55e", cursor: "pointer", fontWeight: "600" }}>Create an account</span>
            </div>

            <div style={demoBox}>
              <div style={{ color: "#4b5563", fontSize: "10px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Demo credentials (click to autofill)</div>
              {DEMOS.map(d => (
                <div key={d.email} onClick={() => { setEmail(d.email); setPassword(d.password); }} style={{ cursor: "pointer", marginBottom: "6px", fontSize: "11px" }}>
                  <span style={{ color: "#22c55e", fontFamily: "monospace" }}>{d.email}</span>
                  <span style={{ color: "#4b5563" }}> / {d.password}</span>
                  <span style={{ marginLeft: "6px", background: "#052e16", color: "#22c55e", fontSize: "9px", padding: "1px 5px", borderRadius: "3px" }}>{d.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "none" }} className="login-side" />
      <style>{`
        @media (min-width: 900px) { .login-side { display: flex !important; align-items: center; justify-content: center; background: radial-gradient(circle at 30% 30%, #0d1f0d 0%, #060f06 70%); border-left: 1px solid #1a3a1a; } }
      `}</style>
    </div>
  );
}

const inputStyle = { width: "100%", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "11px 14px", color: "#f0fdf4", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const focusStyle = (e) => e.target.style.borderColor = "#22c55e";
const blurStyle = (e) => e.target.style.borderColor = "#1a3a1a";
const errorBox = { background: "#450a0a", border: "1px solid #ef444433", borderRadius: "8px", padding: "10px 14px", color: "#ef4444", fontSize: "13px", marginBottom: "14px" };
const primaryBtn = (loading) => ({ width: "100%", background: loading ? "#166534" : "#22c55e", border: "none", borderRadius: "8px", padding: "12px", color: "#052e16", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" });
const demoBox = { marginTop: "20px", padding: "14px", background: "#060f06", borderRadius: "8px", border: "1px solid #1a3a1a" };
