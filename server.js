import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import http from "http"; 
import { initializeSocket } from "./socket/socket.js";

import ErrorHandler from "./middleware/ErrorHandler.js";
import { authenticateUser } from "./middleware/Authentication.js";

import AuthRouter from "./routers/AuthRouter.js";
import UserRouter from "./routers/userRouter.js";
import MessageRouter from "./routers/messages.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app); // ✅ Create an HTTP server for WebSockets


  initializeSocket(server);


// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

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

// ✅ Start server locally (not needed for Vercel)

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });


// ✅ Export app for Vercel (serverless functions)
export default app;
