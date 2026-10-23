import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/admin/users": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
    "/school-admin": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
    "/school-admin/users": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
    "/school-admin/students": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
    "/school-admin/classes": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/**/*"],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
