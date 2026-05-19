import { Routes, Route } from "react-router-dom";

// Page placeholders — will be replaced with real components
const Home = () => <div className="page"><h1>Home</h1></div>;
const Register = () => <div className="page"><h1>Register</h1></div>;
const Login = () => <div className="page"><h1>Login</h1></div>;
const YourResumes = () => <div className="page"><h1>Your Resumes</h1></div>;
const Contact = () => <div className="page"><h1>Contact</h1></div>;

function App() {
  return (
    <div className="app">
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
