import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
  database: new Database("database.sqlite"),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: {
    allowedHosts: ["http://localhost:3000", "http://192.168.1.5:3000"],
    fallback: "http://localhost:3000",
  },
});
