import { Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/dashboard";
import "./styles.css";
import Programmes from "./pages/ProgrammeView";
import PdfExport from "./pages/PdfExport";
import { About } from "./pages/About";
import Contact from "./pages/Contact";
import { PaymentDetail } from "./pages/PaymentDetail";
import { PageShell, Container, Section } from "./components/ui/PageShell";
import { ChatWidget } from "./components/ChatWidget";
import { AccessibilityToolbar } from "./components/AccessibilityToolbar";

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
  return (
    <>
      <AccessibilityToolbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/programmes" element={<Programmes />} />
        <Route
          path="/programmes/:programmeId/payments/:referenceId"
          element={<PaymentDetailRoute />}
        />
        <Route path="/export" element={<PdfExport />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <ChatWidget />
    </>
  );
}