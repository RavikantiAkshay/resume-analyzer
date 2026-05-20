import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:5000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when the user types
    if (error) setError("");
  };

  const handleGoogleCallback = async (response) => {
    const idToken = response.credential;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google authentication failed.");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      
      setSuccess("Logged in successfully via Google! Redirecting...");
      
      // Navigate to /your-resumes after 1 second
      setTimeout(() => {
        navigate("/your-resumes");
      }, 1000);

    } catch (err) {
      setError(err.message || "An unexpected error occurred during Google Sign-In.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if Google script is loaded
    if (window.google) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(
          googleBtnRef.current,
          { 
            theme: "dark", 
            size: "large", 
            width: 320, 
            type: "standard",
            shape: "pill",
            text: "signin_with", 
            logo_alignment: "left"
          }
        );
      } catch (err) {
        console.error("Failed to render Google button:", err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      
      setSuccess("Logged in successfully! Redirecting...");
      setFormData({ email: "", password: "" });

      // Navigate to /your-resumes after 1 second
      setTimeout(() => {
        navigate("/your-resumes");
      }, 1000);

    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page animate-fade-in" id="login-page">
      <div className="auth-container">
        <div className="card auth-card animate-slide-up">
          <div className="auth-header">
            <span className="auth-icon">◈</span>
            <h1 className="heading-md auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account to review resumes</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email-input" className="form-label">Email Address</label>
              <input
                type="email"
                id="email-input"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password-input" className="form-label">Password</label>
              <input
                type="password"
                id="password-input"
                name="password"
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Feedback Banners (Monochrome) */}
          {error && (
            <div className="auth-message auth-message--error" id="login-error" style={{ marginTop: "1.5rem" }}>
              <span className="message-bullet">✦</span> {error}
            </div>
          )}
          {success && (
            <div className="auth-message auth-message--success" id="login-success" style={{ marginTop: "1.5rem" }}>
              <span className="message-bullet">✦</span> {success}
            </div>
          )}

          {/* Google Auth Divider & Button */}
          <div className="auth-separator">
            <span className="auth-separator__line"></span>
            <span className="auth-separator__text">or</span>
            <span className="auth-separator__line"></span>
          </div>

          <div className="google-auth-container">
            <div ref={googleBtnRef} id="google-signin-btn"></div>
            {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") && (
              <p className="google-config-warning">
                * Configure VITE_GOOGLE_CLIENT_ID in your client .env to enable Google Sign-In.
              </p>
            )}
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
