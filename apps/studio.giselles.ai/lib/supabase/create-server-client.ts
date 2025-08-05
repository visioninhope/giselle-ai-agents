import {
  type CookieMethodsServer,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";
import invariant from "tiny-invariant";

type CreateServerClientArgs = {
  cookies: CookieMethodsServer;
};
export const createServerClient = ({ cookies }: CreateServerClientArgs) => {
  // In development, provide fallback values if environment variables are missing
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (process.env.NODE_ENV === "development" ? "https://localhost:3000" : null);
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (process.env.NODE_ENV === "development" ? "development-key" : null);

  if (process.env.NODE_ENV !== "development") {
    invariant(supabaseUrl != null, "Missing env.NEXT_PUBLIC_SUPABASE_URL");
    invariant(
      supabaseAnonKey != null,
      "Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "Supabase environment variables not configured, using mock client in development",
    );
    // Return a mock client for development
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any;
  }

  const supabase = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies,
  });
  return supabase;
};
