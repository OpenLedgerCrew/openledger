import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  "Privacy Policy": {
    title: "Privacy Policy",
    body: [
      "This Privacy Policy describes how OpenLedger (operated by SAPCONE) handles information when you use this public transparency portal.",
      "OpenLedger does not collect, store, or process any personally identifiable information (PII). No names, phone numbers, wallet addresses, or contact details are displayed or retained by this portal.",
      "Payment data shown on this portal consists only of opaque reference IDs, amounts, asset types, statuses, and timestamps. This data is sourced directly from the public Stellar blockchain.",
      "This portal does not use cookies for tracking. Session preferences such as high-contrast mode are stored locally in your browser's localStorage and never transmitted to any server.",
      "If you have questions about data privacy, please contact SAPCONE directly via the Contact page.",
      "This policy will be updated with full legal content prior to the public launch of OpenLedger.",
    ],
  },
  "Terms of Service": {
    title: "Terms of Service",
    body: [
      "By accessing OpenLedger, you agree to use this portal solely for its intended purpose: viewing publicly available humanitarian aid disbursement data.",
      "All on-chain data is provided for informational and transparency purposes only. OpenLedger makes no warranties about the completeness or accuracy of data beyond what is verifiable on the public Stellar blockchain.",
      "You may not use this portal to attempt to identify individual aid recipients. All personal data has been deliberately excluded from the ledger.",
      "OpenLedger and SAPCONE are not liable for decisions made based on data displayed in this portal.",
      "Unauthorised scraping, automated access, or attempts to reverse-engineer payment recipients are prohibited.",
      "Full terms will be documented prior to the public launch of OpenLedger.",
    ],
  },
  "Audit Disclosure": {
    title: "Audit Disclosure",
    body: [
      "OpenLedger is designed to be independently auditable. All payment transactions visible on this portal are anchored to the public Stellar blockchain and can be verified without trusting OpenLedger or SAPCONE.",
      "Audit trail: every payment row includes a Stellar transaction hash. Any person with internet access can verify the hash on a public Stellar block explorer without requiring any credentials.",
      "Field delivery confirmations are separately anchored on-chain by SAPCONE field officers. These confirmation hashes are also visible in the payment detail view.",
      "The software generating this portal is open-source. Code audits may be requested by contacting SAPCONE.",
      "Financial audits of SAPCONE programmes are conducted by independent third-party auditors. Reports are available upon request.",
      "A full audit disclosure document will be published prior to the public launch of OpenLedger.",
    ],
  },
};

interface LegalPageProps {
  title: "Privacy Policy" | "Terms of Service" | "Audit Disclosure";
}

export function LegalPage({ title }: LegalPageProps) {
  const content = CONTENT[title];

  useEffect(() => {
    document.title = `${title} — OpenLedger`;
    return () => {
      document.title = "OpenLedger";
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
            Legal
          </p>
          <h1 className="text-4xl font-bold font-serif text-foreground">{content.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: placeholder — full content forthcoming before public launch.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 mb-8">
          <div className="space-y-4">
            {content.body.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            This is placeholder content.{" "}
            <span className="font-semibold text-foreground">
              Full legal documentation will be published before OpenLedger's public launch.
            </span>
          </p>
          <Link
            to="/contact"
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Contact SAPCONE with questions →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
