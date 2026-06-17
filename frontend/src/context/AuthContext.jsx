import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const DEMO_USERS = [
  { id: "u1", email: "admin@trustlens.com", password: "admin123", name: "Raj Sharma", role: "Owner", avatar: "RS", plan: "Enterprise", businesses: ["b1","b2","b3"] },
  { id: "u2", email: "analyst@trustlens.com", password: "analyst123", name: "Priya Singh", role: "Analyst", avatar: "PS", plan: "Pro", businesses: ["b1"] },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("tl_user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    await new Promise(r => setTimeout(r, 900));
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    const { password: _, ...safeUser } = found;
    localStorage.setItem("tl_user", JSON.stringify(safeUser));
    setUser(safeUser);
    return safeUser;
  };

  const signup = async (name, email, password) => {
    await new Promise(r => setTimeout(r, 1000));
    if (DEMO_USERS.find(u => u.email === email)) throw new Error("Email already exists");
    const newUser = {
      id: `u${Date.now()}`, name, email, role: "Owner",
      avatar: name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2),
      plan: "Free", businesses: []
    };
    localStorage.setItem("tl_user", JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem("tl_user");
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem("tl_user", JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
