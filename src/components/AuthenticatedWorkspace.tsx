"use client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { GardenWorkspace } from "./GardenWorkspace";
import { forgetDraft } from "@/lib/client/draft";
export function AuthenticatedWorkspace() {
  const { isLoaded, userId } = useAuth();
  const { signOut } = useClerk();
  // A different identity gets fresh in-memory state and aborts the old requests.
  return <GardenWorkspace key={userId ?? "visitor"} userId={userId ?? null} authReady={isLoaded}
    onSignOut={async () => { forgetDraft(); await signOut({ redirectUrl: "/" }); }} />;
}
