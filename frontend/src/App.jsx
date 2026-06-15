import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "https://trustlens-rf6v.onrender.com";
const MAX_TRANSACTIONS = 50;

function getRiskLevel(risk) {
  if (risk >= 75) return { label: "HIGH", color: "#ef4444", bg: "#450a0a" };
  if (risk >= 40) return { label: "MED", color: "#f59e0b", bg: "#451a03" };
  return { label: "LOW", color: "#22c55e", bg: "#052e16" };
}

function getMerchantIcon(merchant) {
  const icons = { Amazon: "🛒", Flipkart: "📦", Swiggy: "🍔" };
  return icons[merchant] || "💳";
}

function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 80, h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function RiskGauge({ value }) {
  const r = 38, cx = 50, cy = 50, circ = Math.PI * r;
  const pct = Math.min(Math.max(value, 0), 100) / 100;
  const color = value >= 75 ? "#ef4444" : value >= 40 ? "#f59e0b" : "#22c55e";
  return (
    <svg viewBox="0 0 100 60" width="140" height="84">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1e2a1e" strokeWidth="10" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s ease" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="monospace">{value}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="sans-serif">RISK SCORE</text>
    </svg>
  );
}

function StatCard({ label, value, sub, sparkData, color, prefix }) {
  return (
    <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "18px 20px", flex: "1", minWidth: "160px" }}>
      <div style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{label}</div>
      <div style={{ color: "#f0fdf4", fontSize: "26px", fontWeight: "700", fontFamily: "monospace", lineHeight: 1 }}>{prefix}{value}</div>
      {sub && <div style={{ color: color || "#6b7280", fontSize: "11px", marginTop: "4px" }}>{sub}</div>}
      {sparkData && <div style={{ marginTop: "10px" }}><MiniSparkline data={sparkData} color={color || "#22c55e"} /></div>}
    </div>
  );
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [connected, setConnected] = useState(false);
  const [latestTx, setLatestTx] = useState(null);
  const [stats, setStats] = useState({ total: 0, flagged: 0, totalAmount: 0, avgRisk: 0 });
  const [riskHistory, setRiskHistory] = useState([]);
  const [amountHistory, setAmountHistory] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const socketRef = useRef(null);
  const txIdRef = useRef(0);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("transactionUpdate", (tx) => {
      const enriched = { ...tx, id: ++txIdRef.current, time: new Date(), status: tx.risk >= 75 ? "FLAGGED" : tx.risk >= 40 ? "REVIEW" : "CLEAR" };
      setLatestTx(enriched);
      setTransactions(prev => [enriched, ...prev].slice(0, MAX_TRANSACTIONS));
      setRiskHistory(prev => [...prev.slice(-19), tx.risk]);
      setAmountHistory(prev => [...prev.slice(-19), tx.amount]);
      setStats(prev => {
        const total = prev.total + 1;
        const flagged = prev.flagged + (tx.risk >= 75 ? 1 : 0);
        const totalAmount = prev.totalAmount + tx.amount;
        const avgRisk = Math.round((prev.avgRisk * prev.total + tx.risk) / total);
        return { total, flagged, totalAmount, avgRisk };
      });
    });
    return () => socket.disconnect();
  }, []);

  const filtered = filter === "ALL" ? transactions : transactions.filter(t => t.status === filter);
  const fraudRate = stats.total > 0 ? Math.round((stats.flagged / stats.total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#060f06", color: "#e5e7eb", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <header style={{ background: "#0a180a", borderBottom: "1px solid #1a3a1a", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🔍</span>
          <span style={{ color: "#f0fdf4", fontWeight: "700", fontSize: "17px", letterSpacing: "-0.02em" }}>
            Trust<span style={{ color: "#22c55e" }}>Lens</span>
          </span>
          <span style={{ background: "#052e16", color: "#22c55e", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "999px", border: "1px solid #166534", letterSpacing: "0.05em" }}>LIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", boxShadow: connected ? "0 0 8px #22c55e" : "0 0 8px #ef4444" }} />
          <span style={{ fontSize: "12px", color: "#6b7280" }}>{connected ? "Socket Connected" : "Connecting..."}</span>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 28px" }}>
        <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
          <StatCard label="Transactions Scanned" value={stats.total} sub="+1 every ~3 sec" sparkData={amountHistory} color="#22c55e" />
          <StatCard label="Fraud Flagged" value={stats.flagged} sub={`${fraudRate}% fraud rate`} sparkData={riskHistory} color="#ef4444" />
          <StatCard label="Total Volume" value={stats.totalAmount > 0 ? `${(stats.totalAmount / 100000).toFixed(1)}L` : "0"} sub="₹ processed" color="#f59e0b" prefix="₹" />
          <StatCard label="Avg Risk Score" value={stats.avgRisk} sub={stats.avgRisk >= 50 ? "⚠ Elevated" : "✓ Normal"} color={stats.avgRisk >= 50 ? "#f59e0b" : "#22c55e"} />
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "2", minWidth: "320px" }}>
            <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px" }}>Live Transactions</span>
                  {connected && <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#22c55e", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["ALL", "FLAGGED", "REVIEW", "CLEAR"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#166534" : "transparent", border: `1px solid ${filter === f ? "#22c55e" : "#1a3a1a"}`, color: filter === f ? "#22c55e" : "#6b7280", borderRadius: "6px", padding: "3px 10px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 120px 90px 80px", padding: "8px 20px", borderBottom: "1px solid #1a3a1a", color: "#4b5563", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span>#</span><span>Merchant</span><span>Amount</span><span>Risk</span><span>Status</span>
              </div>
              <div style={{ maxHeight: "440px", overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "48px", textAlign: "center", color: "#374151" }}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>📡</div>
                    <div>Waiting for transactions...</div>
                  </div>
                ) : filtered.map((tx, i) => {
                  const risk = getRiskLevel(tx.risk);
                  const isNew = i === 0 && tx.id === txIdRef.current;
                  return (
                    <div key={tx.id} style={{ display: "grid", gridTemplateColumns: "36px 1fr 120px 90px 80px", padding: "11px 20px", borderBottom: "1px solid #0d1f0d", alignItems: "center", background: isNew ? "#0a2a0a" : "transparent", transition: "background 0.4s ease" }}>
                      <span style={{ color: "#374151", fontSize: "12px", fontFamily: "monospace" }}>{tx.id}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                        <span>{getMerchantIcon(tx.merchant)}</span>
                        <span style={{ color: "#d1fae5" }}>{tx.merchant}</span>
                      </span>
                      <span style={{ color: "#f0fdf4", fontFamily: "monospace", fontSize: "13px" }}>₹{tx.amount.toLocaleString("en-IN")}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "40px", height: "5px", borderRadius: "3px", background: "#1a3a1a", overflow: "hidden" }}>
                          <div style={{ width: `${tx.risk}%`, height: "100%", background: risk.color, transition: "width 0.3s ease" }} />
                        </div>
                        <span style={{ color: risk.color, fontSize: "12px", fontFamily: "monospace", fontWeight: "600" }}>{tx.risk}</span>
                      </div>
                      <span style={{ background: risk.bg, color: risk.color, fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.05em", border: `1px solid ${risk.color}33` }}>{tx.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ flex: "1", minWidth: "260px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {latestTx && (() => {
              const risk = getRiskLevel(latestTx.risk);
              return (
                <div style={{ background: "#0d1f0d", border: `1px solid ${risk.color}44`, borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Latest Alert</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "22px", marginBottom: "4px" }}>{getMerchantIcon(latestTx.merchant)}</div>
                      <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "15px" }}>{latestTx.merchant}</div>
                      <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{latestTx.time.toLocaleTimeString()}</div>
                      <div style={{ color: "#d1fae5", fontFamily: "monospace", fontSize: "18px", fontWeight: "700", marginTop: "8px" }}>₹{latestTx.amount.toLocaleString("en-IN")}</div>
                    </div>
                    <RiskGauge value={latestTx.risk} />
                  </div>
                  <div style={{ marginTop: "14px", background: risk.bg, border: `1px solid ${risk.color}33`, borderRadius: "8px", padding: "8px 12px", color: risk.color, fontSize: "12px", fontWeight: "600", textAlign: "center", letterSpacing: "0.05em" }}>
                    {latestTx.status === "FLAGGED" ? "⚠ FRAUD DETECTED" : latestTx.status === "REVIEW" ? "🔎 NEEDS REVIEW" : "✓ TRANSACTION CLEAR"}
                  </div>
                </div>
              );
            })()}

            {transactions.length > 0 && (() => {
              const counts = {}, risks = {};
              transactions.forEach(t => { counts[t.merchant] = (counts[t.merchant] || 0) + 1; risks[t.merchant] = (risks[t.merchant] || 0) + t.risk; });
              return (
                <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Merchant Risk Breakdown</div>
                  {Object.entries(counts).map(([merchant, count]) => {
                    const avgRisk = Math.round(risks[merchant] / count);
                    const rl = getRiskLevel(avgRisk);
                    return (
                      <div key={merchant} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#d1fae5" }}>{getMerchantIcon(merchant)} {merchant}</span>
                          <span style={{ fontSize: "12px", color: rl.color, fontFamily: "monospace" }}>{avgRisk} avg</span>
                        </div>
                        <div style={{ background: "#1a3a1a", borderRadius: "3px", height: "4px" }}>
                          <div style={{ width: `${avgRisk}%`, height: "100%", background: rl.color, borderRadius: "3px", transition: "width 0.5s ease" }} />
                        </div>
                        <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>{count} transactions</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {transactions.length > 0 && (() => {
              const high = transactions.filter(t => t.risk >= 75).length;
              const med = transactions.filter(t => t.risk >= 40 && t.risk < 75).length;
              const low = transactions.filter(t => t.risk < 40).length;
              const total = transactions.length;
              return (
                <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "20px" }}>
                  <div style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>Risk Distribution</div>
                  {[{ label: "High Risk (≥75)", count: high, color: "#ef4444" }, { label: "Medium (40–74)", count: med, color: "#f59e0b" }, { label: "Low Risk (<40)", count: low, color: "#22c55e" }].map(({ label, count, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: "11px", color: "#9ca3af" }}>{label}</div>
                      <div style={{ background: "#1a3a1a", borderRadius: "3px", height: "6px", width: "80px" }}>
                        <div style={{ width: `${(count / total) * 100}%`, height: "100%", background: color, borderRadius: "3px", transition: "width 0.5s ease" }} />
                      </div>
                      <div style={{ fontSize: "12px", fontFamily: "monospace", color, width: "24px", textAlign: "right" }}>{count}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a180a}::-webkit-scrollbar-thumb{background:#1a3a1a;border-radius:2px}button{font-family:inherit}`}</style>
    </div>
  );
}
