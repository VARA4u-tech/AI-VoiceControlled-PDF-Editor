import Layout from "@/components/Layout";
import {
  HelpCircle,
  GraduationCap,
  Mic,
  FileText,
  Sparkles,
  BookOpen,
} from "lucide-react";

const IntelHub = () => {
  return (
    <Layout
      title="Help Center"
      subtitle="User Guides & Manual"
      icon={GraduationCap}
    >
      <div className="animate-fade-in space-y-12 px-2">
        {/* Intro */}
        <section className="space-y-4 text-center">
          <h3 className="gold-text-glow font-heading text-xl uppercase tracking-[0.3em] text-primary">
            Scribe AI User Manual
          </h3>
          <p className="mx-auto max-w-3xl font-body text-base italic leading-relaxed text-foreground/80">
            Maximize your productivity. Scribe is engineered to bridge the gap
            between spoken thought and structured, professional documents.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Quick Start for Students */}
          <section className="group relative overflow-hidden rounded-sm border border-primary/10 bg-primary/5 p-6 transition-all hover:border-accent/40">
            <div className="tech-bracket-tl h-2 w-2" />
            <h4 className="font-tech mb-6 flex items-center gap-3 text-xs uppercase tracking-widest text-primary/80">
              <Sparkles className="h-4 w-4 text-accent" />
              Quick Start Guide
            </h4>
            <ul className="space-y-4 font-mono text-[11px] text-primary/70">
              <li className="flex gap-3">
                <span className="font-bold text-accent">01.</span>
                <span>
                  Upload your document drafts (PDF/TXT).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">02.</span>
                <span>
                  Activate the Mic to dictate structure or content.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">03.</span>
                <span>
                  Use commands like "Summarize" or "Format as Bibliography".
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">04.</span>
                <span>Save your version and export to high-quality PDF.</span>
              </li>
            </ul>
          </section>

          {/* Core Command Protocols */}
          <section className="group relative overflow-hidden rounded-sm border border-primary/10 bg-primary/5 p-6 transition-all hover:border-accent/40">
            <div className="tech-bracket-tl h-2 w-2" />
            <h4 className="font-tech mb-6 flex items-center gap-3 text-xs uppercase tracking-widest text-primary/80">
              <BookOpen className="h-4 w-4 text-accent" />
              Editing Commands
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="border-l-2 border-accent/30 bg-accent/5 p-2">
                <div className="font-tech text-[10px] font-bold uppercase tracking-widest text-accent">
                  Formalize
                </div>
                <div className="font-mono text-[9px] text-primary/60">
                  Converts casual dictation into academic tone.
                </div>
              </div>
              <div className="border-l-2 border-primary/30 bg-primary/5 p-2">
                <div className="font-tech text-[10px] font-bold uppercase tracking-widest text-primary">
                  Connective
                </div>
                <div className="font-mono text-[9px] text-primary/60">
                  Adds academic bridge phrases between points.
                </div>
              </div>
              <div className="border-l-2 border-accent/30 bg-accent/5 p-2">
                <div className="font-tech text-[10px] font-bold uppercase tracking-widest text-accent">
                  Highlight
                </div>
                <div className="font-mono text-[9px] text-primary/60">
                  Flags key concepts for later study.
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Use Cases */}
        <section className="space-y-6">
          <h4 className="font-tech text-center text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Common Workflows
          </h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="p-4 text-center">
              <Mic className="mx-auto mb-3 h-6 w-6 text-accent" />
              <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
                Essay Drafting
              </h5>
              <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
                Speak your thesis out loud and let Scribe structure the
                evidence.
              </p>
            </div>
            <div className="p-4 text-center">
              <FileText className="mx-auto mb-3 h-6 w-6 text-accent" />
              <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
                Lecture Synthesis
              </h5>
              <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
                Inject messy raw notes and use "Formalize" to create study
                guides.
              </p>
            </div>
            <div className="p-4 text-center">
              <HelpCircle className="mx-auto mb-3 h-6 w-6 text-accent" />
              <h5 className="font-tech mb-2 text-[10px] uppercase text-primary">
                Exam Prep
              </h5>
              <p className="font-body text-[11px] italic leading-relaxed text-foreground/60">
                Summarize long textbook chapters through voice interaction.
              </p>
            </div>
          </div>
        </section>

        {/* Support Link */}
        <section className="border-t border-primary/10 py-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Need advanced support? Email us at{" "}
            <span className="cursor-pointer text-accent underline">
              support@scribeai.com
            </span>
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default IntelHub;
