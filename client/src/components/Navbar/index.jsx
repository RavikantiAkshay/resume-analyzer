import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/your-resumes", label: "Analyze" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`} id="main-navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMobile}>
          <span className="navbar__logo-icon">◈</span>
          <span className="navbar__logo-text">ResumeAI</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? "navbar__link--active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar__auth">
          {isLoggedIn ? (
            <button className="navbar__auth-btn navbar__auth-btn--logout" onClick={handleLogout} id="logout-btn">
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar__auth-btn navbar__auth-btn--login" id="login-btn">
                Log in
              </Link>
              <Link to="/register" className="navbar__auth-btn navbar__auth-btn--register btn btn-primary" id="register-btn">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`navbar__hamburger ${mobileOpen ? "navbar__hamburger--open" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${mobileOpen ? "navbar__mobile--open" : ""}`}>
        <ul className="navbar__mobile-links">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar__mobile-link ${location.pathname === link.path ? "navbar__mobile-link--active" : ""}`}
                onClick={closeMobile}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-auth">
          {isLoggedIn ? (
            <button className="btn btn-secondary" onClick={handleLogout} style={{ width: "100%" }}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={closeMobile} style={{ width: "100%" }}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobile} style={{ width: "100%" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
