require("dotenv").config();
const { Server } = require("socket.io");
const http = require("http");
const app = require("./app");
const cors = require("cors");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connextion connected", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`user joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("connection disconnected", socket.id);
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
