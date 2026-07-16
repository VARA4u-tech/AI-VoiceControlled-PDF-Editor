import Layout from "@/components/Layout";
import {
  Terminal,
  Activity,
  Cpu,
  Database,
  Network,
  ShieldAlert,
  Wifi,
  Globe,
  HardDrive,
} from "lucide-react";

const RootLog = () => {
  return (
    <Layout title="Activity Logs" subtitle="Diagnostic Audit" icon={Terminal}>
      <div className="mx-auto max-w-5xl animate-fade-in space-y-12 px-2">
        {/* Intro */}
        <section className="space-y-4 text-center">
          <h3 className="font-tech gold-text-glow text-xl font-bold uppercase tracking-[0.3em] text-primary">
            Scribe System Audit
          </h3>
          <p className="mx-auto max-w-3xl font-body text-base italic leading-relaxed text-foreground/80">
            A comprehensive diagnostic overview of the current Scribe session.
            All system services are monitored for high-precision operations.
          </p>
        </section>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Hardware & CPU */}
          <section className="group relative overflow-hidden rounded-sm border border-primary/10 bg-slate-950/60 p-6 backdrop-blur-md">
            <div className="tech-bracket-tl h-2 w-2 opacity-40 transition-opacity group-hover:opacity-100" />
            <h4 className="font-tech mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/80">
              <Cpu className="h-4 w-4 text-accent" />
              Processor Status
            </h4>
            <div className="space-y-4 font-mono text-[11px] text-primary/60">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>Application Engine</span>
                <span className="text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>AI Processing Node</span>
                <span className="text-accent">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span>Processor Load</span>
                <span className="text-primary">12.4% AVAIL</span>
              </div>
            </div>
          </section>

          {/* Database & Storage */}
          <section className="group relative overflow-hidden rounded-sm border border-primary/10 bg-slate-950/60 p-6 backdrop-blur-md">
            <div className="tech-bracket-tl h-2 w-2 opacity-40 transition-opacity group-hover:opacity-100" />
            <h4 className="font-tech mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/80">
              <Database className="h-4 w-4 text-accent" />
              Storage Vault
            </h4>
            <div className="space-y-4 font-mono text-[11px] text-primary/60">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>Local Buffer</span>
                <span className="text-emerald-400">OPTIMIZED</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>Session DB</span>
                <span className="text-accent">STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>Disk Index</span>
                <span className="text-primary">VERIFIED</span>
              </div>
            </div>
          </section>

          {/* Network & Safety */}
          <section className="group relative overflow-hidden rounded-sm border border-primary/10 bg-slate-950/60 p-6 backdrop-blur-md">
            <div className="tech-bracket-tl h-2 w-2 opacity-40 transition-opacity group-hover:opacity-100" />
            <h4 className="font-tech mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/80">
              <Network className="h-4 w-4 text-accent" />
              Network Latency
            </h4>
            <div className="space-y-4 font-mono text-[11px] text-primary/60">
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>Sync Latency</span>
                <span className="text-emerald-400">0.12 MS</span>
              </div>
              <div className="flex justify-between border-b border-primary/5 pb-2">
                <span>Secure Tunnel</span>
                <span className="text-accent">ENCRYPTED</span>
              </div>
              <div className="flex justify-between">
                <span>Packet Status</span>
                <span className="text-primary">HEALTHY</span>
              </div>
            </div>
          </section>
        </div>

        {/* Live Simulation Feed */}
        <section className="space-y-6">
          <div className="relative h-64 space-y-3 overflow-hidden rounded-sm border border-primary/10 bg-slate-950/80 p-6 font-mono text-[10px] text-primary/40 shadow-inner">
            {/* Tech Brackets */}
            <div className="absolute right-4 top-4 animate-pulse">
              <ShieldAlert className="h-4 w-4 text-accent/40" />
            </div>
            <div className="space-y-1">
              <p className="flex gap-4">
                <span className="text-accent/60">[19:52:06]</span>
                <span className="text-emerald-400">DOCUMENT_LOAD</span>
                <span>// PDF_DOCUMENT_V4_LOADED // MD5: B64X...</span>
              </p>
              <p className="flex gap-4">
                <span className="text-accent/60">[19:52:12]</span>
                <span className="text-primary">SPEECH_INIT</span>
                <span>// WEBSPEECHAPI_SYNC // BROWSER_MOD_4.2</span>
              </p>
              <p className="flex gap-4">
                <span className="text-accent/60">[19:52:18]</span>
                <span className="text-emerald-400">COMMAND_RECV</span>
                <span>// VOICE_COMMAND "Formalize" RECEIVED //</span>
              </p>
              <p className="flex gap-4">
                <span className="text-accent/60">[19:52:24]</span>
                <span className="text-blue-400">BACKUP_SYNC</span>
                <span>// LOCAL_STORAGE_SNAPSHOT_SAVED //</span>
              </p>
              <p className="flex gap-4">
                <span className="text-accent/60">[19:52:30]</span>
                <span className="text-accent">SYSTEM_HEARTBEAT</span>
                <span>// ALL_PATHWAYS_VERIFIED // 99.98% UPTIME</span>
              </p>
              <p className="flex animate-pulse gap-4">
                <span className="text-accent/60">[19:52:36]</span>
                <span className="text-primary">STANDBY_USER</span>
                <span>// AWAITING_USER_INPUT //</span>
              </p>
              <p className="flex gap-4 opacity-50">
                <span className="text-accent/60">[19:52:42]</span>
                <span className="text-emerald-400">SYSTEM_STATUS</span>
                <span>// SYSTEM STATUS: OK // ENCRYPTION: ACTIVE //</span>
              </p>
            </div>
            {/* Scan animation overlay */}
            <div className="absolute left-0 top-0 h-[1px] w-full animate-[scan_3s_infinite] bg-accent/20" />
          </div>
        </section>

        {/* Global Stats bar */}
        <section className="grid h-24 grid-cols-2 items-center gap-4 pb-8 opacity-70 md:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <Wifi className="h-5 w-5 text-accent" />
            <span className="font-tech text-[9px] uppercase tracking-widest">
              NETWORK_STABLE
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-tech text-[9px] uppercase tracking-widest">
              REGION_GLOBAL
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <HardDrive className="h-5 w-5 text-accent" />
            <span className="font-tech text-[9px] uppercase tracking-widest">
              DISK_HEALTHY
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
            <span className="font-tech text-[9px] uppercase tracking-widest">
              HEARTBEAT_ACTIVE
            </span>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default RootLog;
