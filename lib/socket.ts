"use client";

import { io } from "socket.io-client";
import { authClient } from "@/lib/auth-client"; // your Better Auth client

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  auth: async (cb) => {
    const session = await authClient.getSession();
    cb({ token: session?.data?.session?.token });
  },
});
