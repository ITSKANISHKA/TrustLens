
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

function randomTransaction() {
  return {
    merchant: ["Amazon", "Flipkart", "Swiggy"][Math.floor(Math.random() * 3)],
    amount: Math.floor(Math.random() * 100000),
    risk: Math.floor(Math.random() * 100)
  };
}

io.on("connection", (socket) => {
  console.log("Client connected");
});

setInterval(() => {
  io.emit("transactionUpdate", randomTransaction());
}, 3000);

app.get("/", (req, res) => {
  res.send("TrustLens Backend Running");
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
