import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the Prisma client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize Prisma Client
// In development, prevent multiple instances due to HMR by caching it on the globalThis object
const prismadb =
  globalThis.prisma ||
  new PrismaClient({
    // Optionally configure logging
    // log: ['query', 'info', 'warn', 'error'],
  });

// If in development, assign the client to the global variable
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismadb;
}

export default prismadb; 