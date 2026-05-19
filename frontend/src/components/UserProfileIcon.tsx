import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { User, Shield, ChevronRight, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const UserProfileIcon = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { playClick, playHover } = useSoundEffects();

  if (!user) return null;

  const handleAction = (path: string) => {
    playClick();
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    playClick();
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="group fixed left-4 top-4 z-[60] animate-fade-in sm:left-6 sm:top-6">
      {/* The main unique floating icon */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => playHover()}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${isOpen ? "rotate-90 border-accent bg-accent/10 shadow-[0_0_25px_rgba(255,215,0,0.3)]" : "border-primary/20 bg-slate-950/80 hover:border-accent/50 hover:shadow-[0_0_15px_rgba(255,215,0,0.15)]"} backdrop-blur-xl active:scale-95 group-hover:scale-110`}
      >
        {/* Decorative rotating runes/elements around inner icon */}
        <div className="pointer-events-none absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border border-dashed border-accent/20" />
        <div className="pointer-events-none absolute -inset-1 animate-[spin_12s_linear_infinite_reverse] rounded-full border border-primary/5" />

        {/* Inner symbol - Mystical User/Shield combo */}
        <div className="relative">
          <User
            className={`h-5 w-5 transition-all duration-300 ${isOpen ? "scale-110 text-accent" : "text-primary/60"}`}
          />
          <Shield className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse text-accent" />
        </div>

        {/* Dynamic bracket accents */}
        <div className="absolute right-0 top-0 h-2 w-2 rounded-tr-sm border-r border-t border-accent/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        <div className="absolute bottom-0 left-0 h-2 w-2 rounded-bl-sm border-b border-l border-accent/40 transition-transform group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 top-14 w-64 origin-top-left rounded-sm border border-primary/20 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-2xl duration-200 animate-in fade-in zoom-in-95">
            <div className="mb-4 flex items-center gap-3 border-b border-primary/10 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                <span className="font-tech text-sm uppercase text-accent">
                  {user.email?.charAt(0) || "S"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-tech mb-0.5 text-[10px] uppercase tracking-widest text-accent/60">
                  User Profile
                </p>
                <p className="truncate font-mono text-[11px] text-primary/80">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleAction("/analytics")}
                onMouseEnter={() => playHover()}
                className="group/item flex w-full items-center justify-between rounded-sm border border-transparent p-2.5 transition-all hover:border-accent/20 hover:bg-accent/10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent/40 transition-colors group-hover/item:bg-accent" />
                  <span className="font-tech text-[11px] uppercase tracking-widest text-primary/70 transition-colors group-hover/item:text-primary">
                    User Dashboard
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-primary/30 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-accent" />
              </button>

              <button
                onClick={() => handleAction("/history")}
                onMouseEnter={() => playHover()}
                className="group/item flex w-full items-center justify-between rounded-sm border border-transparent p-2.5 transition-all hover:border-accent/20 hover:bg-accent/10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/20 transition-colors group-hover/item:bg-accent" />
                  <span className="font-tech text-[11px] uppercase tracking-widest text-primary/70 transition-colors group-hover/item:text-primary">
                    Activity History
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-primary/30 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-accent" />
              </button>

              <button
                onClick={() => handleAction("/settings")}
                onMouseEnter={() => playHover()}
                className="group/item flex w-full items-center justify-between rounded-sm border border-transparent p-2.5 transition-all hover:border-accent/20 hover:bg-accent/10"
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary/20 transition-colors group-hover/item:bg-accent" />
                  <span className="font-tech text-[11px] uppercase tracking-widest text-primary/70 transition-colors group-hover/item:text-primary">
                    User Settings
                  </span>
                </div>
                <Settings className="h-3 w-3 text-primary/30 transition-all group-hover/item:text-accent" />
              </button>

              <div className="my-2 border-t border-primary/10 pt-2" />

              <button
                onClick={handleLogout}
                onMouseEnter={() => playHover()}
                className="group/item flex w-full items-center gap-3 rounded-sm border border-transparent p-2.5 text-red-500/60 transition-all hover:border-red-500/20 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="font-tech text-[11px] uppercase tracking-widest">
                  Sign Out
                </span>
              </button>
            </div>

            <div className="mt-4 border-t border-primary/5 pt-2">
              <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.2em] text-primary/30">
                <span>Sync Status: Active</span>
                <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfileIcon;
