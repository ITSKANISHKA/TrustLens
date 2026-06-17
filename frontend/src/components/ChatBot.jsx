import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";

// Uses Gemini API. Set your key in frontend/.env as VITE_GEMINI_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function buildContext(businesses, transactions, stats) {
  const bizSummary = businesses.map(b =>
    `${b.name} (${b.category}, ${b.location}): ₹${b.revenue.toLocaleString("en-IN")} revenue, ${b.txCount} transactions, ${b.fraudCount} flagged as fraud`
  ).join("\n");

  const recentFlagged = transactions.filter(t => t.risk >= 75).slice(0, 10).map(t =>
    `₹${t.amount} at ${t.merchant} (${t.businessName}) - risk ${t.risk}, ${t.type}, ${t.location}`
  ).join("\n");

  return `You are TrustLens AI, a fraud-analytics assistant embedded in a multi-business fraud detection dashboard.

CURRENT DATA SNAPSHOT:
Businesses:
${bizSummary}

Overall stats: ${stats.total} transactions analyzed, ${stats.flagged} flagged as high-risk fraud, ${stats.fraudRate}% fraud rate, average risk score ${stats.avgRisk}, total volume ₹${stats.totalAmount.toLocaleString("en-IN")}.

Recent high-risk transactions:
${recentFlagged || "None currently"}

Answer the user's question using this data. Be specific with numbers from the data above. If asked to compare businesses, use the actual figures. Keep responses concise (3-5 sentences unless they ask for detail). If asked about a business not in the list, say you don't have data on it. Format key numbers clearly.`;
}

async function callGemini(userMessage, history, businesses, transactions, stats) {
  if (!GEMINI_API_KEY) {
    return "⚠ Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file to enable real AI responses. For now, here's a basic summary: " +
      `You have ${businesses.length} businesses tracked, ${stats.flagged} fraud alerts out of ${stats.total} transactions (${stats.fraudRate}% fraud rate).`;
  }

  const systemContext = buildContext(businesses, transactions, stats);
  const contents = [
    { role: "user", parts: [{ text: systemContext }] },
    { role: "model", parts: [{ text: "Understood. I'm ready to help analyze the fraud data across your businesses." }] },
    ...history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.4, maxOutputTokens: 500 } }),
    });
    const data = await res.json();
    if (data.error) return `⚠ API error: ${data.error.message}`;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
  } catch (err) {
    return "⚠ Couldn't reach Gemini API. Check your network/API key.";
  }
}

const SUGGESTIONS = [
  "Which business has the highest fraud rate?",
  "Summarize today's flagged transactions",
  "Compare all my businesses by risk",
  "What patterns do you see in the fraud data?",
];

export default function ChatBot({ onClose }) {
  const { businesses, allTransactions, stats } = useApp();
  const [messages, setMessages] = useState([
    { role: "model", text: "Hi! I'm TrustLens AI 🤖 — ask me anything about your fraud data across your businesses. For example: \"Which business has the most fraud?\" or \"Summarize this week's high-risk transactions.\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");
    const newMessages = [...messages, { role: "user", text: msg }];
    setMessages(newMessages);
    setLoading(true);
    const reply = await callGemini(msg, newMessages, businesses, allTransactions, stats);
    setMessages(prev => [...prev, { role: "model", text: reply }]);
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "380px", maxWidth: "calc(100vw - 40px)", height: "560px", maxHeight: "calc(100vh - 40px)", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "16px", display: "flex", flexDirection: "column", zIndex: 999, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🤖</span>
          <div>
            <div style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "13px" }}>TrustLens AI</div>
            <div style={{ color: "#22c55e", fontSize: "10px" }}>● Online · Gemini-powered</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px" }}>✕</button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div style={{
              background: m.role === "user" ? "#166534" : "#060f06",
              border: m.role === "user" ? "none" : "1px solid #1a3a1a",
              color: m.role === "user" ? "#f0fdf4" : "#d1fae5",
              borderRadius: "12px", padding: "9px 13px", fontSize: "13px", lineHeight: "1.5", whiteSpace: "pre-wrap"
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "12px", padding: "9px 13px", fontSize: "13px", color: "#6b7280" }}>
            <span className="typing-dots">Analyzing data...</span>
          </div>
        )}

        {messages.length === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ textAlign: "left", background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "8px 12px", color: "#9ca3af", fontSize: "12px", cursor: "pointer", fontFamily: "inherit" }}>
                💬 {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 14px", borderTop: "1px solid #1a3a1a", display: "flex", gap: "8px" }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about your fraud data..."
          style={{ flex: 1, background: "#060f06", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "9px 12px", color: "#f0fdf4", fontSize: "13px", outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={() => send()} disabled={loading} style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "9px 14px", color: "#052e16", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px" }}>➤</button>
      </div>
    </div>
  );
}
