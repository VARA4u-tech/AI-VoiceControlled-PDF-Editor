import Lenis from "lenis";
import { useEffect, useRef } from "react";

interface UseLenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: "vertical" | "horizontal";
  smoothWheel?: boolean;
  /** Enable smooth scroll on touch devices (mobile/tablet) */
  smoothTouch?: boolean;
  /** Sync touch inertia to Lenis easing (Lenis v2+) */
  syncTouch?: boolean;
  /** Inertia duration for touch devices in seconds (Lenis v2+) */
  syncTouchLerp?: number;
  touchMultiplier?: number;
  infinite?: boolean;
}

/**
 * useLenis — initialises a Lenis smooth-scroll instance and drives its
 * requestAnimationFrame loop for the lifetime of the host component.
 *
 * Works on desktop (mouse wheel), mobile and tablets (touch).
 *
 * @returns the Lenis instance ref (useful for programmatic scroll)
 */
export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing:
        options.easing ??
        ((t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      orientation: options.orientation ?? "vertical",
      gestureOrientation: "vertical",
      smoothWheel: options.smoothWheel ?? true,

      // ── Touch / Mobile support ──────────────────────────────────────
      // Pro implementation: Never hijack touch (smoothTouch: false). 
      // It makes mobile scrolling feel unnatural and jittery.
      smoothTouch: options.smoothTouch ?? false,
      // Instead, sync native scroll with Lenis (syncTouch: true)
      // so scroll-linked animations still work flawlessly.
      syncTouch: options.syncTouch ?? true,
      syncTouchLerp: options.syncTouchLerp ?? 0.1,
      // Keep touch multiplier at 1 for natural native scroll speed
      touchMultiplier: options.touchMultiplier ?? 1,
      // ────────────────────────────────────────────────────────────────

      infinite: options.infinite ?? false,
    } as ConstructorParameters<typeof Lenis>[0]);

    lenisRef.current = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return lenisRef;
}
