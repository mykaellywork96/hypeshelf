import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Protect /shelf and any future authenticated routes.
 * Public routes (/, /sign-in, /sign-up) pass through with no auth check.
 */
const isProtectedRoute = createRouteMatcher(["/shelf(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
