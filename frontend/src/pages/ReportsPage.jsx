import { useApp } from "../context/AppContext";

export default function ReportsPage() {
  const { businesses, allTransactions, stats } = useApp();

  const downloadCSV = () => {
    const headers = ["ID", "Business", "Merchant", "Amount", "Risk Score", "Status", "Type", "Location", "Time"];
    const rows = allTransactions.map(t => [t.id, t.businessName, t.merchant, t.amount, t.risk, t.status, t.type, t.location, t.time.toISOString()]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `trustlens-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Reports</div>
      <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>Download fraud analytics reports for compliance or record-keeping</div>

      <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "22px", marginBottom: "16px" }}>
        <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px", marginBottom: "14px" }}>Summary — All Businesses</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "18px" }}>
          <Stat label="Total Transactions" value={stats.total} />
          <Stat label="Flagged Fraud" value={stats.flagged} color="#ef4444" />
          <Stat label="Fraud Rate" value={`${stats.fraudRate}%`} color="#f59e0b" />
          <Stat label="Total Volume" value={`₹${(stats.totalAmount/100000).toFixed(1)}L`} />
        </div>
        <button onClick={downloadCSV} style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "10px 18px", color: "#052e16", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
          ⬇ Download Full CSV Report
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
        {businesses.map(b => (
          <div key={b.id} style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontSize: "18px" }}>{b.icon}</span>
              <span style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "13px" }}>{b.name}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#9ca3af", lineHeight: "1.8" }}>
              <div>Revenue: <span style={{ color: "#d1fae5", fontFamily: "monospace" }}>₹{b.revenue.toLocaleString("en-IN")}</span></div>
              <div>Transactions: <span style={{ color: "#d1fae5", fontFamily: "monospace" }}>{b.txCount}</span></div>
              <div>Fraud flagged: <span style={{ color: "#ef4444", fontFamily: "monospace" }}>{b.fraudCount}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, color = "#f0fdf4" }) {
  return (
    <div style={{ background: "#060f06", borderRadius: "8px", padding: "10px 14px" }}>
      <div style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color, fontSize: "18px", fontWeight: "700", fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
