import React from "react";
import { Shield, Zap, Cpu, Sparkles } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface CyberHeroProps {
  fileName?: string;
  paragraphsCount?: number;
}

const CyberHero = ({ fileName, paragraphsCount }: CyberHeroProps) => {
  const { playHover } = useSoundEffects();

  return (
    <div className="relative mb-10 flex w-full max-w-5xl animate-fade-in flex-col items-center pt-6 sm:pt-10">
      {/* Decorative Outer Hexagon HUD — contained to logo area */}
      <div className="pointer-events-none absolute left-1/2 top-6 h-80 w-80 -translate-x-1/2 opacity-20">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full fill-none stroke-current text-accent"
        >
          <path
            d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Main Logo Area */}
      <div className="group relative mb-8">
        <div className="absolute -inset-16 rounded-full bg-accent/20 opacity-0 blur-[100px] transition-opacity duration-1000 group-hover:opacity-100" />
        <img
          src="/LOGO.png"
          alt="Voice Controlled PDF Editor Logo"
          className="relative z-10 h-auto w-56 drop-shadow-[0_0_60px_hsl(var(--gold)/0.6)] transition-transform duration-700 group-hover:scale-105 sm:w-[320px] md:w-[400px]"
        />
        <div className="tech-bracket-tl -left-4 -top-4 h-10 w-10 border-accent/40" />
        <div className="tech-bracket-br -bottom-4 -right-4 h-10 w-10 border-accent/40" />
        <div className="tech-bracket-tr -right-4 -top-4 h-4 w-4 border-accent/20" />
        <div className="tech-bracket-bl -bottom-4 -left-4 h-4 w-4 border-accent/20" />
      </div>

      {/* Primary Titles */}
      <div className="relative mb-12 space-y-4 px-6 text-center">
        <h1 className="gold-text-glow px-4 font-heading text-base uppercase leading-tight tracking-wider text-primary sm:px-0 sm:text-3xl sm:tracking-widest md:text-5xl lg:text-6xl">
          Voice Controlled PDF Editor
        </h1>
        <div className="flex items-center justify-center gap-6">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-accent/60" />
          <p className="font-tech text-glow text-xs font-bold uppercase tracking-[0.5em] text-accent sm:text-sm md:text-base">
            Professional Suite
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-accent/60" />
        </div>

        {fileName && paragraphsCount && (
          <div className="mt-5 flex scale-100 flex-col items-center">
            <div className="rounded-sm border border-accent/30 bg-accent/10 px-4 py-2 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
              <span className="font-mono text-xs font-medium uppercase tracking-tight text-accent">
                Active: {fileName} // {paragraphsCount} Paragraphs
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Columns: Value Proposition */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
        <div
          onMouseEnter={() => playHover()}
          className="group relative overflow-hidden rounded-sm border border-primary/20 bg-slate-950/60 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-accent/50"
        >
          <div className="tech-bracket-tl h-3 w-3" />
          <div className="absolute right-0 top-0 p-3 opacity-30 transition-all group-hover:scale-110 group-hover:text-accent group-hover:opacity-100">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-tech mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Voice Intelligence
          </h3>
          <p className="font-body text-base font-medium leading-relaxed text-foreground">
            Edit documents naturally with our fast and accurate voice
            recognition technology.
          </p>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-tighter text-accent/80">
            High Performance // ACTIVE
          </div>
        </div>

        <div
          onMouseEnter={() => playHover()}
          className="group relative overflow-hidden rounded-sm border border-primary/20 bg-slate-950/60 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-accent/50"
        >
          <div className="tech-bracket-tl h-3 w-3" />
          <div className="absolute right-0 top-0 p-3 opacity-30 transition-all group-hover:scale-110 group-hover:text-accent group-hover:opacity-100">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-tech mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Secure & Private
          </h3>
          <p className="font-body text-base font-medium leading-relaxed text-foreground">
            We prioritize your privacy. All document processing happens securely
            on your device.
          </p>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-tighter text-accent/80">
            Status: Protected // ENCRYPTED
          </div>
        </div>

        <div
          onMouseEnter={() => playHover()}
          className="group relative overflow-hidden rounded-sm border border-primary/20 bg-slate-950/60 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-accent/50"
        >
          <div className="tech-bracket-tl h-3 w-3" />
          <div className="absolute right-0 top-0 p-3 opacity-30 transition-all group-hover:scale-110 group-hover:text-accent group-hover:opacity-100">
            <Cpu className="h-5 w-5" />
          </div>
          <h3 className="font-tech mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Smart Editing
          </h3>
          <p className="font-body text-base font-medium leading-relaxed text-foreground">
            Our AI understands your commands, making complex document edits as
            simple as speaking.
          </p>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-tighter text-accent/80">
            AI Engine // v4.2
          </div>
        </div>
      </div>

      {/* Decorative Bottom Bar */}
      <div className="mt-10 flex w-full max-w-md items-center justify-between border-x border-primary/10 bg-primary/5 px-6 py-4">
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Reliability
          </span>
          <span className="font-mono text-sm font-bold text-accent">99.9%</span>
        </div>
        <div className="h-10 w-[1px] bg-primary/20" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Version
          </span>
          <span className="font-mono text-sm font-bold text-accent">
            v4.2 PRO
          </span>
        </div>
        <div className="h-10 w-[1px] bg-primary/20" />
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary/40">
            Security
          </span>
          <span className="font-mono text-sm font-bold text-accent">
            VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
};

export default CyberHero;
