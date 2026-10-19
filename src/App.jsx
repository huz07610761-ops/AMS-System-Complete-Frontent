import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
// import PublicRegister from "../pages/PublicRegister.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Students from "../pages/Students.jsx";
import Scanner from "../pages/Scanner.jsx";
import Reports from "../pages/Reports.jsx";
import Insights from "../pages/Insights.jsx";
import Courses from "../pages/Courses.jsx";
import StudentPortal from "../pages/StudentPortal.jsx";
import AdminLayout from "../components/AdminLayout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Quizzes from "../pages/Quizzes.jsx"; // admin quiz page (next step)
import AssignmentsAdmin from "../pages/AssignmentsAdmin.jsx";

export default function App() {
  return (
    <Routes>
            <Route path="/" element={<Login />} />

      {/* Student Portal */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentPortal />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="reports" element={<Reports />} />
        <Route path="insights" element={<Insights />} />
        <Route path="courses" element={<Courses />} />
        <Route path="assignmentsadmin" element={<AssignmentsAdmin />} />
        <Route path="quizzes" element={<Quizzes />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}