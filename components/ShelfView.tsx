"use client";

import { useState, useCallback } from "react";
import { useMutation, useConvexAuth, usePaginatedQuery, useQuery } from "convex/react";
import { Plus, BookOpen, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { RecommendationCard, RecommendationCardSkeleton } from "./RecommendationCard";
import { AddRecommendationModal } from "./AddRecommendationModal";
import { GenreFilter } from "./GenreFilter";
import { ErrorBoundary } from "./ErrorBoundary";

// How many recommendations to load per page.
const PAGE_SIZE = 20;

/**
 * Main authenticated shelf view.
 *
 * Architecture notes:
 * - usePaginatedQuery keeps results bounded and enables "Load more".
 * - useConvexAuth guards queries until Convex has the Clerk JWT.
 * - Toast feedback confirms every user action (add, delete, staff-pick).
 * - ErrorBoundary wraps the grid so a bad card doesn't crash the whole page.
 *
 * Roles:
 * - admin  → delete any + toggle Staff Pick on any card.
 * - user   → delete only their own cards.
 */
export function ShelfView() {
  const [genre, setGenre] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"recommendations"> | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<Id<"recommendations"> | null>(null);

  // Guard: don't fire authenticated queries until Convex has the Clerk JWT.
  const { isAuthenticated } = useConvexAuth();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  const {
    results: recs,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.recommendations.getAll,
    isAuthenticated ? { genre: genre ?? undefined } : "skip",
    { initialNumItems: PAGE_SIZE }
  );

  const removeRec = useMutation(api.recommendations.remove);
  const toggleStaffPick = useMutation(api.recommendations.toggleStaffPick);

  // ── Action handlers ────────────────────────────────────────────

  // Step 1: user clicks trash → show confirmation overlay.
  const handleDeleteRequest = useCallback((id: Id<"recommendations">) => {
    setConfirmingDeleteId(id);
  }, []);

  // Step 2: user confirms → fire the mutation.
  const handleDeleteConfirm = useCallback(
    async (id: Id<"recommendations">) => {
      setConfirmingDeleteId(null);
      setDeletingId(id);
      try {
        await removeRec({ id });
        toast.success("Recommendation deleted.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete. Try again."
        );
      } finally {
        setDeletingId(null);
      }
    },
    [removeRec]
  );

  const handleToggleStaffPick = useCallback(
    async (id: Id<"recommendations">) => {
      try {
        await toggleStaffPick({ id });
        toast.success("Staff pick updated.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update staff pick."
        );
      }
    },
    [toggleStaffPick]
  );

  // ── Derived state ──────────────────────────────────────────────

  const isAdmin = currentUser?.role === "admin";
  const isLoadingFirstPage = status === "LoadingFirstPage";
  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  // ── Render ─────────────────────────────────────────────────────

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            The Shelf
          </h1>
          {!isLoadingFirstPage && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5">
              {recs.length} recommendation{recs.length !== 1 ? "s" : ""}
              {genre ? ` in ${genre}` : ""}
              {canLoadMore ? " (more available)" : ""}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors focus-ring shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add recommendation
        </button>
      </div>

      {/* ── Genre filter ─────────────────────────────────────────── */}
      <div className="mb-6">
        <GenreFilter value={genre} onChange={setGenre} />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      {isLoadingFirstPage ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <EmptyState genre={genre} />
      ) : (
        <>
          {/* Card grid wrapped in an error boundary so one bad card
              doesn't prevent the rest of the shelf from rendering. */}
          <ErrorBoundary>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {recs.map((rec) => {
                const isOwner =
                  currentUser != null && rec.userId === currentUser._id;
                const canDelete = isOwner || isAdmin;

                return (
                  <div key={rec._id} className="relative">
                    {/* Confirmation overlay — shown when trash is clicked */}
                    {confirmingDeleteId === rec._id && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm px-6 text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                          Delete this recommendation?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(rec._id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Deletion in-progress overlay */}
                    {deletingId === rec._id && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm">
                        <Loader2 className="h-5 w-5 text-gray-400 dark:text-zinc-400 animate-spin" />
                      </div>
                    )}
                    <RecommendationCard
                      rec={rec}
                      actions={{
                        canDelete,
                        isAdmin,
                        onDelete: handleDeleteRequest,
                        onToggleStaffPick: handleToggleStaffPick,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </ErrorBoundary>

          {/* ── Load more ─────────────────────────────────────── */}
          {(canLoadMore || isLoadingMore) && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => loadMore(PAGE_SIZE)}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 px-4 py-2 rounded-lg transition-colors focus-ring disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load more
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Add modal ────────────────────────────────────────────── */}
      {showModal && (
        <AddRecommendationModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Extracted so ShelfView stays focused on orchestration, not layout details. */
function EmptyState({ genre }: { genre: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <BookOpen className="h-12 w-12 text-gray-300 dark:text-zinc-700 mb-4" />
      <p className="text-gray-500 dark:text-zinc-400 font-medium mb-1">
        {genre ? `No ${genre} picks yet` : "The shelf is empty"}
      </p>
      <p className="text-gray-400 dark:text-zinc-600 text-sm">
        {genre
          ? "Try a different genre or add the first one."
          : "Be the first to add a recommendation!"}
      </p>
    </div>
  );
}
