import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import db from "./lib/db";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbo: true, turbopack: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    // socket.onAny((event, ...args) => {
    //   console.log("EVENT:", event, args);
    // });
    console.log("User Connected:", socket.id);

    socket.on("room-joined", (roomName) => {
      socket.join(roomName);
    });
    socket.on("send-message", (message) => {
      try {
        const query = db.prepare(`
      INSERT INTO messages
      (id, user_id, room, type, content, created_at)
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

        io.to(message.room).emit("receive-message", message);
      } catch (err) {
        console.error("MESSAGE ERROR:", err);
      }
    });
  });
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
