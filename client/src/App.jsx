import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/index.jsx";
import Home from "./components/Home/index.jsx";
import Contact from "./components/Contact/index.jsx";

// Placeholder pages — will be built in the Authentication phase
const Register = () => (
  <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "var(--nav-height)" }}>
    <h1 style={{ color: "var(--text-primary)", fontSize: "var(--font-3xl)", fontWeight: 700 }}>Register</h1>
  </main>
);

const Login = () => (
  <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "var(--nav-height)" }}>
    <h1 style={{ color: "var(--text-primary)", fontSize: "var(--font-3xl)", fontWeight: 700 }}>Login</h1>
  </main>
);

const YourResumes = () => (
  <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "var(--nav-height)" }}>
    <h1 style={{ color: "var(--text-primary)", fontSize: "var(--font-3xl)", fontWeight: 700 }}>Your Resumes</h1>
  </main>
);

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/your-resumes" element={<YourResumes />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;
