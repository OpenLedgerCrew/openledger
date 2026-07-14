import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./lib/utils";

interface SiteAlertProps {
  children: ReactNode;
  tone?: "warning" | "info";
  className?: string;
}

export function SiteAlert({ children, tone = "warning", className }: SiteAlertProps) {
  return (
    <div
      className={cn(
        "w-full border-y text-sm",
        tone === "warning"
          ? "border-warning/40 bg-warning/20 text-warning-foreground"
          : "border-highlight/60 bg-highlight/50 text-highlight-foreground",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-start gap-2 px-4 py-2.5 sm:px-6">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
