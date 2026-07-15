import React, { useState } from "react";
import { PageShell, Container, Section } from "../components/ui/PageShell";

export function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageShell>
      <div style={{ backgroundColor: "#fcf5ec", minHeight: "80vh", color: "#1a1714" }}>
        <Section className="pt-16 pb-12">
          <Container size="narrow">
            <h1
              style={{
                fontFamily: "Fraunces, Georgia, serif",
                fontSize: "42px",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              Contact Us
            </h1>
            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#6b7280",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              Have questions about OpenLedger or our programmes? Get in touch.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "32px",
                marginTop: "20px",
              }}
            >
              {/* Form Card */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e5e0d8",
                  boxShadow: "0 8px 30px rgba(15, 23, 42, 0.05)",
                }}
              >
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: "#5da76e1a",
                        color: "#5da76e",
                        fontSize: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                      }}
                    >
                      ✓
                    </div>
                    <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
                      Message Sent!
                    </h3>
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>
                      Thank you for reaching out. We will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #d1d5db",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #d1d5db",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "6px" }}>
                        Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "10px",
                          border: "1px solid #d1d5db",
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        backgroundColor: "#5da76e",
                        color: "#ffffff",
                        padding: "12px",
                        borderRadius: "10px",
                        border: "none",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Info section */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", textAlign: "center" }}>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "20px", border: "1px solid #e5e0d8" }}>
                  <span style={{ fontSize: "20px" }}>✉</span>
                  <h4 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "16px", fontWeight: 700, margin: "8px 0" }}>Email</h4>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>info@sapcone.org</p>
                </div>
                <div style={{ backgroundColor: "#ffffff", borderRadius: "18px", padding: "20px", border: "1px solid #e5e0d8" }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
                  <h4 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "16px", fontWeight: 700, margin: "8px 0" }}>Office</h4>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Lodwar, Turkana County, Kenya</p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </div>
    </PageShell>
  );
}

export default Contact;
