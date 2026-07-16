import { getAvailableCommands } from "@/lib/voiceCommands";
import { Info, X } from "lucide-react";
import { useState } from "react";

const CommandHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const commands = getAvailableCommands();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex cursor-pointer items-center gap-1.5 text-primary/80 transition-colors hover:text-primary"
        aria-label={isOpen ? "Close voice commands" : "Show voice commands"}
      >
        <Info className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="gold-text-glow font-heading text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs">
          Voice Commands
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-[100] mb-3 w-[85vw] -translate-x-1/2 animate-fade-in shadow-2xl sm:w-[500px]">
          {/* Tech-style card */}
          <div
            className="relative overflow-hidden border border-primary/30 backdrop-blur-xl"
            style={{
              background: "rgba(4, 10, 20, 0.95)",
            }}
          >
            <div className="tech-bracket-tl" />
            <div className="tech-bracket-tr" />
            <div className="tech-bracket-bl" />
            <div className="tech-bracket-br" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-4 pb-3 pt-4">
              <p className="font-tech text-[9px] uppercase tracking-[0.4em] text-accent">
                [ Voice Command Center ]
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary/30 transition-colors hover:text-primary/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Command list */}
            <div
              className="custom-scrollbar max-h-[45vh] min-h-0 overflow-y-auto overscroll-contain sm:max-h-[60vh]"
              data-lenis-prevent="true"
            >
              <ul className="space-y-4 p-4">
                {commands.map((cmd, i) => (
                  <li
                    key={i}
                    className="group/item border-l-2 border-primary/10 pl-3 transition-colors hover:border-accent/40"
                  >
                    <p className="mb-1 font-mono text-[11px] font-medium uppercase leading-snug tracking-tight text-foreground/70 sm:text-[12px]">
                      {cmd.description}
                    </p>
                    <p className="font-mono text-[11px] text-primary transition-colors group-hover/item:text-accent sm:text-[12px]">
                      <span className="font-tech mr-2 text-[8px] tracking-[0.2em] opacity-40">
                        SAY:
                      </span>
                      "{cmd.example}"
                    </p>
                  </li>
                ))}

                {/* Undo always shown at bottom */}
                <li className="mt-2 space-y-1 border-l-2 border-t border-destructive/20 border-primary/20 pl-3 pt-3">
                  <p className="font-mono text-[11px] font-medium uppercase leading-snug tracking-tight text-foreground/70 sm:text-[12px]">
                    Reverse last operation
                  </p>
                  <p className="font-mono text-[11px] text-destructive/80 sm:text-[12px]">
                    <span className="font-tech mr-2 text-[8px] tracking-[0.2em] opacity-40">
                      UNDO:
                    </span>
                    "undo"
                  </p>
                </li>
              </ul>
            </div>

            {/* Footer tip */}
            <div className="border-t border-primary/10 bg-primary/5 px-4 pb-3 pt-2">
              <p className="text-center font-mono text-[9px] uppercase tracking-wider text-primary/40">
                Hotkey: [space] or [ctrl+m] to engage mic
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandHelp;
