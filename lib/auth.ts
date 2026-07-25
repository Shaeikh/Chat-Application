import { betterAuth } from "better-auth";
import { Database } from "bun:sqlite";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "*serveo.net",
      "http://localhost:3000",
      "*.serveousercontent.com",
    ],
    fallback: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  },
  database: new Database("database.sqlite"),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    onExistingUserSignUp: async (data, request) => {
      console.log(
        `Duplicate registration attempt for email: ${data.user.email}`,
      );
    },
  },
  session: {
    cookieCache: {
      enabled: true,
    },
  },
});
