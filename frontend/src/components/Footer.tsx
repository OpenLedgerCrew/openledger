import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";

const COLS = [
  {
    heading: "Product",
    links: [
      { to: "/programmes", label: "Programmes" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },],
  },
  {
    heading: "Legal",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/audit", label: "Audit" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo className="text-primary-foreground [&_span:last-child]:text-primary-foreground" mark={false} />
          <p className="max-w-sm text-sm text-primary-foreground/70">
            Providing financial clarity and accountability for humanitarian
            aid programmes across East Africa.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.heading} className="text-sm">
            <div className="mb-3 text-xs uppercase tracking-wider text-primary-foreground/60">
              {col.heading}
            </div>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 text-xs text-primary-foreground/60 sm:px-6">
          <span>© {new Date().getFullYear()} OpenLedger. Transparency in aid.</span>
          <span>Verified on-chain</span>
        </div>
      </div>
    </footer>
  );
}
