import { useState } from "react";
import { useApp } from "../context/AppContext";
import { MERCHANT_LIST, MERCHANT_ICONS, calcManualRisk } from "../utils/risk";

export default function AddTransactionModal({ onClose }) {
  const { businesses, addManualTx } = useApp();
  const [form, setForm] = useState({ businessId: businesses[0]?.id || "", merchant: "Amazon", amount: "", type: "UPI", location: "Mumbai" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const risk = calcManualRisk(form.merchant, Number(form.amount));
    addManualTx({ ...form, amount: Number(form.amount), risk, status: risk >= 75 ? "FLAGGED" : risk >= 45 ? "REVIEW" : "CLEAR" });
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "16px", padding: "26px", width: "100%", maxWidth: "420px", fontFamily: "'Inter','Segoe UI',sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "16px" }}>Add Transaction</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label="Business">
            <select value={form.businessId} onChange={e => setForm({ ...form, businessId: e.target.value })} style={selectStyle}>
              {businesses.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
            </select>
          </Field>

          <Field label="Merchant">
            <select value={form.merchant} onChange={e => setForm({ ...form, merchant: e.target.value })} style={selectStyle}>
              {MERCHANT_LIST.map(m => <option key={m} value={m}>{MERCHANT_ICONS[m]} {m}</option>)}
            </select>
          </Field>

          <Field label="Amount (₹)">
            <input type="number" min="1" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 15000" style={inputStyle} />
          </Field>

          <Field label="Payment Type">
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={selectStyle}>
              {["UPI", "Card", "NetBanking", "Wallet"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          <div style={{ color: "#4b5563", fontSize: "11px", marginBottom: "20px" }}>AI will calculate the risk score automatically based on amount and merchant pattern.</div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: "transparent", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "11px", color: "#6b7280", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: "#22c55e", border: "none", borderRadius: "8px", padding: "11px", color: "#052e16", fontWeight: "700", fontSize: "14px", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Processing..." : "Submit →"}
            </button>
          </div>
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
const selectStyle = { ...inputStyle, cursor: "pointer" };
