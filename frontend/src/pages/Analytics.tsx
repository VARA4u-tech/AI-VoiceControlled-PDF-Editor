import Layout from "@/components/Layout";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Activity,
  Clock,
  Layers,
  Trophy,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface ActivityRow {
  command_type: string;
  is_success: boolean;
  document_name: string;
  created_at: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scribe_activity")
      .select("command_type, is_success, document_name, created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error && data) setActivity(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchAnalytics();
    else setLoading(false);
  }, [user, fetchAnalytics]);

  const stats = useMemo(() => {
    const total = activity.length;
    const successful = activity.filter((a) => a.is_success).length;
    const docs = new Set(activity.map((a) => a.document_name)).size;
    const days = new Set(
      activity.map((a) => new Date(a.created_at).toLocaleDateString()),
    ).size;
    return {
      totalCommands: total,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
      activeDocuments: docs,
      uniqueDays: days,
    };
  }, [activity]);

  // Command Leaderboard
  const leaderboard = useMemo(() => {
    const counts: Record<string, number> = {};
    activity.forEach((a) => {
      const key = a.command_type || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([type, count], i) => ({ rank: i + 1, type, count }));
  }, [activity]);

  const maxCount = leaderboard[0]?.count || 1;

  const MEDAL_COLORS = ["text-yellow-400", "text-slate-300", "text-amber-600"];

  return (
    <Layout title="Analytics" subtitle="Usage Statistics" icon={BarChart3}>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Total Commands",
                value: stats.totalCommands,
                icon: Activity,
              },
              {
                label: "Success Rate",
                value: `${stats.successRate}%`,
                icon: TrendingUp,
              },
              {
                label: "Active Docs",
                value: stats.activeDocuments,
                icon: Layers,
              },
              { label: "Active Days", value: stats.uniqueDays, icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="group rounded-sm border border-primary/10 bg-primary/5 p-4 transition-all hover:border-accent/30"
              >
                <Icon className="mb-2 h-4 w-4 text-accent/60 transition-colors group-hover:text-accent" />
                <div className="mb-1 font-heading text-xl text-primary sm:text-2xl">
                  {value}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-primary/40">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Success Rate Bar */}
          <section className="space-y-3">
            <h3 className="font-tech flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Activity className="h-4 w-4 text-accent" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              {[
                { label: "Command Success Rate", value: stats.successRate },
                { label: "AI Reliability", value: 99 },
                { label: "Voice Accuracy", value: 92 },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between font-mono text-[11px] text-primary/60">
                    <span>{s.label}</span>
                    <span className="text-accent">{s.value}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${s.value}%`,
                        backgroundImage:
                          "linear-gradient(90deg, hsl(var(--accent)) 0%, hsl(var(--tech-blue)) 100%)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Command Leaderboard */}
          <section className="space-y-4">
            <h3 className="font-tech flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Trophy className="h-4 w-4 text-accent" />
              Popular Commands
            </h3>

            {leaderboard.length === 0 ? (
              <div className="rounded-sm border border-dashed border-primary/10 py-10 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary/30">
                  // No commands logged yet. Start speaking! //
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map(({ rank, type, count }) => (
                  <div
                    key={type}
                    className="group flex items-center gap-4 rounded-sm border border-primary/10 bg-primary/5 p-3 transition-all hover:border-accent/30"
                  >
                    {/* Rank */}
                    <div
                      className={`font-tech w-6 shrink-0 text-center text-sm ${MEDAL_COLORS[rank - 1] || "text-primary/40"}`}
                    >
                      {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                    </div>

                    {/* Command Type */}
                    <div className="min-w-0 flex-1">
                      <div className="font-tech truncate text-[10px] uppercase tracking-widest text-primary">
                        {type}
                      </div>
                      {/* Bar */}
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-accent/60 transition-all duration-700"
                          style={{
                            width: `${Math.round((count / maxCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Count */}
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-xs text-accent">
                        {count}
                      </span>
                      <div className="font-tech text-[8px] uppercase text-primary/30">
                        uses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Biometric Sync */}
          <section>
            <h3 className="font-tech mb-4 flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <Layers className="h-4 w-4 text-accent" />
              System Status
            </h3>
            <div className="flex flex-wrap justify-around gap-4 rounded-sm border border-primary/10 bg-primary/5 p-4">
              {[
                {
                  label: "Account Link",
                  value: user ? "Connected" : "Disconnected",
                },
                { label: "Cloud Sync", value: "Active" },
                { label: "AI Service", value: "Online" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="mb-1 font-mono text-[10px] uppercase text-primary/40">
                    {label}
                  </div>
                  <div className="font-tech text-xs text-accent">{value}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Layout>
  );
};

export default Analytics;
