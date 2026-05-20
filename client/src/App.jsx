import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/index.jsx";
import Home from "./components/Home/index.jsx";
import Contact from "./components/Contact/index.jsx";
import Register from "./components/Register/index.jsx";
import Login from "./components/Login/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute/index.jsx";

// Temporary placeholder for YourResumes page - to be implemented in the next phase
const YourResumes = () => (
  <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "var(--nav-height)" }}>
    <h1 style={{ color: "var(--text-primary)", fontSize: "var(--font-3xl)", fontWeight: 700, marginBottom: "var(--space-md)" }}>Resume Analyzer Dashboard</h1>
    <p style={{ color: "var(--text-muted)", fontSize: "var(--font-base)" }}>This dashboard will be unlocked and completed in the next phase.</p>
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
        <Route
          path="/your-resumes"
          element={
            <ProtectedRoute>
              <YourResumes />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;

