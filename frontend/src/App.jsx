import { useState, useEffect, createContext, useContext } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import BusinessPage from "./pages/BusinessPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TransactionsPage from "./pages/TransactionsPage";
import AIInsightsPage from "./pages/AIInsightsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

function Router() {
  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");

  if (!user) {
    return page === "signup"
      ? <SignupPage onSwitch={() => setPage("login")} />
      : <LoginPage onSwitch={() => setPage("signup")} />;
  }

  const pages = {
    dashboard: <Dashboard onNavigate={setPage} />,
    business: <BusinessPage onNavigate={setPage} />,
    analytics: <AnalyticsPage />,
    transactions: <TransactionsPage />,
    ai: <AIInsightsPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage />,
  };

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {pages[page] || <Dashboard onNavigate={setPage} />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </AuthProvider>
  );
}
