import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: new Database("database.sqlite"),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
});
