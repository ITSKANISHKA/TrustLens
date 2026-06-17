import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function BusinessPage() {
  const { businesses, addBusiness, allTransactions } = useApp();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700" }}>My Businesses</div>
          <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>Manage fraud detection across all your ventures from one place</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "9px 16px", color: "#052e16", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>+ Add Business</button>
      </div>

      {showAdd && <AddBusinessModal onClose={() => setShowAdd(false)} onAdd={addBusiness} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
        {businesses.map(b => {
          const fraudPct = b.txCount ? Math.round((b.fraudCount / b.txCount) * 100) : 0;
          const bizTx = allTransactions.filter(t => t.businessId === b.id).slice(0, 5);
          return (
            <div key={b.id} style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "26px" }}>{b.icon}</span>
                  <div>
                    <div style={{ color: "#f0fdf4", fontWeight: "700", fontSize: "15px" }}>{b.name}</div>
                    <div style={{ color: "#6b7280", fontSize: "11px" }}>{b.category} · {b.location}</div>
                  </div>
                </div>
                <span style={{
                  background: fraudPct > 4 ? "#450a0a" : "#052e16", color: fraudPct > 4 ? "#ef4444" : "#22c55e",
                  fontSize: "10px", fontWeight: "700", padding: "3px 9px", borderRadius: "5px"
                }}>{fraudPct}% fraud</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                <MiniStat label="Revenue" value={`₹${(b.revenue / 100000).toFixed(1)}L`} />
                <MiniStat label="Transactions" value={b.txCount} />
                <MiniStat label="Flagged" value={b.fraudCount} color="#ef4444" />
              </div>

              <div style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Recent activity</div>
              {bizTx.length === 0 ? (
                <div style={{ color: "#374151", fontSize: "11px" }}>No transactions yet</div>
              ) : bizTx.map(t => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0a180a", fontSize: "11px" }}>
                  <span style={{ color: "#9ca3af" }}>{t.merchantIcon} {t.merchant}</span>
                  <span style={{ color: "#d1fae5", fontFamily: "monospace" }}>₹{t.amount.toLocaleString("en-IN")}</span>
                  <span style={{ color: t.risk >= 75 ? "#ef4444" : t.risk >= 45 ? "#f59e0b" : "#22c55e", fontFamily: "monospace" }}>{t.risk}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "#f0fdf4" }) {
  return (
    <div style={{ background: "#060f06", borderRadius: "8px", padding: "8px 10px" }}>
      <div style={{ color: "#4b5563", fontSize: "9px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color, fontSize: "14px", fontWeight: "700", fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}

function AddBusinessModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", category: "Retail", location: "", icon: "🏢", color: "#22c55e" });
  const categories = ["Retail", "Electronics", "Fashion", "Food & Beverage", "Services", "E-commerce", "Healthcare", "Other"];
  const icons = ["🏢", "🛒", "🍔", "👗", "🔌", "💊", "🚗", "📱"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onAdd(form);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "16px", padding: "26px", width: "100%", maxWidth: "420px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "16px" }}>Add New Business</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <Field label="Business Name">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. My Electronics Store" style={inputStyle} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mumbai" style={inputStyle} />
          </Field>
          <Field label="Icon">
            <div style={{ display: "flex", gap: "6px" }}>
              {icons.map(ic => (
                <div key={ic} onClick={() => setForm({ ...form, icon: ic })} style={{ width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: form.icon === ic ? "2px solid #22c55e" : "1px solid #1a3a1a", cursor: "pointer", fontSize: "16px" }}>{ic}</div>
              ))}
            </div>
          </Field>
          <button type="submit" style={{ width: "100%", background: "#22c55e", border: "none", borderRadius: "8px", padding: "11px", color: "#052e16", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "8px" }}>Add Business →</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ color: "#9ca3af", fontSize: "11px", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "10px 13px", color: "#f0fdf4", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
