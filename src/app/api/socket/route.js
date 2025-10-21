// src/app/api/socket/route.js
import { Server } from "socket.io";

let io;

export const GET = (req, res) => {
  if (!res.socket.server.io) {
    console.log("🔌 Starting Socket.IO server...");
    io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });
  }

  // Just respond with 200 OK
  res.status(200).end();
};
