import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "*.serveousercontent.com",
    "crinkle-shaping-creatable.ngrok-free.dev",
  ],
};

export default nextConfig;
