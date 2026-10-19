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
    <div className="app-shell">
      <aside className="sidebar">
        <h2>NWebSolution</h2>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/students">Students</NavLink>
        <NavLink to="/admin/scanner">QR Scanner</NavLink>
        <NavLink to="/admin/reports">Attendance Reports</NavLink>
        <NavLink to="/admin/insights">AI Insights</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <NavLink to="/admin/assignmentsadmin">Assignment</NavLink>
        <NavLink to="/admin/quizzes">Quiz</NavLink>
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
            Logged in as {user?.name}
          </p>
          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}