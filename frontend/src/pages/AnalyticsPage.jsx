import { useApp } from "../context/AppContext";
import { getRiskLevel } from "../utils/risk";

export default function AnalyticsPage() {
  const { businesses, allTransactions } = useApp();

  const maxRevenue = Math.max(...businesses.map(b => b.revenue), 1);
  const maxTx = Math.max(...businesses.map(b => b.txCount), 1);

  const high = allTransactions.filter(t => t.risk >= 75).length;
  const med = allTransactions.filter(t => t.risk >= 45 && t.risk < 75).length;
  const low = allTransactions.filter(t => t.risk < 45).length;
  const total = allTransactions.length || 1;

  const byType = {};
  allTransactions.forEach(t => { byType[t.type] = (byType[t.type] || 0) + 1; });

  const byLocation = {};
  allTransactions.forEach(t => { byLocation[t.location] = (byLocation[t.location] || 0) + 1; });

  return (
    <div>
      <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>Cross-Business Analytics</div>
      <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>Compare fraud patterns across all your businesses at a glance</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }} className="grid-2">

        {/* Revenue comparison */}
        <Panel title="Revenue by Business">
          {businesses.map(b => (
            <BarRow key={b.id} label={`${b.icon} ${b.name}`} value={`₹${(b.revenue/100000).toFixed(1)}L`} pct={(b.revenue / maxRevenue) * 100} color="#22c55e" />
          ))}
        </Panel>

        {/* Fraud rate comparison */}
        <Panel title="Fraud Rate by Business">
          {businesses.map(b => {
            const rate = b.txCount ? Math.round((b.fraudCount / b.txCount) * 100) : 0;
            return <BarRow key={b.id} label={`${b.icon} ${b.name}`} value={`${rate}%`} pct={rate} color={rate > 4 ? "#ef4444" : "#22c55e"} />;
          })}
        </Panel>

        {/* Risk distribution */}
        <Panel title="Overall Risk Distribution">
          <BarRow label="High Risk" value={high} pct={(high/total)*100} color="#ef4444" />
          <BarRow label="Medium Risk" value={med} pct={(med/total)*100} color="#f59e0b" />
          <BarRow label="Low Risk" value={low} pct={(low/total)*100} color="#22c55e" />
        </Panel>

        {/* Transactions by payment type */}
        <Panel title="Transactions by Payment Type">
          {Object.entries(byType).sort((a,b)=>b[1]-a[1]).map(([type, count]) => (
            <BarRow key={type} label={type} value={count} pct={(count/total)*100} color="#3b82f6" />
          ))}
        </Panel>

        {/* By location */}
        <Panel title="Transactions by Location">
          {Object.entries(byLocation).sort((a,b)=>b[1]-a[1]).map(([loc, count]) => (
            <BarRow key={loc} label={loc} value={count} pct={(count/total)*100} color="#a855f7" />
          ))}
        </Panel>

        {/* Volume comparison */}
        <Panel title="Transaction Volume by Business">
          {businesses.map(b => (
            <BarRow key={b.id} label={`${b.icon} ${b.name}`} value={b.txCount} pct={(b.txCount / maxTx) * 100} color="#f59e0b" />
          ))}
        </Panel>
      </div>

      <style>{`@media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "18px" }}>
      <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "13px", marginBottom: "14px" }}>{title}</div>
      {children}
    </div>
  );
}

function BarRow({ label, value, pct, color }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "12px", color: "#d1fae5" }}>{label}</span>
        <span style={{ fontSize: "12px", color, fontFamily: "monospace" }}>{value}</span>
      </div>
      <div style={{ background: "#1a3a1a", borderRadius: "3px", height: "5px" }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}
