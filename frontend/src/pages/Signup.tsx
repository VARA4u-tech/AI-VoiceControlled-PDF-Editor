import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Mail, Lock, ShieldCheck, User } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Signup = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { playClick, playSuccess, playError } = useSoundEffects();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only alphabets and spaces
    if (val === "" || /^[a-zA-Z\s]+$/.test(val)) {
      setFullName(val);
    }
  };

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

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 33;
    if (password.length < 10) return 66;
    return 100;
  };

  const strength = getPasswordStrength();
  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const showMismatch = password && confirmPassword && !passwordsMatch;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validation Protocols ──
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      playError();
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      playError();
      return;
    }

    setLoading(true);
    playClick();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      playError();
    } else {
      toast.success("Registration complete. Please check your email.");
      playSuccess();
    }
    setLoading(false);
  };

  return (
    <Layout
      title="Create Account"
      subtitle="Authentication Portal"
      icon={ShieldCheck}
    >
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <p className="font-body text-sm italic text-foreground/60">
            Register your details to create a secure account.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={handleFullNameChange}
                required
                className="w-full rounded-sm border border-primary/20 bg-primary/5 py-3 pl-10 pr-4 font-mono text-xs text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
              />
            </div>
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
            <div className="group/pass relative">
              <Lock
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${strength === 100 ? "text-emerald-400" : strength > 0 ? "text-accent" : "text-primary/40"}`}
              />
              <input
                type="password"
                placeholder="Password (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full rounded-sm border bg-primary/5 py-3 pl-10 pr-4 font-mono text-xs text-primary transition-all placeholder:text-primary/20 focus:outline-none ${strength === 100 ? "border-emerald-500/40 focus:border-emerald-500/60" : strength > 0 ? "border-accent/40 focus:border-accent/60" : "border-primary/20 focus:border-accent/40"}`}
              />
              {/* Strength Meter Bar */}
              <div
                className="absolute bottom-0 left-0 h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>

            <div className="group/confirm relative">
              <Lock
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${passwordsMatch ? "text-emerald-400" : showMismatch ? "animate-pulse text-red-400" : "text-primary/40"}`}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full rounded-sm border bg-primary/5 py-3 pl-10 pr-4 font-mono text-xs text-primary transition-all placeholder:text-primary/20 focus:outline-none ${passwordsMatch ? "border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] focus:border-emerald-500/60" : showMismatch ? "animate-shake border-red-500/40 focus:border-red-500/60" : "border-primary/20 focus:border-accent/40"}`}
              />
              {showMismatch && (
                <div className="absolute -bottom-5 left-0 w-full text-center">
                  <span className="font-tech animate-pulse text-[8px] uppercase tracking-widest text-red-500">
                    Passwords Do Not Match
                  </span>
                </div>
              )}
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
                Sign Up <UserPlus className="h-4 w-4" />
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
            Sync_Google_Sign_Up
          </button>
        </form>

        <div className="pt-4 text-center">
          <Link
            to="/login"
            className="font-mono text-[10px] uppercase tracking-widest text-primary/40 transition-colors hover:text-primary"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
