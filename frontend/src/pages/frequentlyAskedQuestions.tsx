import React, { useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export default function FrequentlyAskedQuestions() {
  const faqRef = useRef<HTMLDivElement | null>(null);

  const faqs = [
    {
      question: "What does SAPCONE stand for?",
      answer:
        "SAPCONE stands for Sustainable Approaches for Community Empowerment. It is a local Kenyan Non-Governmental Organization (NGO) originally founded in 2006.",
    },
    {
      question: "What are SAPCONE's main activities?",
      answer:
        "The organization focuses on several core thematic areas:\n\n• Humanitarian Assistance & Emergency Response: Providing multipurpose cash transfers and aid during severe droughts and natural disasters.\n• Peace & Security: Facilitating conflict mitigation and peacebuilding among nomadic communities.\n• Water, Sanitation & Hygiene (WASH): Improving access to water for targeted communities and refugees.\n• Health, Nutrition & Education: Managing acute malnutrition and increasing access to quality pre-primary and primary education.",
    },
    {
      question: "Where does SAPCONE operate?",
      answer:
        "SAPCONE primarily implements its development and humanitarian programs in the arid and semi-arid lands (ASAL) regions, with a major focus on Turkana County (including Turkana North, Kibish, Central, East, and South Sub-Counties) as well as the Omo region in Ethiopia.",
    },
    {
      question: "Who does SAPCONE partner with?",
      answer:
        "SAPCONE collaborates with international organizations and donors such as DanChurch Aid (DCA), the Danish International Development Agency (DANIDA), and the Kenyan government. To learn more about their active projects, visit the official SAPCONE Organisation website.",
    },
    {
      question: "Where are SAPCONE's branch offices located?",
      answer:
        "While the main headquarters is located in Lodwar, they maintain multiple strategic hubs:\n\n• Lodwar (Headquarters): Located at the SAPCONE Complex on Kanamkemer Kambi Mpya Road.\n• Nairobi Office: Located at the Repen Complex on Syokimau-Katani Road for national donor liaison.\n• Kakuma Sub-Office: Tasked with local refugee and community interventions.\n• Lokitaung Field Office: Handles operations in remote parts of Northern Turkana.",
    },
    {
      question: "What is OpenLedger?",
      answer:
        "OpenLedger is a transparency platform that allows donors, NGOs, and the public to track humanitarian aid payments from disbursement to delivery using the Stellar blockchain.",
    },
    {
      question: "Who can use OpenLedger?",
      answer:
        "Anyone can use OpenLedger to view publicly available programme information, payment summaries, and blockchain-verified transactions. No login is required for public programme pages.",
    },
    {
      question: "Why was OpenLedger created?",
      answer:
        "OpenLedger was created to improve accountability and trust in humanitarian funding by providing real-time visibility into how aid is distributed.",
    },
  ];

  const [openItems, setOpenItems] = useState<boolean[]>(
    Array(faqs.length).fill(false),
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenItems((current) =>
      current.map((open, itemIndex) => (itemIndex === index ? !open : open)),
    );
  };

  useEffect(() => {
    if (window.location.hash === "#faq") {
      faqRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const faqItemStyle: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid #e0e0e0",
    padding: 18,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
    transition:
      "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
  };

  const questionBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  };

  const faqListStyle: React.CSSProperties = {
    maxWidth: 760,
    width: "100%",
    margin: "0 auto",
    padding: "0 16px",
  };

  const questionTextStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  };

  const answerStyle: React.CSSProperties = {
    marginTop: 14,
    whiteSpace: "pre-line",
    lineHeight: 1.65,
    color: "#333333",
  };

  const toggleButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
    width: 38,
    height: 38,
    borderRadius: 999,
    color: "#333333",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div>
      <Header />
      <main className="faq-container" ref={faqRef}>
        <div className="faq-list" style={faqListStyle}>
          {faqs.map((faq, index) => {
            const isOpen = openItems[index];
            const isHovered = hoveredIndex === index;
            const itemStyle: React.CSSProperties = {
              ...faqItemStyle,
              width: "100%",
              transform: isHovered ? "translateY(-4px) scale(1.01)" : "none",
              boxShadow: isHovered
                ? "0 10px 25px rgba(0, 0, 0, 0.14)"
                : "0 1px 4px rgba(0, 0, 0, 0.08)",
              borderColor: isHovered ? "#c5c5c5" : "#e0e0e0",
              zIndex: isHovered ? 1 : 0,
            };

            return (
              <div
                key={index}
                className="faq-item"
                style={itemStyle}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div style={questionBarStyle}>
                  <h3 className="faq-question" style={questionTextStyle}>
                    {faq.question}
                  </h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => toggleFaq(index)}
                    style={toggleButtonStyle}
                  >
                    {isOpen ? "−" : "+"}
                  </button>
                </div>
                {isOpen && (
                  <p
                    id={`faq-answer-${index}`}
                    className="faq-answer"
                    style={answerStyle}
                  >
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
