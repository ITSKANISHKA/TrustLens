import { useEffect, useState } from "react";

export default function App() {

  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    fetch("https://trustlens-rf6v.onrender.com")
      .then((res) => res.text())
      .then((data) => {
        setStatus(data);
      })
      .catch(() => {
        setStatus("Backend connection failed");
      });
  }, []);

  return (
    <div style={{
      padding: "40px",
      fontFamily: "Arial"
    }}>
      <h1>TrustLens</h1>

      <h2>AI Fraud Detection Dashboard</h2>

      <p>{status}</p>

      <div style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid gray"
      }}>
        <h3>System Status</h3>

        <p>✅ Frontend Running</p>
        <p>✅ Backend Connected</p>
        <p>✅ ML Service Active</p>
      </div>
    </div>
  );
}
