import { Server } from "socket.io";

export function initializeSocket(server) {
  console.log("🟢 Initializing WebSocket Server...");

  const io = new Server(server, {
    cors: {
      origin: "*", // ✅ Allow all origins (Change in production)
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // ✅ Use WebSocket + Polling fallback
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New WebSocket Connection: ${socket.id}`);

    socket.onAny((event, ...args) => {
      console.log(`🔍 Received Event: ${event}`, args);
    });

    socket.on("sendMessage", (message) => {
      console.log("📩 Message received:", message);
      io.emit("receiveMessage", message); // ✅ Broadcast to all clients
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
