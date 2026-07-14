import { Routes, Route } from "react-router-dom";
import Home from "./pages/dashboard";
import "./styles.css";  
import Programmes from "./pages/ProgrammeView";
import About from "./pages/about";
// import Contact from "./pages/Contact";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/programmes" element={<Programmes />} />
      <Route path="/about" element={<About />} />
      {/* <Route path="/contact" element={<Contact />} /> */} */
    </Routes>
  );
}