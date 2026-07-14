import { Link } from "react-router-dom";
import { cn } from "./lib/utils";

interface LogoProps {
  className?: string;
  mark?: boolean;
}

export function Logo({ className, mark = true }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-serif text-xl tracking-tight text-foreground",
        className,
      )}
    >
      {mark && (
        <span
          aria-hidden
          className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </span>
      )}
      <span className="font-semibold">
        Open<span className="text-primary">Ledger</span>
      </span>
    </Link>
  );
}
