import { Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard";
import "./styles.css";  
import Programmes from "./pages/ProgrammeView";
import PdfExport from "./pages/PdfExport";
import { About } from "./pages/About";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/programmes" element={<Programmes />} />
      <Route path="/export" element={<PdfExport />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}