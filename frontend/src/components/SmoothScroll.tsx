import { useLenis } from "@/hooks/useLenis";

/**
 * SmoothScroll
 * Drop this anywhere above your page content (e.g. inside BrowserRouter).
 * Enables buttery-smooth scroll on ALL devices:
 *   • Desktop  — via mouse wheel interception
 *   • Mobile   — via smoothTouch / syncTouch (touch event interception)
 *   • Tablet   — same as mobile
 * Renders nothing — purely side-effect driven.
 */
export default function SmoothScroll() {
  useLenis({
    duration: 1.2,
    smoothWheel: true,
    // ── Pro Mobile Optimization ───────────────────────────────────────
    // We completely disable smoothTouch. 
    // Native mobile scrolling is hardware accelerated and naturally smooth.
    // Hijacking it causes jitter, lag, and the "overscroll" effect.
    smoothTouch: false,
    syncTouch: false,
    // ─────────────────────────────────────────────────────────────────
  });

  return null;
}
