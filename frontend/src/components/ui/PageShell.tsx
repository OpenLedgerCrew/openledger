import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Header } from "../Header";
import { Footer } from "../Footer";

interface PageShellProps {
  children: ReactNode;
  showSearch?: boolean;
  className?: string;
}

export function PageShell({ children, showSearch, className }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header showSearch={showSearch} />
      <main className={cn("flex-1", className)}>{children}</main>
      <Footer />
    </div>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

export function Container({ children, className, size = "default" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        size === "narrow" && "max-w-3xl",
        size === "default" && "max-w-6xl",
        size === "wide" && "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-10 sm:py-14", className)}>
      {children}
    </section>
  );
}
