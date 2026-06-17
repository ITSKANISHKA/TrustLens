import { useState } from "react";
import { useApp } from "../context/AppContext";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function generateInsight(prompt) {
  if (!GEMINI_API_KEY) {
    return "⚠ Add VITE_GEMINI_API_KEY to your .env to enable real AI-generated insights. Showing placeholder analysis based on raw numbers only.";
  }
  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 700 } }),
    });
    const data = await res.json();
    if (data.error) return `⚠ ${data.error.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No insight generated.";
  } catch {
    return "⚠ Couldn't reach Gemini API.";
  }
}

export default function AIInsightsPage() {
  const { businesses, allTransactions, stats } = useApp();
  const [insights, setInsights] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [globalInsight, setGlobalInsight] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);

  const analyzeBusinesss = async (biz) => {
    setLoadingId(biz.id);
    const bizTx = allTransactions.filter(t => t.businessId === biz.id);
    const flagged = bizTx.filter(t => t.risk >= 75);
    const prompt = `You're a fraud analyst. Analyze this business's transaction data and give 3 concise, specific, actionable insights (numbered list, each 1-2 sentences):

Business: ${biz.name} (${biz.category}, ${biz.location})
Total transactions: ${biz.txCount}, Revenue: ₹${biz.revenue}
Flagged as fraud: ${biz.fraudCount} (${Math.round((biz.fraudCount/Math.max(biz.txCount,1))*100)}%)
Sample flagged transactions: ${flagged.slice(0,8).map(t=>`₹${t.amount} via ${t.type} at ${t.location}`).join("; ") || "none"}

Focus on patterns (payment type, location, amount range) and give one concrete next action.`;
    const result = await generateInsight(prompt);
    setInsights(prev => ({ ...prev, [biz.id]: result }));
    setLoadingId(null);
  };

  const analyzeAll = async () => {
    setGlobalLoading(true);
    const summary = businesses.map(b => `${b.name}: ${b.fraudCount}/${b.txCount} flagged (${Math.round((b.fraudCount/Math.max(b.txCount,1))*100)}%), revenue ₹${b.revenue}`).join("\n");
    const prompt = `You're a senior fraud risk consultant reviewing a portfolio of businesses owned by one person. Here's the data:\n\n${summary}\n\nOverall: ${stats.total} transactions, ${stats.flagged} flagged, ${stats.fraudRate}% fraud rate.\n\nGive a portfolio-level executive summary (4-5 sentences): which business needs the most urgent attention, any cross-business patterns, and a prioritized action plan. Be specific with numbers.`;
    const result = await generateInsight(prompt);
    setGlobalInsight(result);
    setGlobalLoading(false);
  };

  return (
    <div>
      <div style={{ color: "#f0fdf4", fontSize: "20px", fontWeight: "700", marginBottom: "4px" }}>AI Insights</div>
      <div style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>Gemini-powered analysis across all your businesses — spot patterns you'd otherwise miss</div>

      <div style={{ background: "linear-gradient(135deg, #0d1f0d, #0a2a1a)", border: "1px solid #166534", borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ color: "#22c55e", fontWeight: "700", fontSize: "13px" }}>🤖 Portfolio-Wide Executive Summary</div>
          <button onClick={analyzeAll} disabled={globalLoading} style={{ background: "#22c55e", border: "none", borderRadius: "7px", padding: "7px 14px", color: "#052e16", fontSize: "11px", fontWeight: "700", cursor: globalLoading ? "not-allowed" : "pointer" }}>
            {globalLoading ? "Analyzing..." : "Generate Summary"}
          </button>
        </div>
        {globalInsight ? (
          <div style={{ color: "#d1fae5", fontSize: "13px", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{globalInsight}</div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: "12px" }}>Click "Generate Summary" for an AI-written overview comparing fraud risk across all {businesses.length} of your businesses.</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
        {businesses.map(b => (
          <div key={b.id} style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>{b.icon}</span>
                <span style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "14px" }}>{b.name}</span>
              </div>
              <button onClick={() => analyzeBusinesss(b)} disabled={loadingId === b.id} style={{ background: "#0a180a", border: "1px solid #1a3a1a", borderRadius: "6px", padding: "5px 11px", color: "#22c55e", fontSize: "10px", cursor: loadingId === b.id ? "not-allowed" : "pointer", fontWeight: "600" }}>
                {loadingId === b.id ? "..." : "Analyze"}
              </button>
            </div>

            {insights[b.id] ? (
              <div style={{ color: "#d1fae5", fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap", background: "#060f06", borderRadius: "8px", padding: "12px" }}>{insights[b.id]}</div>
            ) : (
              <div style={{ color: "#374151", fontSize: "12px", fontStyle: "italic" }}>Click "Analyze" to get AI-generated fraud insights for this business specifically.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
