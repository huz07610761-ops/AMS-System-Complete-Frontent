import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import QuizPlayer from "../components/QuizPlayer.jsx";

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState(null); // Fixed ReferenceError
  const [mode, setMode] = useState("submit");
  const [loading, setLoading] = useState(false);

  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [attPage, setAttPage] = useState(1);
  const attPerPage = 10;
  const [attDateFilter, setAttDateFilter] = useState("");

  const [quizPage, setQuizPage] = useState(1);
  const quizPerPage = 5;
  const [quizStatusFilter, setQuizStatusFilter] = useState("all");

  const [paymentPage, setPaymentPage] = useState(1);
  const paymentPerPage = 5;

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  function handleOpenForm(assignment, formMode) {
    setActiveAssignmentId(assignment._id);
    setMode(formMode);

    const existingSub = mySubmissions.find((s) => (s.assignment?._id || s.assignment) === assignment._id);
    if (formMode === "edit" && existingSub) {
      setLink(existingSub.link || "");
      setDescription(existingSub.description || "");
      setImage(existingSub.image || "");
    } else {
      setLink("");
      setDescription("");
      setImage("");
    }
  }

  async function handleAssignmentSubmit(e, assignmentId) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/assignments/${assignmentId}/submit`, {
        studentId: user?._id || user?.id,
        link,
        description,
        image,
      });
      alert("Assignment successfully submit ho gaya hai!");
      setActiveAssignmentId(null);
      setLink("");
      setDescription("");
      setImage("");
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Submission fail ho gaya");
    } finally {
      setSubmitting(false);
    }
  }

  function loadAll() {
    Promise.all([
      api
        .get("/attendance/me")
        .then(({ data }) => setRecords(Array.isArray(data) ? data : []))
        .catch(console.error),
      api
        .get("/quizzes/my")
        .then(({ data }) => setQuizzes(Array.isArray(data) ? data : []))
        .catch(console.error),
      api
        .get("/assignments")
        .then(({ data }) => setAssignments(Array.isArray(data) ? data : []))
        .catch(console.error),
      api
        .get("/assignments/my-submissions")
        .then(({ data }) => setMySubmissions(Array.isArray(data) ? data : []))
        .catch(() => setMySubmissions([])),
    ]);
  }

  useEffect(() => {
    loadAll();
    api.get("/students/me").catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleQuizClosed() {
    setActiveQuizId(null);
    api
      .get("/quizzes/my")
      .then(({ data }) => setQuizzes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }

  const presentCount = records.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const pendingQuizzesCount = quizzes.filter(
    (q) => q.status === "not-started" || q.status === "in-progress" || !q.status
  ).length;

  const filteredAttendance = records.filter((r) => {
    if (!attDateFilter) return true;
    return r.date === attDateFilter;
  });
  const totalAttPages = Math.ceil(filteredAttendance.length / attPerPage) || 1;
  const paginatedAttendance = filteredAttendance.slice(
    (attPage - 1) * attPerPage,
    attPage * attPerPage
  );

  const filteredQuizzes = quizzes.filter((q) => {
    if (quizStatusFilter === "all") return true;
    return q.status === quizStatusFilter;
  });
  const totalQuizPages = Math.ceil(filteredQuizzes.length / quizPerPage) || 1;
  const paginatedQuizzes = filteredQuizzes.slice(
    (quizPage - 1) * quizPerPage,
    quizPage * quizPerPage
  );

  const paymentHistory = [
    { id: 1, month: "Current Month", status: user?.feeStatus || "pending", date: new Date().toISOString().split("T")[0], amount: "$150" }
  ];
  const totalPaymentPages = Math.ceil(paymentHistory.length / paymentPerPage) || 1;
  const paginatedPayments = paymentHistory.slice(
    (paymentPage - 1) * paymentPerPage,
    paymentPage * paymentPerPage
  );

  return (
    <div className="sp-wrapper">
      <style>{`
        :root {
          --sp-bg: #f8fafc;
          --sp-card-bg: #ffffff;
          --sp-text-main: #0f172a;
          --sp-text-muted: #64748b;
          --sp-border: #e2e8f0;
          --sp-primary: #3b82f6;
          --sp-primary-hover: #2563eb;
          --sp-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05);
        }

        .sp-wrapper {
          min-height: 100vh;
          background-color: var(--sp-bg);
          color: var(--sp-text-main);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          padding: 24px;
        }

        .sp-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .sp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--sp-card-bg);
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid var(--sp-border);
          box-shadow: var(--sp-shadow);
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sp-user-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .sp-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }

        .sp-nav-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          margin-bottom: 24px;
          overflow-x: auto;
        }

        .sp-tab-btn {
          padding: 10px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--sp-text-muted);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .sp-tab-btn.active {
          background: #ffffff;
          color: var(--sp-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .sp-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .sp-stat-card {
          background: var(--sp-card-bg);
          padding: 20px;
          border-radius: 14px;
          border: 1px solid var(--sp-border);
          box-shadow: var(--sp-shadow);
        }

        .sp-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--sp-text-muted);
        }

        .sp-stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--sp-text-main);
          margin: 10px 0 4px 0;
        }

        .sp-card {
          background: var(--sp-card-bg);
          border-radius: 16px;
          border: 1px solid var(--sp-border);
          box-shadow: var(--sp-shadow);
          padding: 24px;
          margin-bottom: 24px;
        }

        .sp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sp-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .sp-table th {
          padding: 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--sp-text-muted);
          border-bottom: 1px solid var(--sp-border);
          text-transform: uppercase;
        }

        .sp-table td {
          padding: 14px 12px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }

        .sp-pagination {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }

        .sp-page-btn {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--sp-border);
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .sp-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sp-page-info {
          font-size: 12px;
          color: var(--sp-text-muted);
          margin: 0 8px;
        }

        .sp-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .sp-badge-present, .sp-badge-paid { background: #dcfce7; color: #15803d; }
        .sp-badge-late, .sp-badge-pending { background: #fef3c7; color: #b45309; }
        .sp-badge-absent, .sp-badge-unpaid, .sp-badge-overdue { background: #fee2e2; color: #b91c1c; }

        .sp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .sp-btn-primary { background: var(--sp-primary); color: #fff; }
        .sp-btn-primary:hover { background: var(--sp-primary-hover); }
        .sp-btn-logout { background: #f1f5f9; color: #475569; border: 1px solid var(--sp-border); }

        .sp-grid-2 {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .sp-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-container">
        <header className="sp-header">
          <div className="sp-user-info">
            <div className="sp-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--sp-text-muted)" }}>
                Roll No: {user?.rollNumber || "N/A"} | Course: {user?.course?.name || "Not assigned"}
              </p>
            </div>
          </div>
          <button className="sp-btn sp-btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </header>

        <div className="sp-nav-tabs">
          <button
            className={`sp-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard Overview
          </button>
          <button
            className={`sp-tab-btn ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            📅 Attendance History
          </button>
          <button
            className={`sp-tab-btn ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            💳 Payment & Fee
          </button>
          <button
            className={`sp-tab-btn ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            📝 Quizzes ({quizzes.length})
          </button>
          <button
            className={`sp-tab-btn ${activeTab === "assignment" ? "active" : ""}`}
            onClick={() => setActiveTab("assignment")}
          >
            📁 Assignments ({assignments.length})
          </button>
        </div>

        {activeTab === "assignment" && (
          <div className="sp-card">
            <div className="sp-card-header">
              <h3>Assigned Assignments</h3>
            </div>
            {assignments.length === 0 ? (
              <p style={{ color: "var(--sp-text-muted)", textAlign: "center", padding: "20px" }}>No assignments available.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {assignments.map((assignment) => {
                  const isExpired = new Date() > new Date(assignment.deadline);
                  const existingSub = mySubmissions.find((s) => (s.assignment?._id || s.assignment) === assignment._id);
                  const hasSubmitted = !!existingSub;
                  const isFormOpen = activeAssignmentId === assignment._id;

                  return (
                    <div key={assignment._id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid var(--sp-border)" }}>
                      <h4 style={{ margin: "0 0 6px 0" }}>{assignment.title}</h4>
                      <p style={{ color: "var(--sp-text-muted)", fontSize: "13px", margin: "0 0 8px 0" }}>{assignment.description}</p>
                      <p style={{ fontSize: "12px", color: isExpired ? "#dc2626" : "#16a34a", marginBottom: "12px" }}>
                        <b>Deadline:</b> {new Date(assignment.deadline).toLocaleString()} {isExpired ? "(Expired)" : ""}
                        {hasSubmitted && <span style={{ marginLeft: "10px", color: "#166534", fontWeight: "600" }}>✔ Status: Submitted ({existingSub.status || "pending"})</span>}
                      </p>

                      {!isFormOpen && !isExpired && (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            className="sp-btn"
                            style={{
                              background: hasSubmitted ? "#cbd5e1" : "#2563eb",
                              color: "#fff",
                              cursor: hasSubmitted ? "not-allowed" : "pointer"
                            }}
                            disabled={hasSubmitted}
                            onClick={() => handleOpenForm(assignment, "submit")}
                          >
                            Submit Assignment
                          </button>

                          <button
                            className="sp-btn"
                            style={{
                              background: !hasSubmitted ? "#cbd5e1" : "#d97706",
                              color: "#fff",
                              cursor: !hasSubmitted ? "not-allowed" : "pointer"
                            }}
                            disabled={!hasSubmitted}
                            onClick={() => handleOpenForm(assignment, "edit")}
                          >
                            Edit Assignment
                          </button>
                        </div>
                      )}

                      {isFormOpen && !isExpired && (
                        <form onSubmit={(e) => handleAssignmentSubmit(e, assignment._id)} style={{ marginTop: "12px", background: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid var(--sp-border)" }}>
                          <h4 style={{ margin: "0 0 10px 0", color: "#1e293b" }}>{mode === "edit" ? "Edit Your Submission" : "New Submission"}</h4>
                          
                          <label style={{ fontSize: "12px", fontWeight: "600" }}>GitHub / Live Link</label>
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://github.com/..."
                            required
                            style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px", border: "1px solid var(--sp-border)" }}
                          />

                          <label style={{ fontSize: "12px", fontWeight: "600" }}>Description / Notes</label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Aapka message..."
                            style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "6px", border: "1px solid var(--sp-border)" }}
                          />

                          <label style={{ fontSize: "12px", fontWeight: "600" }}>Optional Screenshot / Image</label>
                          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: "12px", display: "block" }} />

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button type="submit" disabled={submitting} className="sp-btn sp-btn-primary">
                              {submitting ? "Processing..." : mode === "edit" ? "Update Submission" : "Confirm Submit"}
                            </button>
                            <button type="button" className="sp-btn sp-btn-logout" onClick={() => setActiveAssignmentId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            <div className="sp-stats-grid">
              <div className="sp-stat-card">
                <div className="sp-stat-header"><span>Days Present</span> 🟢</div>
                <div className="sp-stat-value">{loading ? "..." : presentCount}</div>
                <div style={{ fontSize: "12px", color: "var(--sp-text-muted)" }}>Total marked attendance</div>
              </div>

              <div className="sp-stat-card">
                <div className="sp-stat-header"><span>Days Absent</span> 🔴</div>
                <div className="sp-stat-value">{loading ? "..." : absentCount}</div>
                <div style={{ fontSize: "12px", color: "var(--sp-text-muted)" }}>Unmarked / missed days</div>
              </div>

              <div className="sp-stat-card">
                <div className="sp-stat-header"><span>Pending Quizzes</span> 📝</div>
                <div className="sp-stat-value">{loading ? "..." : pendingQuizzesCount}</div>
                <div style={{ fontSize: "12px", color: "var(--sp-text-muted)" }}>Required submissions</div>
              </div>

              <div className="sp-stat-card">
                <div className="sp-stat-header"><span>Fee Status</span> 💳</div>
                <div className="sp-stat-value" style={{ fontSize: "20px" }}>
                  <span className={`sp-badge sp-badge-${user?.feeStatus || "pending"}`}>
                    {user?.feeStatus || "pending"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--sp-text-muted)" }}>Current account state</div>
              </div>
            </div>

            <div className="sp-grid-2">
              <div className="sp-card" style={{ textAlign: "center" }}>
                <h3 style={{ marginBottom: "16px" }}>Digital Pass & QR</h3>
                {user?.qrImage ? (
                  <img src={user.qrImage} alt="QR Code" style={{ maxWidth: "160px", marginBottom: "16px", borderRadius: "8px", border: "1px dashed #cbd5e1", padding: "8px" }} />
                ) : (
                  <p style={{ color: "var(--sp-text-muted)", padding: "30px 0" }}>QR Code Unavailable</p>
                )}
                <div style={{ textAlign: "left", background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px" }}>
                  <p style={{ margin: "4px 0" }}><b>Timing:</b> {user?.timing || "Not specified"}</p>
                  <p style={{ margin: "4px 0" }}><b>Course:</b> {user?.course?.name || "N/A"}</p>
                </div>
              </div>

              <div className="sp-card">
                <h3 style={{ marginBottom: "16px" }}>Recent Activity & Quick Links</h3>
                <p style={{ fontSize: "13px", color: "var(--sp-text-muted)", marginBottom: "16px" }}>
                  Aapke paas {pendingQuizzesCount} active quizzes pending hain.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button className="sp-btn sp-btn-primary" onClick={() => setActiveTab("attendance")}>
                    View Detailed Attendance ➔
                  </button>
                  <button className="sp-btn sp-btn-primary" onClick={() => setActiveTab("assignment")}>
                    View Assignments ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="sp-card">
            <div className="sp-card-header">
              <h3>Attendance History ({filteredAttendance.length} records)</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--sp-text-muted)" }}>Filter Date:</label>
                <input
                  type="date"
                  value={attDateFilter}
                  onChange={(e) => {
                    setAttDateFilter(e.target.value);
                    setAttPage(1);
                  }}
                  style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--sp-border)", fontSize: "13px" }}
                />
                {attDateFilter && (
                  <button className="sp-page-btn" onClick={() => setAttDateFilter("")}>Clear</button>
                )}
              </div>
            </div>

            <div>
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAttendance.map((r) => (
                    <tr key={r._id || r.date}>
                      <td><b>{r.date}</b></td>
                      <td>{r.time || "--:--"}</td>
                      <td>
                        <span className={`sp-badge sp-badge-${r.status}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedAttendance.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "30px", color: "var(--sp-text-muted)" }}>
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="sp-pagination">
                <button
                  className="sp-page-btn"
                  onClick={() => setAttPage((p) => Math.max(p - 1, 1))}
                  disabled={attPage === 1}
                >
                  Previous
                </button>
                <span className="sp-page-info">
                  Page {attPage} of {totalAttPages || 1}
                </span>
                <button
                  className="sp-page-btn"
                  onClick={() => setAttPage((p) => Math.min(p + 1, totalAttPages))}
                  disabled={attPage >= totalAttPages}
                >
                  Next 10
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="sp-card">
            <div className="sp-card-header">
              <h3>Payment & Fee Ledger</h3>
            </div>

            <table className="sp-table">
              <thead>
                <tr>
                  <th>Billing Cycle / Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Recorded Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.month}</b></td>
                    <td>{p.amount}</td>
                    <td>
                      <span className={`sp-badge sp-badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="sp-pagination">
              <button
                className="sp-page-btn"
                onClick={() => setPaymentPage((p) => Math.max(p - 1, 1))}
                disabled={paymentPage === 1}
              >
                Previous
              </button>
              <span className="sp-page-info">
                Page {paymentPage} of {totalPaymentPages || 1}
              </span>
              <button
                className="sp-page-btn"
                onClick={() => setPaymentPage((p) => Math.min(p + 1, totalPaymentPages))}
                disabled={paymentPage >= totalPaymentPages}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="sp-card">
            <div className="sp-card-header">
              <h3>Assigned Quizzes ({filteredQuizzes.length})</h3>
              <select
                value={quizStatusFilter}
                onChange={(e) => {
                  setQuizStatusFilter(e.target.value);
                  setQuizPage(1);
                }}
                style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--sp-border)", fontSize: "13px" }}
              >
                <option value="all">All Quizzes</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {filteredQuizzes.length === 0 ? (
              <p style={{ textAlign: "center", padding: "30px", color: "var(--sp-text-muted)" }}>No quizzes found.</p>
            ) : (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {paginatedQuizzes.map((q) => {
                    const quizId = q.id || q._id;
                    return (
                      <div key={quizId || q.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--sp-border)" }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{q.title}</div>
                          <div style={{ fontSize: "12px", color: "var(--sp-text-muted)", marginTop: "4px" }}>
                            {q.totalQuestions || q.questions?.length || 0} questions
                            {q.status === "completed" && <span style={{ color: "#16a34a", marginLeft: "8px" }}>• Score: <b>{q.percentage}%</b></span>}
                          </div>
                        </div>
                        <button
                          className={`sp-btn ${q.status === "completed" ? "sp-btn-disabled" : "sp-btn-primary"}`}
                          onClick={() => setActiveQuizId(String(quizId))}
                          disabled={q.status === "completed" || q.status === "failed"}
                        >
                          {q.status === "completed" ? "Completed" : "Start Quiz"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="sp-pagination">
                  <button
                    className="sp-page-btn"
                    onClick={() => setQuizPage((p) => Math.max(p - 1, 1))}
                    disabled={quizPage === 1}
                  >
                    Previous
                  </button>
                  <span className="sp-page-info">
                    Page {quizPage} of {totalQuizPages || 1}
                  </span>
                  <button
                    className="sp-page-btn"
                    onClick={() => setQuizPage((p) => Math.min(p + 1, totalQuizPages))}
                    disabled={quizPage >= totalQuizPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeQuizId && (
          <QuizPlayer
            quizId={activeQuizId}
            onClose={handleQuizClosed}
            onSubmitSuccess={() => {}}
          />
        )}
      </div>
    </div>
  );
}