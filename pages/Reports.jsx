import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Auto-absent & Leave Modal States
  const [processingAbsent, setProcessingAbsent] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Load Attendance Records
  async function loadReport(selectedDate) {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/report?date=${selectedDate}`);
      setRecords(data.records || []);
    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch active students for Leave selection
  async function loadStudents() {
    try {
      const { data } = await api.get("/students"); // Adjust endpoint if needed
      setStudents(Array.isArray(data) ? data : data.students || []);
    } catch (err) {
      console.error("Failed to load students for leave setup:", err);
    }
  }

  useEffect(() => {
    loadReport(date);
    handleMarkAbsent()
  }, [date]);

  useEffect(() => {
    loadStudents();
  }, []);

  // Handler: Run Shift-Based Auto Absent
  async function handleMarkAbsent() {
    // if (!window.confirm(`Kya aap ${date} ke bache hue students ko shift timings ke mutabiq Absent mark karna chahte hain?`)) {
    //   return;
    // }

    setProcessingAbsent(true);
    try {
      const { data } = await api.post("/attendance/mark-absent", { date });
      // alert(data.message || "Absent processing complete!");
      loadReport(date); // Refresh report list
    } catch (err) {
      console.error("Auto Absent Error:", err);
      alert(err.response?.data?.message || "Failed to process absent records");
    } finally {
      setProcessingAbsent(false);
    }
  }

  // Handler: Mark Student on Leave
  async function handleMarkLeave(e) {
    e.preventDefault();
    if (!selectedStudentId) {
      alert("Khabardai: Student select karein");
      return;
    }

    setLeaveLoading(true);
    try {
      const { data } = await api.post("/attendance/leave", {
        studentId: selectedStudentId,
        date: date,
      });
      alert(data.message || "Leave marked successfully!");
      setShowLeaveModal(false);
      setSelectedStudentId("");
      loadReport(date); // Refresh list
    } catch (err) {
      console.error("Leave Mark Error:", err);
      alert(err.response?.data?.message || "Failed to mark leave");
    } finally {
      setLeaveLoading(false);
    }
  }

  // Status Counter Calculations
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const leaveCount = records.filter((r) => r.status === "leave").length;

  return (
    <div className="reports-container" style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
      <style>{`
        .reports-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .report-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .stats-pills {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .stat-pill {
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }
        .badge-present { background: #dcfce7; color: #15803d; }
        .badge-late { background: #fef3c7; color: #b45309; }
        .badge-absent { background: #fee2e2; color: #b91c1c; }
        .badge-leave { background: #e0e7ff; color: #3730a3; } /* Leave Badge */
        
        .action-btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .btn-absent { background: #ef4444; color: #fff; }
        .btn-absent:hover { background: #dc2626; }
        .btn-leave { background: #6366f1; color: #fff; }
        .btn-leave:hover { background: #4f46e5; }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-body {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* TOP HEADER & ACTION BUTTONS */}
      <div className="reports-topbar">
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Attendance Reports</h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px" }}>
            Filter, view stats and manage attendance / leaves for {date}
          </p>
        </div>

        <div className="report-controls">
          <button
            className="action-btn btn-leave"
            onClick={() => setShowLeaveModal(true)}
          >
            🏖️ Mark Student Leave
          </button>
          
          <button
            className="action-btn btn-absent"
            onClick={handleMarkAbsent}
            disabled={processingAbsent}
          >
            {processingAbsent ? "Processing..." : "⚡ Process Shift Absents"}
          </button>
        </div>
      </div>

      {/* DATE SELECTOR & STATS OVERVIEW */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
              Select Date:
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px"
              }}
            />
          </div>

          <div className="stats-pills" style={{ margin: 0, marginLeft: "auto" }}>
            <div className="stat-pill">Present: <span style={{ color: "#16a34a" }}>{presentCount}</span></div>
            <div className="stat-pill">Late: <span style={{ color: "#d97706" }}>{lateCount}</span></div>
            <div className="stat-pill">Absent: <span style={{ color: "#dc2626" }}>{absentCount}</span></div>
            <div className="stat-pill">Leave: <span style={{ color: "#4f46e5" }}>{leaveCount}</span></div>
          </div>
        </div>
      </div>

      {/* ATTENDANCE TABLE */}
      <div className="card" style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>
          Total {records.length} Record(s) for {date}
        </h3>

        {loading ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Loading attendance records...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
                  <th style={{ padding: "10px" }}>Roll No.</th>
                  <th style={{ padding: "10px" }}>Name</th>
                  <th style={{ padding: "10px" }}>Course & Shift</th>
                  <th style={{ padding: "10px" }}>Time</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "600" }}>{r.student?.rollNumber || "N/A"}</td>
                    <td style={{ padding: "12px 10px" }}>{r.student?.name || "N/A"}</td>
                    <td style={{ padding: "12px 10px" }}>
                      {r.student?.course?.name || "-"} 
                      {r.student?.timing ? <span style={{ fontSize: "11px", color: "#64748b" }}> ({r.student.timing})</span> : ""}
                    </td>
                    <td style={{ padding: "12px 10px" }}>{r.time || "--:--"}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className={`badge badge-${r.status}`} style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                      No attendance records found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MARK LEAVE MODAL */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="modal-body">
            <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Mark Student Leave</h3>
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
              Mark leave for date: <b>{date}</b>
            </p>

            <form onSubmit={handleMarkLeave}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px" }}>
                  Select Student:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="action-btn"
                  style={{ background: "#f1f5f9", color: "#475569" }}
                  onClick={() => setShowLeaveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn btn-leave"
                  disabled={leaveLoading}
                >
                  {leaveLoading ? "Saving..." : "Confirm Leave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}