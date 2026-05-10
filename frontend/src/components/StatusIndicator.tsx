interface StatusIndicatorProps {
  status: "idle" | "listening" | "processing";
  isCooldown?: boolean;
}

const statusLabels = {
  idle: "Ready",
  listening: "Listening...",
  processing: "Processing...",
  cooldown: "Processing...",
};

const StatusIndicator = ({ status, isCooldown }: StatusIndicatorProps) => {
  const currentStatus = status === "idle" && isCooldown ? "cooldown" : status;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center gap-2 border border-primary/20 bg-background/40 px-3 py-1 backdrop-blur-sm">
        <div className="tech-bracket-tl h-1.5 w-1.5" />
        <div className="tech-bracket-br h-1.5 w-1.5" />

        <div
          className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
            currentStatus === "idle"
              ? "bg-muted-foreground"
              : currentStatus === "listening"
                ? "animate-pulse bg-accent"
                : currentStatus === "cooldown"
                  ? "animate-pulse bg-amber-500"
                  : "animate-pulse bg-primary"
          }`}
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary/90 sm:text-[11px]">
          <span className="mr-2 opacity-50">STATUS:</span>
          {statusLabels[currentStatus]}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;
