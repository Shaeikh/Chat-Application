import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import db from "./lib/db";
import { auth } from "./lib/auth";

const hostname = "localhost";
const PORT = 4000;
const onlineUsers = new Map();

const httpServer = createServer((req, res) => {
  res.writeHead(404);
  res.end();
});
setupSockets(httpServer);
httpServer.listen(PORT, hostname, () =>
  console.log(`> Socket.IO backend active on port ${PORT}`),
);

function setupSockets(httpServer: any) {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.137.1:3000",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps/curl) or matched origins
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          origin.endsWith(".serveo.net")
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.engine.on("connection_error", (err) => {
    console.error("ENGINE CONNECTION ERROR");
    console.error("code:", err.code);
    console.error("message:", err.message);
    console.error("context:", err.context);
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const cookieHeader = socket.handshake.headers.cookie;

      if (!token && !cookieHeader) {
        return next(new Error("Authentication failed: No token provided"));
      }

      // Construct headers for Better Auth session validation
      const headers = new Headers();
      if (cookieHeader) headers.append("cookie", cookieHeader);
      if (token) headers.append("authorization", `Bearer ${token}`);

      const session = await auth.api.getSession({ headers });

      if (!session || !session.user) {
        return next(new Error("Authentication failed: Invalid session"));
      }

      (socket as any).user = session.user;
      next();
    } catch (error) {
      return next(new Error("Internal authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    const userId = user.id; // Better Auth string ID

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, {
        profile: { id: userId, name: user.name || user.email },
        sockets: new Set(),
      });
    }
    onlineUsers.get(userId).sockets.add(socket.id);

    console.log(`User ${user.email} connected.`);

    socket.on("disconnect", () => {
      const userData = onlineUsers.get(userId);
      if (userData) {
        userData.sockets.delete(socket.id);

        if (userData.sockets.size === 0) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline.`);

          broadcastOnlineUsers();
        }
      }
    });

    socket.on("room-joined", (room, recievedUser) => {
      socket.join(room);
      if (userId === recievedUser.id) {
        broadcastOnlineUsers();
      }
    });
    function broadcastOnlineUsers() {
      const onlineUsersList = Array.from(onlineUsers.values()).map(
        (userGroup) => userGroup.profile,
      );
      io.emit("online-users-list", onlineUsersList);
    }

    socket.on("typing", (data) => {
      // console.log("SERVER GOT typing", data);
      // console.log("ROOM:", data.roomID);
      // console.log("ROOM MEMBERS:", io.sockets.adapter.rooms.get(data.roomID));

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

    socket.on("message-delete", (user, message) => {
      if (user.id !== message.user.id || !message || !user) return;
      console.log("deleted message");
      db.run("DELETE FROM messages WHERE id = ?", [message.id]);
    });
  });
}
