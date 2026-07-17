import { Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/dashboard";
import "./styles.css";
import Programmes from "./pages/ProgrammeView";
import { ProgrammeDetailPage } from "./pages/ProgrammeDetailPage";
import PdfExport from "./pages/PdfExport";
import { About } from "./pages/About";
import Contact from "./pages/Contact";
import { PaymentDetail } from "./pages/PaymentDetail";
import { LegalPage } from "./pages/LegalPage";
import { PageShell, Container, Section } from "./components/ui/PageShell";
import { ChatSidebar } from "./components/ChatSidebar";
import { AccessibilityToolbar } from "./components/AccessibilityToolbar";
import { useChatContext } from "./contexts/ChatContext";

function PaymentDetailRoute() {
  const { programmeId, referenceId } = useParams();
  if (!programmeId || !referenceId) return null;
  return (
    <PageShell>
      <Section>
        <Container size="narrow">
          <PaymentDetail programmeId={programmeId} referenceId={referenceId} />
        </Container>
      </Section>
    </PageShell>
  );
}

export default function App() {
  const { chatOpen, setChatOpen } = useChatContext();

  return (
    <>
      <AccessibilityToolbar />

      {/* Main content area — shifts left on desktop when chat is open */}
      <div
        style={{
          transition: "margin-right 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          marginRight: chatOpen ? undefined : undefined,
        }}
        className={chatOpen ? "sm:mr-80" : ""}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/programmes/:programmeId" element={<ProgrammeDetailPage />} />
          <Route
            path="/programmes/:programmeId/payments/:referenceId"
            element={<PaymentDetailRoute />}
          />
          <Route path="/export" element={<PdfExport />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Legal pages */}
          <Route path="/privacy" element={<LegalPage title="Privacy Policy" />} />
          <Route path="/terms" element={<LegalPage title="Terms of Service" />} />
          <Route path="/audit" element={<LegalPage title="Audit Disclosure" />} />
        </Routes>
      </div>

      {/* Chat sidebar — fixed right panel, full height */}
      <ChatSidebar open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
