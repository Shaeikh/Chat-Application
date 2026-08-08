import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import db from "./lib/db";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";

// Frontend runs on 3000, Socket server runs on 4000 during dev
const PORT = dev ? 4000 : 3000;

if (!dev) {
  // Production Monolith Setup
  const app = next({ dev, hostname, port: PORT });
  const handler = app.getRequestHandler();

  app.prepare().then(() => {
    const httpServer = createServer(handler);
    setupSockets(httpServer);
    httpServer.listen(PORT, () =>
      console.log(`> Monolith active on port ${PORT}`),
    );
  });
} else {
  // Fast Dev Mode Setup (Isolate Sockets from NextJS .next/ directory)
  const httpServer = createServer((req, res) => {
    res.writeHead(404);
    res.end();
  });
  setupSockets(httpServer);
  httpServer.listen(PORT, () =>
    console.log(`> Socket.IO backend active on port ${PORT}`),
  );
}

function setupSockets(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000", // Allow Next.js HMR client to connect
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("room-joined", (roomName) => {
      socket.join(roomName);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomID).emit("user-typing", data);
    });

    socket.on("send-message", (message) => {
      try {
        const query = db.prepare(`
          INSERT INTO messages (id, user_id, room, type, content, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        query.run(
          message.id,
          message.user.id,
          message.room,
          message.type,
          message.content,
          message.createdAt,
        );
        query.finalize();

        io.to(message.room).emit("receive-message", message);
      } catch (err) {
        console.error("MESSAGE ERROR:", err);
      }
    });
  });
}
