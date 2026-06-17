import { useState } from "react";
import { useApp } from "../context/AppContext";
import { getRiskLevel } from "../utils/risk";

export default function TransactionsPage() {
  const { transactions, businesses } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("time");

  let filtered = transactions.filter(t =>
    t.merchant.toLowerCase().includes(search.toLowerCase()) ||
    t.businessName.toLowerCase().includes(search.toLowerCase())
  );
  if (statusFilter !== "ALL") filtered = filtered.filter(t => t.status === statusFilter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "risk") return b.risk - a.risk;
    if (sortBy === "amount") return b.amount - a.amount;
    return b.time - a.time;
  });

  return (
    <div>
      <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Transactions</div>
      <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>{filtered.length} transactions found</div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px", flexWrap: "wrap" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by merchant or business..."
          style={{ flex: 1, minWidth: "200px", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "9px 14px", color: "#f0fdf4", fontSize: "13px", outline: "none" }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Status</option>
          <option value="FLAGGED">Flagged</option>
          <option value="REVIEW">Review</option>
          <option value="CLEAR">Clear</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={selectStyle}>
          <option value="time">Sort: Newest</option>
          <option value="risk">Sort: Risk (high-low)</option>
          <option value="amount">Sort: Amount (high-low)</option>
        </select>
      </div>

      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 110px 90px 100px 90px", padding: "10px 18px", borderBottom: "1px solid #1a3a1a", color: "#4b5563", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          <span>Merchant</span><span>Business</span><span>Amount</span><span>Risk</span><span>Type</span><span>Status</span>
        </div>
        <div style={{ maxHeight: "560px", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#374151" }}>No transactions match your filters</div>
          ) : filtered.map(tx => {
            const r = getRiskLevel(tx.risk);
            return (
              <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 110px 90px 100px 90px", padding: "11px 18px", borderBottom: "1px solid #0a180a", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#d1fae5" }}>
                  {tx.merchantIcon} {tx.merchant} {tx.manual && <span style={{ background: "#0c447c", color: "#85b7eb", fontSize: "9px", padding: "1px 5px", borderRadius: "3px" }}>manual</span>}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{tx.businessName}</div>
                <div style={{ color: "#f0fdf4", fontFamily: "monospace", fontSize: "12px" }}>₹{tx.amount.toLocaleString("en-IN")}</div>
                <div style={{ color: r.color, fontFamily: "monospace", fontSize: "12px", fontWeight: "700" }}>{tx.risk}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>{tx.type}</div>
                <span style={{ background: r.bg, color: r.color, fontSize: "9px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", textAlign: "center" }}>{tx.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const selectStyle = { background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "9px 12px", color: "#f0fdf4", fontSize: "12px", outline: "none", cursor: "pointer" };
