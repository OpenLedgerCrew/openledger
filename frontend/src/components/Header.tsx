import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";
import { Logo } from "./ui/Logo";
import { Button } from "./ui/button";
import { cn } from "./lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/programmes", label: "Programmes" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[#f3e7c4] backdrop-blur rounded-b-2xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <div className="h-6 w-82 "></div>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  // pill-like link with smooth color transition on hover and active
                  "rounded-full px-4 py-2 text-sm transition-colors duration-200",
                  isActive
                    ? "font-medium text-foreground bg-white/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search"
                className="h-9 w-56 rounded-md border border-input bg-card pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
