import Layout from "@/components/Layout";
import {
  FileText,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Globe,
  Terminal,
} from "lucide-react";

const Terms = () => {
  return (
    <Layout
      title="Terms of Service"
      subtitle="Standard Terms"
      icon={Scale}
    >
      <div className="mx-auto max-w-4xl animate-fade-in space-y-12 px-2">
        {/* Intro */}
        <section className="space-y-4 text-center">
          <h3 className="font-tech gold-text-glow text-xl font-bold uppercase tracking-[0.3em] text-primary">
            Terms of Service
          </h3>
          <p className="font-body text-base italic leading-relaxed text-foreground/80">
            By using our AI Voice Editor service, you agree to maintain the
            integrity of academic and professional standards. Our tools are for
            assistance, not automation of fraud.
          </p>
        </section>

        {/* Core items */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="space-y-6">
            <h4 className="font-tech mb-4 flex items-center gap-3 border-b border-primary/10 pb-2 text-xs font-bold uppercase tracking-widest text-primary">
              <CheckCircle2 className="h-4 w-4 text-accent" />{" "}
              Permitted Uses
            </h4>
            <div className="space-y-6 font-mono text-[11px] text-primary/70">
              <div className="border-l-2 border-accent/20 bg-accent/5 p-3">
                <p>• Editing and refining original student coursework.</p>
              </div>
              <div className="border-l-2 border-accent/20 bg-accent/5 p-3">
                <p>• Formatting research papers for academic submission.</p>
              </div>
              <div className="border-l-2 border-accent/20 bg-accent/5 p-3">
                <p>• Summarizing personal lecture notes and study guides.</p>
              </div>
              <div className="border-l-2 border-accent/20 bg-accent/5 p-3">
                <p>• Utilizing voice commands for hands-free study sessions.</p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="font-tech mb-4 flex items-center gap-3 border-b border-primary/10 pb-2 text-xs font-bold uppercase tracking-widest text-primary">
              <AlertOctagon className="h-4 w-4 text-accent" /> Restricted Activities
            </h4>
            <div className="space-y-6 font-mono text-[11px] text-primary/70">
              <div className="border-l-2 border-primary/20 bg-primary/5 p-3">
                <p>• Reverse engineering the voice processing systems.</p>
              </div>
              <div className="border-l-2 border-primary/20 bg-primary/5 p-3">
                <p>• Automating high-volume academic dishonesty.</p>
              </div>
              <div className="border-l-2 border-primary/20 bg-primary/5 p-3">
                <p>• Unauthorized extraction of other users' metadata.</p>
              </div>
              <div className="border-l-2 border-primary/20 bg-primary/5 p-3">
                <p>• Injecting malicious payloads into the document engine.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Global Compliance */}
        <section className="flex flex-col items-center gap-6 rounded-sm border border-primary/10 bg-primary/5 p-6">
          <div className="flex items-center gap-12 opacity-40 sm:gap-24">
            <Globe className="h-8 w-8 text-primary" />
            <Terminal className="h-8 w-8 text-accent" />
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-3 text-center">
            <h4 className="font-tech text-xs font-bold uppercase tracking-[0.4em] text-primary/80">
              Global Synchronization
            </h4>
            <p className="mx-auto max-w-2xl font-body text-[11px] italic leading-relaxed text-foreground/50">
              Scribe operates under global academic integrity standards. Any misuse
              for harmful fraud will result in immediate account suspension.
              Always prioritize original scholarship.
            </p>
          </div>
        </section>

        {/* Footer info */}
        <section className="border-t border-primary/10 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Last Updated //{" "}
            <span className="cursor-pointer text-accent underline">
              MARCH 2026
            </span>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default Terms;
