
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const socket = io("http://localhost:5000");

export default function App() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    socket.on("transactionUpdate", (data) => {
      setTransactions((prev) => [data, ...prev.slice(0, 9)]);
    });
  }, []);

  const chartData = {
    labels: transactions.map((_, i) => `T${i + 1}`),
    datasets: [
      {
        label: "Transaction Amount",
        data: transactions.map((t) => t.amount)
      }
    ]
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>TrustLens Dashboard</h1>

      <Line data={chartData} />

      <h2>Live Transactions</h2>

      {transactions.map((t, index) => (
        <div
          key={index}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px"
          }}
        >
          <p>Merchant: {t.merchant}</p>
          <p>Amount: ₹{t.amount}</p>
          <p>Risk Score: {t.risk}</p>
        </div>
      ))}
    </div>
  );
}
