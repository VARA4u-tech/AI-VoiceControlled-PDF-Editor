import React from "react";

const MysticalBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block">
      {/* Ambient glowing deep-sea/emerald orbs */}
      <div className="absolute left-[-10%] top-[-10%] h-[60vw] w-[60vw] animate-[pulse_8s_ease-in-out_infinite_alternate] rounded-full bg-accent/5 mix-blend-screen blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50vw] w-[50vw] animate-[pulse_12s_ease-in-out_infinite_alternate-reverse] rounded-full bg-primary/5 mix-blend-screen blur-[140px]" />

      {/* Modern Tech Elements */}
      <div className="digital-grid absolute inset-0 opacity-5" />
      <div className="scanline" />

      {/* Modern Tech Nodes Background */}
      <div className="digital-nodes-bg absolute inset-0 opacity-10 mix-blend-screen" />

      {/* Sweeping ethereal glow */}
      <div className="bg-primary/2 absolute inset-x-0 top-1/4 h-1/2 animate-[pulse_15s_ease-in-out_infinite_alternate] rounded-[100%] opacity-20 mix-blend-screen blur-[120px]" />

      {/* Central Neural Audio Core / Voice Matrix */}
      <div className="absolute left-1/2 top-1/2 aspect-square w-[150vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 animate-[spin_300s_linear_infinite] opacity-[0.08] sm:w-[100vw]">
        <svg
          viewBox="0 0 500 500"
          className="h-full w-full fill-none stroke-current text-primary"
        >
          {/* Outer tech boundaries */}
          <circle
            cx="250"
            cy="250"
            r="245"
            strokeWidth="0.5"
            strokeDasharray="10 5"
            className="text-primary/20"
          />
          <circle
            cx="250"
            cy="250"
            r="235"
            strokeWidth="1"
            className="text-primary/40"
          />

          {/* Rotating Data Rings */}
          <g className="animate-[spin_120s_linear_infinite]">
            <path
              d="M250,50 A200,200 0 0,1 450,250"
              strokeWidth="2"
              stroke="hsl(var(--accent))"
            />
            <path
              d="M250,450 A200,200 0 0,1 50,250"
              strokeWidth="2"
              stroke="hsl(var(--accent))"
            />
          </g>

          {/* HUD Brackets */}
          <path
            d="M150,150 L150,130 L170,130 M330,130 L350,130 L350,150 M350,350 L350,370 L330,370 M170,370 L150,370 L150,350"
            strokeWidth="1.5"
            className="text-accent"
          />

          {/* Central Wave Core */}
          <g className="animate-pulse">
            <circle
              cx="250"
              cy="250"
              r="80"
              strokeWidth="0.5"
              strokeDasharray="4 4"
              className="text-primary/30"
            />
            <circle
              cx="250"
              cy="250"
              r="60"
              strokeWidth="1"
              className="text-primary/50"
            />

            {/* Inner dynamic segments */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1="250"
                y1="210"
                x2="250"
                y2="190"
                transform={`rotate(${i * 30} 250 250)`}
                strokeWidth="2"
                className="text-accent/60"
              />
            ))}
          </g>

          {/* Floating Data Nodes within core */}
          <circle
            cx="250"
            cy="250"
            r="10"
            fill="currentColor"
            className="animate-pulse text-accent"
          />
        </svg>
      </div>

      {/* Secondary Counter-rotating HUD Ring */}
      <div className="absolute left-1/2 top-1/2 aspect-square w-[120vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 animate-[spin_180s_reverse_linear_infinite] opacity-[0.05] sm:w-[80vw]">
        <svg
          viewBox="0 0 500 500"
          className="h-full w-full fill-none stroke-current text-accent"
        >
          <circle
            cx="250"
            cy="250"
            r="248"
            strokeWidth="0.5"
            strokeDasharray="20 40"
          />
          <path
            d="M100,250 L400,250 M250,100 L250,400"
            strokeWidth="0.2"
            className="opacity-30"
          />
        </svg>
      </div>
    </div>
  );
};

export default MysticalBackground;
