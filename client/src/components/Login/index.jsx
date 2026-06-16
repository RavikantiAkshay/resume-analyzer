import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("isAuthenticated");
    if (token) navigate("/your-resumes", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleGoogleCallback = async (response) => {
    const idToken = response.credential;
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        credentials: "include",
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google authentication failed.");
      localStorage.setItem("isAuthenticated", "true");
      setSuccess("Logged in successfully via Google! Redirecting...");
      setTimeout(() => navigate("/your-resumes"), 1000);
    } catch (err) {
      setError(err.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
      try {
        window.google.accounts.id.initialize({
          client_id: clientId, callback: handleGoogleCallback, cancel_on_tap_outside: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, { 
          theme: "dark", size: "large", width: 320, type: "standard", shape: "pill", text: "signin_with", logo_alignment: "left"
        });
      } catch (err) {
        console.error("Failed to render Google button:", err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        credentials: "include",
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid credentials.");
      localStorage.setItem("isAuthenticated", "true");
      setSuccess("Logged in successfully! Redirecting...");
      setFormData({ email: "", password: "" });
      setTimeout(() => navigate("/your-resumes"), 1000);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-4" id="login-page">
      <div className="bg-white rounded-xl p-8 border border-outline-variant/20 shadow-level-2 max-w-md w-full">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-4xl text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <h1 className="font-headline-lg-mobile text-[#0f172a] font-bold mb-2">Welcome Back</h1>
          <p className="font-body-md text-on-surface-variant">Sign in to your account to review resumes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label-md text-primary mb-1">Email Address</label>
            <input type="email" name="email" className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors" placeholder="you@example.com" value={formData.email} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label className="block font-label-md text-primary mb-1">Password</label>
            <input type="password" name="password" className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors" placeholder="Enter your password" value={formData.password} onChange={handleChange} disabled={loading} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#0f172a] hover:bg-[#00687a] text-white font-label-md px-6 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Log In"}
          </button>
        </form>

        {error && <div className="mt-4 p-3 bg-error-container text-error rounded-lg text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span>{error}</div>}
        {success && <div className="mt-4 p-3 bg-[#eff6ff] text-[#3b82f6] rounded-lg text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span>{success}</div>}

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-outline-variant/30"></div>
          <span className="px-3 font-caption text-on-surface-variant">or</span>
          <div className="flex-1 border-t border-outline-variant/30"></div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div ref={googleBtnRef}></div>
          {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") && (
            <p className="text-[10px] text-error mt-2 text-center">* Configure VITE_GOOGLE_CLIENT_ID in your client .env to enable Google Sign-In.</p>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="font-body-md text-on-surface-variant">
            Don't have an account? <Link to="/register" className="text-secondary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
