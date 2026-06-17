import { createContext, useContext, useState, useEffect, useRef } from "react";

const AppContext = createContext(null);

const DEMO_BUSINESSES = [
  { id: "b1", name: "Sharma Electronics", category: "Electronics", location: "Mumbai", revenue: 8500000, txCount: 1240, fraudCount: 23, color: "#22c55e", icon: "🔌" },
  { id: "b2", name: "Raj Fashion Hub", category: "Fashion", location: "Delhi", revenue: 3200000, txCount: 890, fraudCount: 41, color: "#f59e0b", icon: "👗" },
  { id: "b3", name: "QuickBite Foods", category: "Food & Beverage", location: "Bangalore", revenue: 1800000, txCount: 2100, fraudCount: 67, color: "#ef4444", icon: "🍔" },
];

const MERCHANTS = ["Amazon", "Flipkart", "Swiggy", "Zomato", "Myntra", "Paytm", "Razorpay", "PhonePe", "HDFC", "ICICI"];
const MERCHANT_ICONS = { Amazon:"🛒", Flipkart:"📦", Swiggy:"🍔", Zomato:"🍕", Myntra:"👗", Paytm:"💰", Razorpay:"💳", PhonePe:"📱", HDFC:"🏦", ICICI:"🏛" };

function generateTx(businesses, id) {
  const biz = businesses[Math.floor(Math.random() * businesses.length)];
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const amount = Math.floor(Math.random() * 150000) + 500;
  let risk = Math.floor(Math.random() * 50);
  if (amount > 80000) risk += 25;
  if (amount > 120000) risk += 20;
  if (Math.random() > 0.85) risk += 30;
  risk = Math.min(risk + Math.floor(Math.random() * 15), 99);
  return {
    id, businessId: biz.id, businessName: biz.name, merchant,
    merchantIcon: MERCHANT_ICONS[merchant] || "💳",
    amount, risk,
    status: risk >= 75 ? "FLAGGED" : risk >= 45 ? "REVIEW" : "CLEAR",
    time: new Date(), type: ["UPI","Card","NetBanking","Wallet"][Math.floor(Math.random()*4)],
    location: ["Mumbai","Delhi","Bangalore","Chennai","Pune"][Math.floor(Math.random()*5)],
    device: ["Mobile","Desktop","Tablet"][Math.floor(Math.random()*3)],
    manual: false,
  };
}

export function AppProvider({ children }) {
  const [businesses, setBusinesses] = useState(DEMO_BUSINESSES);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const txIdRef = useRef(1000);
  const intervalRef = useRef(null);

  const addTx = (tx) => {
    const enriched = { ...tx, id: ++txIdRef.current, time: new Date() };
    setTransactions(prev => [enriched, ...prev].slice(0, 200));
    if (enriched.risk >= 75) {
      setNotifications(prev => [{
        id: Date.now(), type: "fraud", title: "Fraud Alert!",
        msg: `High risk transaction ₹${enriched.amount.toLocaleString("en-IN")} at ${enriched.merchant}`,
        business: enriched.businessName, time: new Date(), read: false,
      }, ...prev].slice(0, 20));
    }
    setBusinesses(prev => prev.map(b =>
      b.id === enriched.businessId
        ? { ...b, txCount: b.txCount + 1, fraudCount: enriched.risk >= 75 ? b.fraudCount + 1 : b.fraudCount, revenue: b.revenue + enriched.amount }
        : b
    ));
  };

  const addManualTx = (txData) => {
    const biz = businesses.find(b => b.id === txData.businessId) || businesses[0];
    addTx({ ...txData, businessName: biz.name, merchantIcon: MERCHANT_ICONS[txData.merchant] || "💳", manual: true });
  };

  const addBusiness = (bizData) => {
    const newBiz = { ...bizData, id: `b${Date.now()}`, revenue: 0, txCount: 0, fraudCount: 0 };
    setBusinesses(prev => [...prev, newBiz]);
  };

  const markNotifRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifs = () => setNotifications([]);

  useEffect(() => {
    // seed initial transactions
    const initial = Array.from({ length: 30 }, (_, i) => generateTx(DEMO_BUSINESSES, i + 1));
    setTransactions(initial);
    txIdRef.current = 31;
    intervalRef.current = setInterval(() => {
      const tx = generateTx(DEMO_BUSINESSES, ++txIdRef.current);
      setTransactions(prev => [tx, ...prev].slice(0, 200));
      if (tx.risk >= 75) {
        setNotifications(prev => [{
          id: Date.now(), type: "fraud", title: "Fraud Alert!",
          msg: `High risk ₹${tx.amount.toLocaleString("en-IN")} at ${tx.merchant} — ${tx.businessName}`,
          business: tx.businessName, time: new Date(), read: false,
        }, ...prev].slice(0, 20));
      }
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const filteredTx = selectedBusiness === "all"
    ? transactions
    : transactions.filter(t => t.businessId === selectedBusiness);

  const stats = {
    total: filteredTx.length,
    flagged: filteredTx.filter(t => t.risk >= 75).length,
    review: filteredTx.filter(t => t.risk >= 45 && t.risk < 75).length,
    clear: filteredTx.filter(t => t.risk < 45).length,
    totalAmount: filteredTx.reduce((s, t) => s + t.amount, 0),
    avgRisk: filteredTx.length ? Math.round(filteredTx.reduce((s, t) => s + t.risk, 0) / filteredTx.length) : 0,
    fraudRate: filteredTx.length ? Math.round((filteredTx.filter(t => t.risk >= 75).length / filteredTx.length) * 100) : 0,
  };

  return (
    <AppContext.Provider value={{
      businesses, selectedBusiness, setSelectedBusiness,
      transactions: filteredTx, allTransactions: transactions,
      stats, notifications, addManualTx, addBusiness,
      markNotifRead, clearNotifs,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
