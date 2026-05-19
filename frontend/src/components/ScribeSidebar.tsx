import { Link } from "react-router-dom";
import {
  X,
  Bot,
  MessageSquare,
  BarChart3,
  BrainCircuit,
  Settings,
  Shield,
  History,
  Info,
  Activity,
  Sparkles,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ScribeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  scribeLog: Array<{
    title?: string;
    content: string;
    type: "summary" | "stats" | "info" | "error";
    timestamp: Date;
  }>;
  paragraphs: string[];
}

const ScribeSidebar = ({
  isOpen,
  onClose,
  scribeLog,
  paragraphs,
}: ScribeSidebarProps) => {
  const { user, signOut } = useAuth();
  // Real-time Insights Calculation
  const allText = paragraphs.join(" ");
  const wordCount = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const avgWordLength = wordCount > 0 ? allText.length / wordCount : 0;

  // AI Analytics Mapping
  const scholarlyWeight = Math.min(100, Math.max(0, (avgWordLength - 4) * 20));
  const focusIntensity =
    wordCount > 0 ? Math.min(100, (wordCount / 500) * 100) : 0;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modern High-Tech Panel */}
      <div
        className={`cubic-bezier(0.4, 0, 0.2, 1) fixed right-0 top-0 z-[60] flex h-full w-full transform overflow-hidden border-l border-primary/20 bg-slate-950/90 shadow-[-40px_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-transform duration-700 sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Decorative Left Edge Bar */}
        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-transparent via-accent/40 to-transparent opacity-50" />

        {/* Vertical Icon Rail */}
        <div className="flex h-full w-16 flex-shrink-0 flex-col items-center gap-8 border-r border-primary/10 bg-black/40 py-8">
          <Link to="/">
            <div className="group mb-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-accent/20 bg-accent/10 transition-all hover:bg-accent/20">
              <BrainCircuit className="h-5 w-5 animate-pulse text-accent" />
            </div>
          </Link>
          <div className="flex flex-col gap-6 text-primary/40">
            <Link to="/analytics" title="Analytics">
              <BarChart3 className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
            </Link>
            <Link to="/history" title="History">
              <History className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
            </Link>
            <Link to="/security" title="Security">
              <Shield className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
            </Link>
            <div className="mb-4 mt-auto flex flex-col gap-6">
              <Link to="/settings" title="Settings">
                <Settings className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
              </Link>
              <Link to="/info" title="System Info">
                <Info className="h-5 w-5 cursor-pointer transition-colors hover:text-primary" />
              </Link>
              <Link to="/login" title="Authentication">
                <User className="h-5 w-5 cursor-pointer text-accent transition-colors hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative flex h-full flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-4">
            <div>
              <h2 className="gold-text-glow font-heading text-xl font-bold uppercase tracking-[0.2em] text-primary">
                Assistant Panel
              </h2>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-accent/60">
                {user
                  ? `// User: ${user.email}`
                  : "// Status: Active"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={() => signOut()}
                  className="rounded-full border border-transparent p-2 text-red-500/40 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="group rounded-full border border-transparent p-2 transition-all hover:border-primary/10 hover:bg-white/5"
              >
                <X className="h-5 w-5 text-primary/40 transition-all duration-300 group-hover:rotate-90 group-hover:text-primary" />
              </button>
            </div>
          </div>

          {/* Scrolling Content */}
          <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-8 py-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative overflow-hidden rounded-lg border border-primary/10 bg-primary/5 p-4">
                <div className="absolute right-0 top-0 p-1.5 opacity-10 transition-opacity group-hover:opacity-30">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <span className="mb-1 block font-mono text-[8px] uppercase tracking-tighter text-primary/40">
                  Readability
                </span>
                <span className="gold-text-glow text-lg font-bold text-primary">
                  {avgWordLength > 6
                    ? "High"
                    : avgWordLength > 5
                      ? "Med"
                      : "Low"}
                </span>
              </div>
              <div className="group relative overflow-hidden rounded-lg border border-primary/10 bg-primary/5 p-4">
                <div className="absolute right-0 top-0 p-1.5 opacity-10 transition-opacity group-hover:opacity-30">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span className="mb-1 block font-mono text-[8px] uppercase tracking-tighter text-primary/40">
                  Volume
                </span>
                <span className="gold-text-glow text-lg font-bold text-primary">
                  {wordCount}{" "}
                  <span className="text-[10px] font-normal italic opacity-40">
                    words
                  </span>
                </span>
              </div>
            </div>

            {/* Progress Gauges */}
            <div className="space-y-6 border-y border-primary/10 py-4">
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-primary/60">
                    Vocabulary Variety
                  </span>
                  <span className="font-mono text-[10px] text-accent">
                    {Math.round(scholarlyWeight)}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-primary/40 via-primary to-accent shadow-[0_0_8px_hsl(var(--gold)/0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${scholarlyWeight}%` }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-primary/60">
                    Content Density
                  </span>
                  <span className="font-mono text-[10px] text-accent">
                    {Math.round(focusIntensity)}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-primary/40 via-primary to-accent shadow-[0_0_8px_hsl(var(--gold)/0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${focusIntensity}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
              <h3 className="font-tech mb-4 text-[10px] uppercase tracking-[0.3em] text-primary/40">
                Activity History
              </h3>
              {scribeLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center opacity-20">
                  <Bot className="h-10 w-10 text-primary" />
                  <p className="font-body text-xs italic">
                    Activity history is empty. Your edits will appear here.
                  </p>
                </div>
              ) : (
                scribeLog.map((log, i) => (
                  <div
                    key={i}
                    className="bg-white/2 group relative rounded-sm border border-white/5 p-4 transition-all hover:border-primary/20"
                  >
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-primary/20 transition-colors group-hover:bg-accent" />
                    <div className="mb-2 flex items-center gap-2">
                      {log.type === "summary" ? (
                        <MessageSquare className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span className="font-tech text-[10px] uppercase tracking-[0.1em] text-primary/80">
                        {log.title || "Status Update"}
                      </span>
                      <span className="ml-auto font-mono text-[8px] opacity-30">
                        {log.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="font-body text-[12px] italic leading-relaxed text-foreground/70">
                      {log.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="pointer-events-none p-8 pt-4 opacity-20">
            <div className="mb-4 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="text-center font-mono text-[8px] uppercase tracking-[0.5em]">
              // End of Session //
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScribeSidebar;
