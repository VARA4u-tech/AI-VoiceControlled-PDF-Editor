import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  delay: string;
  size: number;
  duration: string;
  type: "node" | "glyph" | "square";
  opacity: number;
}

const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      size: 0.8 + Math.random() * 1.5,
      duration: `${10 + Math.random() * 15}s`,
      type: (["node", "glyph", "square"] as const)[
        Math.floor(Math.random() * 3)
      ],
      opacity: 0.1 + Math.random() * 0.3,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block">
      {particles.map((p) => (
        <div
          key={p.id}
          className="float-particle absolute"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        >
          {p.type === "node" ? (
            /* Circled tech node */
            <svg
              width={p.size * 10}
              height={p.size * 10}
              viewBox="0 0 20 20"
              fill="none"
              className="text-primary"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
          ) : p.type === "glyph" ? (
            /* Futuristic small bracket/glyph */
            <svg
              width={p.size * 12}
              height={p.size * 12}
              viewBox="0 0 12 12"
              fill="none"
              className="text-accent"
            >
              <path
                d="M2 2 H1 V11 H2 M10 2 H11 V11 H10"
                stroke="currentColor"
                strokeWidth="0.8"
              />
              <rect x="4" y="5" width="4" height="1" fill="currentColor" />
            </svg>
          ) : (
            /* Rotating hollow square */
            <div
              style={{
                width: p.size * 6,
                height: p.size * 6,
                border: "1px solid hsl(var(--gold) / 0.5)",
                transform: "rotate(45deg)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingParticles;
