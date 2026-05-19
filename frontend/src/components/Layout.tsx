import React, { ReactNode } from "react";
import MysticalBackground from "../components/MysticalBackground";
import FloatingParticles from "../components/FloatingParticles";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useSoundEffects } from "../hooks/useSoundEffects";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
}

const Layout = ({ children, title, subtitle, icon: Icon }: LayoutProps) => {
  const { playHover, playClick } = useSoundEffects();

  return (
    <div className="emerald-gradient-bg relative flex min-h-screen flex-col items-center overflow-x-hidden px-3 pb-8 sm:px-4">
      <MysticalBackground />
      <FloatingParticles />

      {/* ── Header / Navigation ── */}
      <header className="z-20 mb-4 flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 py-4 sm:mb-8 sm:py-6">
        <Link
          to="/"
          onClick={() => playClick()}
          onMouseEnter={() => playHover()}
          className="group flex min-w-0 items-center gap-2 text-primary/60 transition-all duration-300 hover:text-primary"
        >
          <div className="shrink-0 rounded-full border border-primary/10 bg-primary/5 p-2 transition-all group-hover:border-primary/40 group-hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </div>
          <span className="font-tech truncate text-[10px] uppercase tracking-[0.15em]">
            Back to Dashboard
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-accent" />
          <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-widest text-accent/60 sm:text-[9px]">
            System Status: Active
          </span>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-4xl flex-1 animate-fade-in">
        {/* ── Page Title ── */}
        <div className="mb-6 px-2 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-3 sm:mb-4 sm:gap-4">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/40 sm:w-12" />
            {Icon && (
              <Icon className="gold-text-glow h-6 w-6 text-primary sm:h-8 sm:w-8" />
            )}
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary/40 sm:w-12" />
          </div>
          <h1 className="gold-text-glow mb-2 break-words font-heading text-xl uppercase tracking-[0.15em] text-primary sm:mb-3 sm:text-3xl sm:tracking-[0.3em] md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="font-tech text-[10px] uppercase tracking-[0.25em] text-accent opacity-80 sm:text-[11px] sm:tracking-[0.4em]">
              [ {subtitle} ]
            </p>
          )}
        </div>

        {/* ── Content Area ── */}
        <div className="relative overflow-hidden rounded-sm border border-primary/10 bg-slate-950/40 p-4 backdrop-blur-xl sm:p-6 md:p-8">
          {/* Corner brackets — hidden on very small screens to reduce clutter */}
          <div className="tech-bracket-tl hidden h-5 w-5 border-accent/40 sm:block" />
          <div className="tech-bracket-br hidden h-5 w-5 border-accent/40 sm:block" />

          <div className="relative z-10 w-full">{children}</div>

          {/* Decorative grid */}
          <div className="digital-grid pointer-events-none absolute inset-0 opacity-[0.03]" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
