import React from "react";
import { useParams, Link } from "react-router-dom";
import { PageShell, Container, Section } from "../components/ui/PageShell";
import { cn } from "../components/lib/utils";

const LEGAL_DOCS = [
  {
    id: "privacy",
    title: "Privacy Policy",
    content: (
      <div>
        <p style={{ marginBottom: "16px" }}>
          Strategic Initiative / SAPCONE NGO (Support Activities for Poor Producers of Kenya) is committed to protecting the privacy of our donors, partners, and cash transfer recipients. This Privacy Policy details how we handle data on the OpenLedger portal.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>1. Zero On-Chain PII</h3>
        <p style={{ marginBottom: "16px" }}>
          To safeguard our cash transfer beneficiaries in Turkana County and other regions, no Personally Identifiable Information (PII) is ever uploaded to the public Stellar network. Names, phone numbers, exact addresses, and proxy identities are strictly kept off-chain.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>2. Local Audit Storage</h3>
        <p style={{ marginBottom: "16px" }}>
          Detailed verification records, including recipient field signatures and identity documents, are stored securely at SAPCONE's main office in Lodwar, Kenya. Access is restricted to authorized auditing bodies and staff.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>3. Web Analytics and Logging</h3>
        <p style={{ marginBottom: "16px" }}>
          This portal does not employ tracking pixels or third-party behavioral advertising. We perform standard server logging solely to ensure the portal's stability, security, and performance.
        </p>
      </div>
    ),
  },
  {
    id: "terms",
    title: "Terms of Service",
    content: (
      <div>
        <p style={{ marginBottom: "16px" }}>
          Welcome to the SAPCONE OpenLedger portal. By accessing, browsing, or utilizing this site, you agree to comply with and be bound by the following Terms of Service.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>1. Informational Purposes</h3>
        <p style={{ marginBottom: "16px" }}>
          The OpenLedger platform is provided as an open accountability dashboard. It visualizes humanitarian aid cash transfers anchored to the public Stellar blockchain. The portal does not constitute financial or legal advice.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>2. Blockchain Network Status</h3>
        <p style={{ marginBottom: "16px" }}>
          Transaction anchoring relies on the availability and operation of the Stellar blockchain network. SAPCONE is not responsible for delayed confirmation times, fees, or data access interruptions caused by the public network.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>3. Acceptable Use</h3>
        <p style={{ marginBottom: "16px" }}>
          Users agree not to attempt to disrupt the performance of this site, scrape sensitive data, or bypass page-level accessibility controls.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    content: (
      <div>
        <p style={{ marginBottom: "16px" }}>
          This Cookie Policy explains how SAPCONE's OpenLedger portal uses cookies and similar tracking technologies. Our approach is designed to maximize privacy and transparency.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>1. What Are Cookies?</h3>
        <p style={{ marginBottom: "16px" }}>
          Cookies are small text files stored on your computer or mobile device when you visit websites. They help websites remember preferences and state.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>2. How We Use Cookies</h3>
        <p style={{ marginBottom: "16px" }}>
          We use functional cookies exclusively to support your browsing experience. This includes saving accessibility choices (such as High Contrast Mode) and ensuring session security.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>3. No Third-Party Trackers</h3>
        <p style={{ marginBottom: "16px" }}>
          We do not set cookies for ad tracking, remarketing, or third-party analytics platforms. Your browsing behavior remains completely private.
        </p>
      </div>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: (
      <div>
        <p style={{ marginBottom: "16px" }}>
          The materials on SAPCONE's OpenLedger portal are provided "as is". SAPCONE makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>1. Last-Mile Verification Limits</h3>
        <p style={{ marginBottom: "16px" }}>
          On-chain transaction hashes prove the cryptographic settlement of digital tokens. While they demonstrate that funds were sent by SAPCONE, final physical receipt in hand is audited via separate, off-chain, last-mile verification logs handled by local staff.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>2. No Warranties</h3>
        <p style={{ marginBottom: "16px" }}>
          SAPCONE does not warrant that the portal will be uninterrupted, error-free, or that data displayed is updated in real-time. Fluctuations in network sync times can occur.
        </p>
      </div>
    ),
  },
  {
    id: "data-protection",
    title: "Data Protection Statement",
    content: (
      <div>
        <p style={{ marginBottom: "16px" }}>
          SAPCONE operates in accordance with the Kenya Data Protection Act 2019. We implement strict technical and organizational safeguards to ensure data safety.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>1. Compliance with Kenyan Law</h3>
        <p style={{ marginBottom: "16px" }}>
          We respect the rights of data subjects. Recipient information, donor details, and partner records are collected and processed only with express consent and for defined, humanitarian aid-related purposes.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>2. Minimization Principles</h3>
        <p style={{ marginBottom: "16px" }}>
          We apply data minimization to all public views. Database structures strictly enforce PII filters to redact address segments and identifying characteristics before they reach the web server layer.
        </p>
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "20px 0 10px", fontFamily: "Fraunces, Georgia, serif" }}>3. Protection Contacts</h3>
        <p style={{ marginBottom: "16px" }}>
          For inquiries or to exercise your rights as a data subject under the Data Protection Act, please contact our Data Protection Officer at info@sapcone.org.
        </p>
      </div>
    ),
  },
];

export function Legal() {
  const { docType } = useParams<{ docType: string }>();
  const activeDoc = LEGAL_DOCS.find((d) => d.id === docType) || LEGAL_DOCS[0];

  return (
    <PageShell>
      <div style={{ backgroundColor: "#fcf5ec", minHeight: "80vh", color: "#1a1714" }}>
        <Section className="pt-12 pb-16">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
              {/* Sidebar */}
              <aside>
                <div style={{ borderRight: "1px solid #e5e0d8", paddingRight: "16px" }}>
                  <h2 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: "16px", fontWeight: 700 }}>
                    Legal Documents
                  </h2>
                  <nav className="flex flex-col gap-1">
                    {LEGAL_DOCS.map((doc) => (
                      <Link
                        key={doc.id}
                        to={`/legal/${doc.id}`}
                        className={cn(
                          "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                          activeDoc.id === doc.id
                            ? "text-[#144e27] bg-green-200"
                            : "text-muted-foreground hover:text-[#144e27] hover:bg-green-100",
                        )}
                      >
                        {doc.title}
                      </Link>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Document Content */}
              <article>
                <h1
                  style={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontSize: "36px",
                    fontWeight: 700,
                    marginBottom: "8px",
                    color: "#1a1714",
                  }}
                >
                  {activeDoc.title}
                </h1>
                <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "24px", fontWeight: 500 }}>
                  SAPCONE NGO Legal Document &middot; Last updated July 2026
                </p>
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: "#374151",
                  }}
                >
                  {activeDoc.content}
                </div>
              </article>
            </div>
          </Container>
        </Section>
      </div>
    </PageShell>
  );
}
