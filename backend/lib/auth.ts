import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client for JWT verification
// The ANON_KEY is safe to use here because we just need it to construct the client
// and use auth.getUser() which validates the JWT directly against Supabase.
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function verifyToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error(`Unauthorized: ${error?.message || "Invalid token"}`);
  }

  return user;
}
