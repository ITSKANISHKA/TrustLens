import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(75);

  const handleSave = () => {
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Settings</div>
      <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>Manage your account and detection preferences</div>

      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "22px", marginBottom: "14px" }}>
        <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px", marginBottom: "16px" }}>Profile</div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", color: "#22c55e" }}>{user.avatar}</div>
          <div>
            <div style={{ color: "#f0fdf4", fontSize: "14px", fontWeight: "600" }}>{user.email}</div>
            <span style={{ background: "#052e16", color: "#22c55e", fontSize: "10px", padding: "2px 8px", borderRadius: "4px" }}>{user.plan} Plan · {user.role}</span>
          </div>
        </div>

        <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>Full Name</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />

        <button onClick={handleSave} style={{ marginTop: "14px", background: saved ? "#166534" : "#22c55e", border: "none", borderRadius: "8px", padding: "9px 18px", color: "#052e16", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "22px", marginBottom: "14px" }}>
        <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px", marginBottom: "16px" }}>Detection Preferences</div>
        <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "8px", textTransform: "uppercase" }}>
          Flag threshold: <span style={{ color: "#22c55e", fontFamily: "monospace" }}>{riskThreshold}</span>
        </label>
        <input type="range" min="50" max="95" value={riskThreshold} onChange={e => setRiskThreshold(Number(e.target.value))} style={{ width: "100%" }} />
        <div style={{ color: "#4b5563", fontSize: "11px", marginTop: "6px" }}>Transactions scoring above this threshold are auto-flagged as fraud.</div>
      </div>

      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "22px" }}>
        <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px", marginBottom: "14px" }}>Account</div>
        <button onClick={logout} style={{ background: "#450a0a", border: "1px solid #ef444433", borderRadius: "8px", padding: "9px 18px", color: "#ef4444", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>🚪 Logout</button>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "10px 13px", color: "#f0fdf4", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
