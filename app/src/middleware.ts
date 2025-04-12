import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be publicly accessible
const isPublicRoute = createRouteMatcher([
  "/", // Make the home page public for now
  "/sign-in(.*)", // Clerk sign-in routes
  "/sign-up(.*)", // Clerk sign-up routes
  // Add any other public routes here (e.g., API routes, landing pages)
  // '/api/(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // The middleware will automatically protect routes not listed in isPublicRoute
  // No explicit auth().protect() call needed here.
});

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!.*\\..*|_next).*)?", "/", "/(api|trpc)(.*)"],
};