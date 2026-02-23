import { supabase } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
  };
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  username?: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username || email.split("@")[0],
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sign in with OAuth provider (Google, GitHub, Facebook, etc.)
 */
export async function signInWithProvider(
  provider: "google" | "github" | "facebook",
) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/courts`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription;
}
