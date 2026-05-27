import Layout from "@/components/Layout";
import {
  ShieldCheck,
  EyeOff,
  Lock,
  Database,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const Privacy = () => {
  return (
    <Layout
      title="Privacy Policy"
      subtitle="Your Data Security"
      icon={ShieldCheck}
    >
      <div className="mx-auto max-w-4xl animate-fade-in space-y-12 px-2">
        {/* Intro */}
        <section className="space-y-4 text-center">
          <h3 className="font-tech gold-text-glow text-xl font-bold uppercase tracking-[0.3em] text-primary">
            Privacy Policy
          </h3>
          <p className="font-body text-base italic leading-relaxed text-foreground/80">
            Student and professional work is highly confidential. Scribe is
            built on the principles of secure local processing and private user
            sessions. Your intellectual property stays yours.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Feature highlights */}
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-5 text-center">
            <EyeOff className="mx-auto mb-3 h-6 w-6 text-accent" />
            <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
              Zero Observation
            </h5>
            <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
              AI processing occurs in isolated sessions. We never train models
              on your specific student papers.
            </p>
          </div>
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-5 text-center">
            <Lock className="mx-auto mb-3 h-6 w-6 text-accent" />
            <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
              End-to-End Encryption
            </h5>
            <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
              Syncing is optional. All data is locally encrypted before transit
              to our cloud vault.
            </p>
          </div>
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-5 text-center">
            <Database className="mx-auto mb-3 h-6 w-6 text-accent" />
            <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
              Local Retention
            </h5>
            <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
              Most processing stays in your browser. We only store metadata to
              keep yours history active.
            </p>
          </div>
        </div>

        {/* Detailed items */}
        <section className="space-y-8">
          <div className="border-l-2 border-accent/30 bg-accent/5 p-6">
            <h4 className="font-tech mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-accent">
              <UserCheck className="h-4 w-4" /> User Data Control
            </h4>
            <div className="space-y-4 font-mono text-[11px] text-primary/70">
              <p>
                •{" "}
                <span className="cursor-pointer text-accent underline">
                  Clear Session
                </span>
                : Instantly delete all local and cloud data associated with the
                current document.
              </p>
              <p>
                •{" "}
                <span className="cursor-pointer text-accent underline">
                  Audit Logs
                </span>
                : View every external call Scribe makes to ensure transparency.
              </p>
              <p>
                •{" "}
                <span className="cursor-pointer text-accent underline">
                  Data Portability
                </span>
                : Download your entire interaction history in a single JSON
                archive.
              </p>
            </div>
          </div>

          <div className="border-l-2 border-primary/30 bg-primary/5 p-6">
            <h4 className="font-tech mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary">
              <AlertTriangle className="h-4 w-4" /> Academic Integrity &
              Guidelines
            </h4>
            <p className="font-body text-sm italic leading-relaxed text-foreground/70">
              We respect institutional academic integrity policies. Scribe is an
              editing and refining tool—it is built to augment your own original
              thinking, not replace it. Always cross-reference with your
              university's AI usage guidelines.
            </p>
          </div>
        </section>

        {/* Support Link */}
        <section className="border-t border-primary/10 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Detailed legal terms are available in the{" "}
            <span className="cursor-pointer text-accent underline">
              Full Terms of Service
            </span>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default Privacy;
