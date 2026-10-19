import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole && !(allowedRole === "admin" && user.role === "teacher")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}