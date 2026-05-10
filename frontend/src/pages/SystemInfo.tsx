import Layout from "@/components/Layout";
import {
  Info,
  Code,
  Cpu,
  Globe,
  Mail,
  Github,
  Instagram,
  LinkedinIcon,
} from "lucide-react";

const SystemInfo = () => {
  return (
    <Layout title="System Info" subtitle="Technical Specifications" icon={Info}>
      <div className="space-y-12">
        <section className="space-y-4 text-center">
          <h3 className="gold-text-glow font-heading text-xl uppercase tracking-[0.3em] text-primary">
            Gilded Voice Scribe
          </h3>
          <p className="mx-auto max-w-2xl font-body text-base italic leading-relaxed text-foreground/80">
            A professional interface for editing documents using natural speech.
            Combining elegant design with advanced voice recognition technology.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <section className="space-y-6">
            <h4 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
              <Cpu className="h-4 w-4 text-accent" />
              Technology Stack
            </h4>
            <div className="space-y-4 font-mono text-[11px] text-primary/70">
              <div className="flex justify-between border-l-2 border-accent/40 bg-accent/5 p-2">
                <span>VOICE_ENGINE</span>
                <span className="text-accent">Web Speech API</span>
              </div>
              <div className="flex justify-between border-l-2 border-primary/40 bg-primary/5 p-2">
                <span>FRAMEWORK</span>
                <span className="text-primary">React 18.3 + Vite</span>
              </div>
              <div className="flex justify-between border-l-2 border-accent/40 bg-accent/5 p-2">
                <span>UI_ENGINE</span>
                <span className="text-accent">Tailwind CSS + Lucide</span>
              </div>
              <div className="flex justify-between border-l-2 border-primary/40 bg-primary/5 p-2">
                <span>PARSING_LOGIC</span>
                <span className="text-primary">PDF.js</span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="font-tech flex items-center gap-2 border-b border-primary/10 pb-2 text-xs uppercase tracking-widest text-primary">
              <Code className="h-4 w-4 text-accent" />
              Developer Information
            </h4>
            <div className="space-y-6">
              <p className="font-body text-sm italic leading-relaxed text-foreground/70">
                Designed and engineered for a seamless voice editing experience.
                All systems verified stable under v4.2.
              </p>
              <div className="flex gap-6">
                <a
                  href="https://github.com/VARA4u-tech"
                  className="group rounded-full border border-primary/20 bg-primary/5 p-3 transition-all hover:border-accent hover:text-accent"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/durga-vara-prasad-pappuri-1797701b6"
                  className="group rounded-full border border-primary/20 bg-primary/5 p-3 transition-all hover:border-accent hover:text-accent"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://mail.google.com/mail/u/0/pappuridurgavaraprasad4pl@gmail.com"
                  className="group rounded-full border border-primary/20 bg-primary/5 p-3 transition-all hover:border-accent hover:text-accent"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </section>
        </div>

        <section className="border-t border-primary/10 pt-8">
          <div className="flex flex-col items-center gap-2 opacity-30">
            <span className="font-tech text-[9px] uppercase tracking-[0.5em]">
              Designed with Precision
            </span>
            <span className="font-mono text-[8px] tracking-widest">
              BUILD_ID: SCRIBE_2026_MAR_01
            </span>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SystemInfo;
