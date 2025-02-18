"use client";

import { createClient, Session } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type AuthFetchOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function authenticatedFetch(
  url: string,
  options: AuthFetchOptions = {},
) {
  let session: Session | null = null;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  } catch (error) {
    console.error("Failed to get session:", error);
    if (options.requireAuth) {
      throw new Error("Authentication required");
    }
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  } else if (options.requireAuth) {
    throw new Error("No active session found");
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
