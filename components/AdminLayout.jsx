import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <aside className="sidebar" style={{ width: "260px", background: "#0f172a", color: "#fff", padding: "24px 16px", display: "flex", flexDirection: "column", borderRight: "1px solid #1e293b" }}>
        <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "0.5px", marginBottom: "30px", paddingLeft: "10px", color: "#38bdf8" }}>
          NWebSolution
        </div>
        
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <NavLink to="/admin" end style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            Dashboard
          </NavLink>
          
          <NavLink to="/admin/students" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            Students
          </NavLink>

          <NavLink to="/admin/scanner" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            QR Scanner
          </NavLink>

          <NavLink to="/admin/reports" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Attendance Reports
          </NavLink>

          <NavLink to="/admin/insights" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>
            AI Insights
          </NavLink>

          <NavLink to="/admin/courses" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Courses
          </NavLink>

          <NavLink to="/admin/assignmentsadmin" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            Assignment
          </NavLink>

          <NavLink to="/admin/quizzes" style={({isActive}) => ({ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px", color: isActive ? "#fff" : "#94a3b8", background: isActive ? "#2563eb" : "transparent", textDecoration: "none", fontSize: "14px", fontWeight: "600" })}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Quiz
          </NavLink>
        </nav>

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #1e293b" }}>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
            Logged in as {user?.name || "Admin"}
          </p>
          <button className="btn btn-secondary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", background: "#1e293b", color: "#f87171", border: "1px solid #334155", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }} onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content" style={{ flex: 1, padding: "24px", background: "#f8fafc", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}