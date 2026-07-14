import type { ReactNode } from "react";
import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card px-5 py-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]",
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
