import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import RiskGauge from "../components/RiskGauge";
import Sparkline from "../components/Sparkline";
import AddTransactionModal from "../components/AddTransactionModal";
import { getRiskLevel } from "../utils/risk";

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const { businesses, transactions, stats, selectedBusiness } = useApp();
  const [showModal, setShowModal] = useState(false);

  const latest = transactions[0];
  const riskHistory = transactions.slice(0, 20).map(t => t.risk).reverse();
  const amountHistory = transactions.slice(0, 20).map(t => t.amount).reverse();

  const topRiskyBusiness = businesses.length
    ? [...businesses].sort((a, b) => (b.fraudCount / Math.max(b.txCount,1)) - (a.fraudCount / Math.max(a.txCount,1)))[0]
    : null;

  return (
    <div>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700" }}>Welcome back, {user.name.split(" ")[0]} 👋</div>
          <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>
            {selectedBusiness === "all" ? `Tracking ${businesses.length} businesses` : "Viewing single business"} · Live monitoring active
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowModal(true)} style={btnPrimary}>+ Add Transaction</button>
          <button onClick={() => onNavigate("ai")} style={btnSecondary}>🤖 AI Insights</button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <StatCard label="Transactions" value={stats.total} sub="+1 every ~4 sec" color="#22c55e" spark={amountHistory} />
        <StatCard label="Fraud Flagged" value={stats.flagged} sub={`${stats.fraudRate}% fraud rate`} color="#ef4444" spark={riskHistory} />
        <StatCard label="Under Review" value={stats.review} sub="needs attention" color="#f59e0b" />
        <StatCard label="Total Volume" value={`₹${(stats.totalAmount / 100000).toFixed(1)}L`} sub="processed" color="#3b82f6" />
        <StatCard label="Avg Risk Score" value={stats.avgRisk} sub={stats.avgRisk >= 50 ? "⚠ Elevated" : "✓ Normal"} color={stats.avgRisk >= 50 ? "#f59e0b" : "#22c55e"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px", alignItems: "start" }} className="dash-grid">

        {/* Live feed */}
        <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "13px", display: "flex", alignItems: "center", gap: "7px" }}>
              Live Transaction Feed
              <span style={{ width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            </div>
            <span onClick={() => onNavigate("transactions")} style={{ color: "#22c55e", fontSize: "11px", cursor: "pointer" }}>View all →</span>
          </div>
          <div style={{ maxHeight: "440px", overflowY: "auto" }}>
            {transactions.slice(0, 15).map((tx, i) => {
              const r = getRiskLevel(tx.risk);
              return (
                <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 90px 80px", padding: "10px 18px", borderBottom: "1px solid #0a180a", alignItems: "center", background: i === 0 ? "#0a2a0a" : "transparent" }}>
                  <div style={{ fontSize: "12px", color: "#d1fae5", display: "flex", alignItems: "center", gap: "7px" }}>
                    <span>{tx.merchantIcon}</span>
                    <div>
                      <div>{tx.merchant}</div>
                      <div style={{ color: "#4b5563", fontSize: "10px" }}>{tx.businessName}</div>
                    </div>
                  </div>
                  <div style={{ color: "#f0fdf4", fontFamily: "monospace", fontSize: "12px" }}>₹{tx.amount.toLocaleString("en-IN")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "34px", height: "4px", background: "#1a3a1a", borderRadius: "2px" }}>
                      <div style={{ width: `${tx.risk}%`, height: "100%", background: r.color, borderRadius: "2px" }} />
                    </div>
                    <span style={{ color: r.color, fontSize: "11px", fontFamily: "monospace" }}>{tx.risk}</span>
                  </div>
                  <span style={{ background: r.bg, color: r.color, fontSize: "9px", fontWeight: "700", padding: "2px 6px", borderRadius: "3px", textAlign: "center" }}>{tx.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {latest && (() => {
            const r = getRiskLevel(latest.risk);
            return (
              <div style={{ background: "#0d1f0d", border: `1px solid ${r.color}44`, borderRadius: "14px", padding: "18px" }}>
                <div style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Latest Alert</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "20px" }}>{latest.merchantIcon}</div>
                    <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px" }}>{latest.merchant}</div>
                    <div style={{ color: "#6b7280", fontSize: "11px" }}>{latest.businessName}</div>
                    <div style={{ color: "#d1fae5", fontFamily: "monospace", fontSize: "16px", fontWeight: "700", marginTop: "6px" }}>₹{latest.amount.toLocaleString("en-IN")}</div>
                  </div>
                  <RiskGauge value={latest.risk} />
                </div>
              </div>
            );
          })()}

          {/* AI recommendation card */}
          <div style={{ background: "linear-gradient(135deg, #0d1f0d, #0a2a1a)", border: "1px solid #166534", borderRadius: "14px", padding: "18px" }}>
            <div style={{ color: "#22c55e", fontSize: "11px", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>🤖 AI RECOMMENDATION</div>
            {topRiskyBusiness && (
              <div style={{ color: "#d1fae5", fontSize: "12px", lineHeight: "1.6" }}>
                <strong>{topRiskyBusiness.name}</strong> has the highest fraud ratio ({topRiskyBusiness.fraudCount}/{topRiskyBusiness.txCount} txns).
                Consider tightening risk thresholds for {topRiskyBusiness.category} transactions above ₹50,000.
              </div>
            )}
            <button onClick={() => onNavigate("ai")} style={{ marginTop: "12px", background: "#22c55e", border: "none", borderRadius: "7px", padding: "7px 14px", color: "#052e16", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>Get full analysis →</button>
          </div>

          {/* Business mini cards */}
          <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "18px" }}>
            <div style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Your Businesses</div>
            {businesses.map(b => (
              <div key={b.id} onClick={() => onNavigate("business")} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0a180a", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{b.icon}</span>
                  <span style={{ fontSize: "12px", color: "#d1fae5" }}>{b.name}</span>
                </div>
                <span style={{ fontSize: "11px", color: b.fraudCount > 30 ? "#ef4444" : "#22c55e", fontFamily: "monospace" }}>{b.fraudCount} flagged</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, sub, color, spark }) {
  return (
    <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "16px 18px" }}>
      <div style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>{label}</div>
      <div style={{ color: "#f0fdf4", fontSize: "23px", fontWeight: "700", fontFamily: "monospace" }}>{value}</div>
      <div style={{ color, fontSize: "11px", marginTop: "3px" }}>{sub}</div>
      {spark && spark.length > 1 && <div style={{ marginTop: "8px" }}><Sparkline data={spark} color={color} /></div>}
    </div>
  );
}

const btnPrimary = { background: "#22c55e", border: "none", borderRadius: "8px", padding: "8px 16px", color: "#052e16", fontWeight: "700", fontSize: "12px", cursor: "pointer" };
const btnSecondary = { background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "8px 16px", color: "#22c55e", fontWeight: "600", fontSize: "12px", cursor: "pointer" };
