import { Navigate } from "react-router-dom";

/**
 * Route guard component to protect private frontend routes
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect unauthorized users to login, replacing history entry
    return <Navigate to="/login" replace />;
  }

  // Render children if token exists
  return children;
};

export default ProtectedRoute;
