import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./index.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("isAuthenticated");
    setIsLoggedIn(!!token);
  }, [location]);

  if (location.pathname === "/your-resumes" || location.pathname === "/builder") {
    return null; // Dashboard has its own nav
  }

  const handleLogout = async () => {
    try { await fetch("http://localhost:5000/auth/logout", { method: "POST", credentials: "include" }); } catch (err) {}
    localStorage.removeItem("isAuthenticated");
    setIsLoggedIn(false);
    setMobileOpen(false);
    navigate("/");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm w-full sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-gutter py-sm max-w-container-max mx-auto">
        <Link to="/" className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface tracking-tight" onClick={closeMobile}>
          ResumeAI
        </Link>
        <div className="hidden md:flex space-x-lg items-center">
          <Link to="/" className={`font-body-md text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}>Home</Link>
          {isLoggedIn && (
            <Link to="/your-resumes" className={`font-body-md text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg ${location.pathname === '/your-resumes' ? 'text-primary font-medium' : ''}`}>Dashboard</Link>
          )}
          <Link to="/contact" className={`font-body-md text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg ${location.pathname === '/contact' ? 'text-primary font-medium' : ''}`}>Contact</Link>
          {!isLoggedIn && (
            <Link to="/login" className="font-body-md text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors px-3 py-2 rounded-lg">Login</Link>
          )}
        </div>
        
        <div className="hidden md:block">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="font-label-md text-label-md bg-[#0f172a] hover:bg-[#00687a] text-white px-6 py-2.5 rounded-lg transition-colors active:scale-95 duration-200">
              Logout
            </button>
          ) : (
            <Link to="/register" className="font-label-md text-label-md bg-[#0f172a] hover:bg-[#00687a] text-white px-6 py-2.5 rounded-lg transition-colors active:scale-95 duration-200 inline-block">
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-on-surface p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/30 absolute top-full left-0 w-full p-4 flex flex-col space-y-4 shadow-lg">
          <Link to="/" className="font-body-md text-body-md text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low" onClick={closeMobile}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/your-resumes" className="font-body-md text-body-md text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low" onClick={closeMobile}>Dashboard</Link>
              <Link to="/contact" className="font-body-md text-body-md text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low" onClick={closeMobile}>Contact</Link>
              <button onClick={handleLogout} className="font-label-md text-label-md bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-center w-full mt-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/contact" className="font-body-md text-body-md text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low" onClick={closeMobile}>Contact</Link>
              <Link to="/login" className="font-body-md text-body-md text-on-surface-variant hover:text-primary p-2 rounded-lg hover:bg-surface-container-low" onClick={closeMobile}>Login</Link>
              <Link to="/register" className="font-label-md text-label-md bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-center w-full mt-2" onClick={closeMobile}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
