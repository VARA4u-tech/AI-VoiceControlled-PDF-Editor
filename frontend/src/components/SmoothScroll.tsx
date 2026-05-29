import { useLenis } from "@/hooks/useLenis";

/**
 * SmoothScroll
 * Drop this anywhere above your page content (e.g. inside BrowserRouter)
 * and Lenis will intercept all native scroll events for buttery-smooth scrolling.
 * Renders nothing — purely side-effect driven.
 */
export default function SmoothScroll() {
  useLenis({
    duration: 1.2,
    smoothWheel: true,
    touchMultiplier: 2,
  });

  return null;
}
