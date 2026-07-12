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

  socket.on("room-joined", (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });
  socket.on("send-message", (message) => {
    console.log(message);
    io.to(message.room).emit("receive-message", message);
  });
});

server.listen(5000, "localhost", () => {
  console.log("Server is serving on port 5000");
});
