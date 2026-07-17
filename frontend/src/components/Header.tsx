import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, MessageSquare } from "lucide-react";
import { Logo } from "./ui/Logo";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";
import { DonateModal } from "./DonateModal";
import { useChatContext } from "../contexts/ChatContext";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/programmes", label: "Programmes" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { chatOpen, toggleChat } = useChatContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background backdrop-blur rounded-b-2xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">

          {/* Logo */}
          <Logo />

          {/* Desktop nav — only visible md+ */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-4" aria-label="Main navigation">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 flex items-center min-h-[44px]",
                    isActive
                      ? "font-semibold bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side — desktop actions */}
          <div className="ml-auto flex items-center gap-2">

            {/* Donate — desktop only */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setDonateOpen(true)}
              className="hidden md:inline-flex"
            >
              Donate to Sapcone
            </Button>

            {/* Assistant toggle — desktop only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              aria-label={chatOpen ? "Close assistant chat" : "Open assistant chat"}
              aria-expanded={chatOpen}
              className={cn(
                "hidden md:inline-flex",
                chatOpen && "bg-primary/15 text-primary"
              )}
            >
              <MessageSquare size={16} aria-hidden="true" />
              <span>Assistant</span>
            </Button>

            {/* Hamburger — mobile only (md and below) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              className="flex md:hidden"
            >
              {mobileNavOpen
                ? <X size={22} aria-hidden="true" />
                : <Menu size={22} aria-hidden="true" />
              }
            </Button>
          </div>
        </div>

        {/* Mobile drawer — full-width, shown only when hamburger is open */}
        {mobileNavOpen && (
          <nav
            className="border-t border-border bg-background md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col px-4 py-3 gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 min-h-[44px] flex items-center",
                      isActive
                        ? "font-semibold bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="my-1 border-t border-border" />

              <Button
                variant="default"
                size="sm"
                className="w-full justify-center"
                onClick={() => { setMobileNavOpen(false); setDonateOpen(true); }}
              >
                Donate to Sapcone
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                onClick={() => { setMobileNavOpen(false); toggleChat(); }}
              >
                <MessageSquare size={16} aria-hidden="true" />
                Assistant
              </Button>
            </div>
          </nav>
        )}
      </header>

      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </>
  );
}
