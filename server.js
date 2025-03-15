import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { initializeSocket } from "./socket/socket.js";

import ErrorHandler from "./middleware/ErrorHandler.js";
import { authenticateUser } from "./middleware/Authentication.js";

import AuthRouter from "./routers/AuthRouter.js";
import UserRouter from "./routers/userRouter.js";
import MessageRouter from "./routers/messages.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ WebSocket API route (for Vercel)
app.all("/api/socket", (req, res) => {
  if (res.socket.server.io) {
    console.log("✅ WebSocket server already running.");
  } else {
    console.log("🚀 Starting WebSocket server...");
    initializeSocket(res); // ✅ Attach WebSocket server to `res.socket.server`
  }
  res.end();
});

// API Routes
app.get("/api/health", (req, res) => {
  res.send({ message: "Server is Working" });
});

app.use("/api/protected", authenticateUser, (req, res) => {
  res.send("Authenticated");
});

app.use("/api", AuthRouter);
app.use("/api", UserRouter);
app.use("/api", MessageRouter);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).send({ message: "Not Found" });
});

// Error Handler Middleware
app.use(ErrorHandler);

// ✅ Export `app` for Vercel serverless functions (No need to listen on PORT)
export default app;
