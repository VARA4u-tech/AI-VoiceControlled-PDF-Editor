import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, Mail, Lock, ShieldCheck } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { playClick, playSuccess, playError } = useSoundEffects();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleGoogleAuth = async () => {
    playClick();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      playError();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    playClick();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      playError();
    } else {
      toast.success("Welcome back.");
      playSuccess();
      navigate("/");
    }
    setLoading(false);
  };

  if (user) {
    return (
      <Layout
        title="Secure Login"
        subtitle="Authentication Portal"
        icon={ShieldCheck}
      >
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="rounded-sm border border-accent/20 bg-accent/5 p-8">
            <h3 className="font-tech mb-2 text-xs uppercase tracking-widest text-accent">
              Account Connected
            </h3>
            <p className="mb-6 font-mono text-[10px] text-primary/60">
              You are already connected as {user.email}
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate("/")}
                className="font-tech w-full border border-primary/20 bg-primary/10 py-3 text-[10px] uppercase tracking-widest text-primary transition-all hover:bg-primary/20"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="font-tech w-full border border-red-500/20 py-3 text-[10px] uppercase tracking-widest text-red-500/60 transition-all hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Secure Login"
      subtitle="Authentication Portal"
      icon={ShieldCheck}
    >
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <p className="font-body text-sm italic text-foreground/60">
            Access your secure voice-controlled editing environment.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-sm border border-primary/20 bg-primary/5 py-3 pl-10 pr-4 font-mono text-xs text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-sm border border-primary/20 bg-primary/5 py-3 pl-10 pr-4 font-mono text-xs text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-tech group flex w-full items-center justify-center gap-2 border border-accent/40 bg-accent/20 py-4 text-[11px] uppercase tracking-widest text-accent transition-all hover:bg-accent/30 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            ) : (
              <>
                Login <LogIn className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-accent/10" />
            </div>
            <div className="font-tech relative flex justify-center text-[8px] uppercase tracking-widest">
              <span className="bg-background px-4 text-primary/40">
                Or Continue With
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            className="font-tech group flex w-full items-center justify-center gap-3 border border-white/10 bg-white/5 py-3 text-[10px] uppercase tracking-widest text-white/80 transition-all hover:bg-white/10"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </form>

        <div className="pt-4 text-center">
          <Link
            to="/signup"
            className="font-mono text-[10px] uppercase tracking-widest text-primary/40 transition-colors hover:text-primary"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
