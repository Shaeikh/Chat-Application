"use client";

import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:4000" : "";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
});
