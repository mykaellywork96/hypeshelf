import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ShelfView } from "@/components/ShelfView";
import { UserSync } from "@/components/UserSync";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * Protected shelf page (server component).
 *
 * auth() will redirect to sign-in if no session is present.
 * The actual shelf content is rendered client-side so Convex real-time
 * queries (useQuery) work correctly.
 */
export default async function ShelfPage() {
  const { userId } = await auth();

  // Extra safety net — middleware already handles this, but belt-and-suspenders.
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Syncs Clerk user into Convex on mount (client component). */}
      <UserSync />
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <ErrorBoundary>
          <ShelfView />
        </ErrorBoundary>
      </main>
    </div>
  );
}
