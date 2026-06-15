import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/index.jsx";
import Home from "./components/Home/index.jsx";
import Contact from "./components/Contact/index.jsx";
import Register from "./components/Register/index.jsx";
import Login from "./components/Login/index.jsx";
import YourResumes from "./components/YourResumes/index.jsx";
import ProtectedRoute from "./components/ProtectedRoute/index.jsx";
import Builder from "./components/Builder/index.jsx";


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
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}

export default App;

