import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  mark?: boolean;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-serif text-xl tracking-tight text-foreground",
        className,
      )}
    >
      <span className="font-semibold">
        <span className="text-primary">Sapcone</span>
      </span>
    </Link>
  );
}
