import { Server } from "socket.io";

export function initializeSocket(res) {
  if (res.socket.server.io) {
    console.log("✅ WebSocket server already running.");
    return res.socket.server.io;
  }

  console.log("🟢 Initializing WebSocket Server...");

  const io = new Server(res.socket.server, {
    path: "/api/socket", // ✅ Custom WebSocket path for Vercel
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["polling"], // ✅ Use polling for Vercel
    addTrailingSlash: false, // ✅ Fix for WebSockets in Vercel
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New WebSocket Connection: ${socket.id}`);

    socket.onAny((event, ...args) => {
      console.log(`🔍 Received Event: ${event}`, args);
    });

    socket.on("sendMessage", (message) => {
      console.log("📩 Message received:", message);
      io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  res.socket.server.io = io;
  return io;
}
