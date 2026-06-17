import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import ChatBot from "./ChatBot";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "business", label: "My Businesses", icon: "🏢" },
  { id: "transactions", label: "Transactions", icon: "💳" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "ai", label: "AI Insights", icon: "🤖" },
  { id: "reports", label: "Reports", icon: "📄" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function Layout({ children, currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const { businesses, selectedBusiness, setSelectedBusiness, notifications, markNotifRead, clearNotifs } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#060f06", color: "#e5e7eb", fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? "220px" : "64px", background: "#0a180a", borderRight: "1px solid #1a3a1a",
        display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflow: "hidden"
      }}>
        <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #1a3a1a", height: "56px" }}>
          <span style={{ fontSize: "20px" }}>🔍</span>
          {sidebarOpen && <span style={{ color: "#f0fdf4", fontWeight: "700", fontSize: "16px", whiteSpace: "nowrap" }}>Trust<span style={{ color: "#22c55e" }}>Lens</span></span>}
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(item => (
            <div key={item.id} onClick={() => onNavigate(item.id)} style={{
              display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px",
              borderRadius: "8px", cursor: "pointer", marginBottom: "3px",
              background: currentPage === item.id ? "#166534" : "transparent",
              color: currentPage === item.id ? "#22c55e" : "#9ca3af",
              fontSize: "13px", fontWeight: currentPage === item.id ? "600" : "400",
              whiteSpace: "nowrap", transition: "all 0.15s"
            }}>
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </div>
          ))}
        </nav>

        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: "14px", borderTop: "1px solid #1a3a1a", textAlign: "center", cursor: "pointer", color: "#4b5563", fontSize: "13px" }}>
          {sidebarOpen ? "◂ Collapse" : "▸"}
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: "#0a180a", borderBottom: "1px solid #1a3a1a", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", position: "sticky", top: 0, zIndex: 100 }}>
          <select value={selectedBusiness} onChange={e => setSelectedBusiness(e.target.value)} style={{
            background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "7px 12px",
            color: "#f0fdf4", fontSize: "12px", outline: "none", fontFamily: "inherit", cursor: "pointer"
          }}>
            <option value="all">🏢 All Businesses</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={() => setShowChat(true)} style={{
              background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px",
              padding: "7px 12px", color: "#22c55e", fontSize: "12px", cursor: "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600"
            }}>🤖 Ask AI</button>

            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{
                background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px",
                padding: "7px 10px", color: "#f0fdf4", fontSize: "14px", cursor: "pointer", position: "relative"
              }}>
                🔔
                {unreadCount > 0 && <span style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "#fff", fontSize: "9px", fontWeight: "700", borderRadius: "50%", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
              </button>
              {showNotifs && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "10px", width: "320px", maxHeight: "400px", overflowY: "auto", zIndex: 200 }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #1a3a1a", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#f0fdf4", fontWeight: "600", fontSize: "13px" }}>Notifications</span>
                    {notifications.length > 0 && <span onClick={clearNotifs} style={{ color: "#6b7280", fontSize: "11px", cursor: "pointer" }}>Clear all</span>}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "#374151", fontSize: "12px" }}>No notifications</div>
                  ) : notifications.map(n => (
                    <div key={n.id} onClick={() => markNotifRead(n.id)} style={{ padding: "12px 14px", borderBottom: "1px solid #0a180a", background: n.read ? "transparent" : "#0a2a0a", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                        <span style={{ color: "#ef4444", fontSize: "12px" }}>⚠</span>
                        <span style={{ color: "#f0fdf4", fontSize: "12px", fontWeight: "600" }}>{n.title}</span>
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: "11px" }}>{n.msg}</div>
                      <div style={{ color: "#4b5563", fontSize: "10px", marginTop: "3px" }}>{n.time.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "8px",
                padding: "6px 12px", color: "#f0fdf4", fontSize: "12px", cursor: "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", gap: "7px"
              }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#166534", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#22c55e" }}>{user.avatar}</div>
                {user.name} <span style={{ color: "#6b7280", fontSize: "10px" }}>▾</span>
              </button>
              {showUserMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "10px", padding: "8px", minWidth: "190px", zIndex: 200 }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a3a1a", marginBottom: "6px" }}>
                    <div style={{ color: "#f0fdf4", fontSize: "13px", fontWeight: "600" }}>{user.name}</div>
                    <div style={{ color: "#6b7280", fontSize: "11px" }}>{user.email}</div>
                    <span style={{ background: "#052e16", color: "#22c55e", fontSize: "10px", padding: "1px 7px", borderRadius: "4px", marginTop: "4px", display: "inline-block" }}>{user.plan} Plan</span>
                  </div>
                  <div onClick={() => { onNavigate("settings"); setShowUserMenu(false); }} style={{ padding: "8px 12px", color: "#9ca3af", fontSize: "12px", cursor: "pointer", borderRadius: "6px" }}>⚙️ Settings</div>
                  <button onClick={logout} style={{ width: "100%", background: "#450a0a", border: "1px solid #ef444433", borderRadius: "7px", padding: "8px 12px", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", textAlign: "left", marginTop: "4px" }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}

      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: #0a180a; } ::-webkit-scrollbar-thumb { background: #1a3a1a; border-radius: 3px; } button { font-family: inherit; }`}</style>
    </div>
  );
}
