"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Invisible component that syncs the Clerk user into Convex on mount.
 *
 * Why client-side upsert instead of a webhook?
 * For a self-contained take-home, we avoid the ngrok/tunnel complexity of
 * webhook development. The trade-off: if a user's name changes between
 * sessions, it updates next time they sign in (fine for our use case).
 *
 * Place this at the top of any authenticated layout — it only fires once
 * when the Clerk session becomes available.
 */
export function UserSync() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const primaryEmail =
      user.primaryEmailAddress?.emailAddress ?? "";

    upsertUser({
      name: user.fullName ?? user.username ?? primaryEmail,
      email: primaryEmail,
      imageUrl: user.imageUrl ?? undefined,
    }).catch(console.error);
    // Only re-run if the user object identity changes (i.e., different session).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoaded]);

  return null;
}
