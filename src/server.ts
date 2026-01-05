import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app";
import { initIO } from "./utils/socketUtils";
import registerAuthSocket from "./sockets/authSocket";

dotenv.config();

const PORT = parseInt(process.env.PORT ?? "8080");
// const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.blbzir6.mongodb.net/${process.env.DEFAULT_DB}?retryWrites=true&w=majority&appName=Cluster0`;

const MONGO_URI = `${process.env.MONGO_URI}`;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initIO(server);

// Register notification socket handlers
registerAuthSocket(io);

// Start MongoDB + Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
