import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("send-message", (message) => {
    console.log("Message received:", message.content);
    console.log("Socket ID:", message.id);
    io.emit("receive-message", message);
  });

  socket.on("typing-message", (socketID) => {
    socket.broadcast.emit("typing-message-received", socketID);
  });
});

server.listen(5000, "localhost", () => {
  console.log("Server is serving on port 5000");
});
