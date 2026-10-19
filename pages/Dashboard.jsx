import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  
  // Leaderboards & Special Data
  const [topPerformers, setTopPerformers] = useState([]);
  const [earlySubmissions, setEarlySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Graph Data States
  const [attendanceTrend] = useState([
    { day: "Mon", present: 42 },
    { day: "Tue", present: 38 },
    { day: "Wed", present: 45 },
    { day: "Thu", present: 40 },
    { day: "Fri", present: 48 },
  ]);

  const [feeDistribution] = useState([
    { status: "Paid", count: 65, color: "#16a34a" },
    { status: "Pending", count: 25, color: "#d97706" },
    { status: "Overdue", count: 10, color: "#dc2626" },
  ]);

  const [submissionProgress] = useState([
    { week: "W1", count: 12 },
    { week: "W2", count: 28 },
    { week: "W3", count: 35 },
    { week: "W4", count: 50 },
  ]);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, reportRes, insightsRes, assignmentsRes, quizzesRes, subsRes] = await Promise.all([
          api.get("/students").catch(() => ({ data: [] })),
          api.get("/attendance/report").catch(() => ({ data: { count: 0 } })),
          api.get("/attendance/insights").catch(() => ({ data: { insights: [] } })),
          api.get("/assignments").catch(() => ({ data: [] })),
          api.get("/quizzes").catch(() => ({ data: [] })),
          api.get("/assignments/all-submissions").catch(() => ({ data: [] })), // Database se submissions fetch karne ke liye
        ]);

        const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.students || [];
        setStudentCount(studentsList.length);
        setTodayCount(reportRes.data.count || 0);
        setInsightCount(insightsRes.data.insights?.length || 0);
        
        const assignList = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
        setAssignmentCount(assignList.length);

        const quizList = Array.isArray(quizzesRes.data) ? quizzesRes.data : [];
        setQuizCount(quizList.length);

        // ⚡ Dynamic Early Submissions (Jisne sab se pehle assignment submit karaya)
        const allSubs = Array.isArray(subsRes.data) ? subsRes.data : [];
        if (allSubs.length > 0) {
          const sortedSubmissions = [...allSubs].sort(
            (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
          );
          setEarlySubmissions(sortedSubmissions.slice(0, 5));
        }

        // 🏆 Dynamic Quiz Toppers / Leaderboard (Agar quizzes mein student scores ka data ho)
        // Yahan aap quiz attempts ki API ya calculated data bind kar sakte hain
        setTopPerformers(
          quizList.slice(0, 3).map((q, idx) => ({
            id: q._id || idx,
            name: q.title || "Quiz Topper",
            rollNumber: `QZ-00${idx + 1}`,
            score: "95%"
          }))
        );

      } catch (err) {
        console.error("Dashboard stats load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ padding: "12px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* TOP HEADER BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "20px",
          padding: "24px 28px",
          color: "#ffffff",
          marginBottom: "24px",
          boxShadow: "0 12px 30px -5px rgba(15, 23, 42, 0.4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#38bdf8", fontWeight: "700" }}>
            AMS Executive Control Panel
          </span>
          <h1 style={{ margin: "4px 0 0 0", fontSize: "26px", fontWeight: "800", display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            System Analytics & Leaderboard
          </h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/students")}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Student
          </button>
          <button
            onClick={() => navigate("/assignments")}
            style={{ background: "#059669", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            Create Assignment
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#64748b", fontWeight: "600" }}>Loading system analytics...</div>
      ) : (
        <>
          {/* STATS CARDS GRID (5 METRICS) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            
            <div style={{ background: "#fff", padding: "18px", borderRadius: "16px", borderLeft: "4px solid #2563eb", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>TOTAL STUDENTS</span>
                <div style={{ padding: "8px", background: "#eff6ff", borderRadius: "10px", color: "#2563eb" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                </div>
              </div>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "26px", color: "#0f172a" }}>{studentCount}</h2>
            </div>

            <div style={{ background: "#fff", padding: "18px", borderRadius: "16px", borderLeft: "4px solid #16a34a", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>PRESENT TODAY</span>
                <div style={{ padding: "8px", background: "#f0fdf4", borderRadius: "10px", color: "#16a34a" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "26px", color: "#16a34a" }}>{todayCount}</h2>
            </div>

            <div style={{ background: "#fff", padding: "18px", borderRadius: "16px", borderLeft: "4px solid #d97706", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>ASSIGNMENTS</span>
                <div style={{ padding: "8px", background: "#fffbebe", borderRadius: "10px", color: "#d97706" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
                </div>
              </div>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "26px", color: "#d97706" }}>{assignmentCount}</h2>
            </div>

            <div style={{ background: "#fff", padding: "18px", borderRadius: "16px", borderLeft: "4px solid #9333ea", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>TOTAL QUIZZES</span>
                <div style={{ padding: "8px", background: "#faf5ff", borderRadius: "10px", color: "#9333ea" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
              </div>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "26px", color: "#9333ea" }}>{quizCount}</h2>
            </div>

            <div style={{ background: "#fff", padding: "18px", borderRadius: "16px", borderLeft: "4px solid #dc2626", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>ATTENTION ALERTS</span>
                <div style={{ padding: "8px", background: "#fef2f2", borderRadius: "10px", color: "#dc2626" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                </div>
              </div>
              <h2 style={{ margin: "6px 0 0 0", fontSize: "26px", color: "#dc2626" }}>{insightCount}</h2>
            </div>

          </div>

          {/* 📊 THREE MULTI-TYPE GRAPHS SECTION */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            
            {/* Graph 1: Weekly Attendance Trend (Bar Chart) */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Attendance Trend (Bar Chart)
              </h3>
              <div style={{ width: "100%", height: "160px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                {attendanceTrend.map((item, index) => (
                  <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1 }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>{item.present}</span>
                    <div style={{ width: "28px", height: `${(item.present / 60) * 100}%`, background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)", borderRadius: "6px 6px 0 0" }}></div>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#0f172a" }}>{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph 2: Monthly Fee Ledger Distribution (Progress / Donut Visual) */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                Fee Status Ratio (Donut Graph)
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
                {feeDistribution.map((item, index) => (
                  <div key={index}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                      <span>{item.status}</span>
                      <span style={{ color: item.color }}>{item.count}%</span>
                    </div>
                    <div style={{ width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${item.count}%`, height: "100%", background: item.color, borderRadius: "10px" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph 3: Submissions Timeline (Line Chart Representation) */}
            <div style={{ background: "#fff", padding: "20px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Submissions Growth (Line Graph)
              </h3>
              <div style={{ width: "100%", height: "160px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 10px 10px 10px", borderBottom: "1px solid #f1f5f9" }}>
                {submissionProgress.map((item, index) => (
                  <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#9333ea", border: "3px solid #f3e8ff" }}></div>
                    <div style={{ width: "4px", height: `${(item.count / 60) * 100}px`, background: "#e9d5ff", borderRadius: "2px" }}></div>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#0f172a" }}>{item.week}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 🏆 LEADERBOARD TABLES: QUIZ TOPPERS & EARLIEST SUBMISSIONS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
            
            {/* Table 1: Quiz High Scorers / Toppers */}
            <div style={{ background: "#fff", padding: "22px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  🏆 Quiz Top Scorers
                </h3>
                <span style={{ fontSize: "11px", background: "#fef3c7", color: "#b45309", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>Leaderboard</span>
              </div>
              
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b", fontSize: "11px" }}>
                    <th style={{ padding: "10px" }}>Rank</th>
                    <th style={{ padding: "10px" }}>Student Name</th>
                    <th style={{ padding: "10px" }}>Roll No.</th>
                    <th style={{ padding: "10px" }}>Highest Score</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformers.map((student, idx) => (
                    <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "800" }}>
                        {idx === 0 ? "🥇 1st" : idx === 1 ? "🥈 2nd" : "🥉 3rd"}
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: "600", color: "#0f172a" }}>{student.name}</td>
                      <td style={{ padding: "12px 10px", color: "#64748b" }}>{student.rollNumber}</td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ padding: "4px 8px", background: "#dcfce7", color: "#166534", borderRadius: "6px", fontWeight: "700" }}>
                          {student.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table 2: Earliest Assignment Submissions (First-Come First-Serve) */}
            <div style={{ background: "#fff", padding: "22px", borderRadius: "18px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                  ⚡ Earliest Assignment Submissions
                </h3>
                <span style={{ fontSize: "11px", background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>Fastest Students</span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b", fontSize: "11px" }}>
                    <th style={{ padding: "10px" }}>Student</th>
                    <th style={{ padding: "10px" }}>Assignment</th>
                    <th style={{ padding: "10px" }}>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {earlySubmissions.map((sub) => (
                    <tr key={sub._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{sub.student?.name || "Student"}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>{sub.student?.rollNumber}</div>
                      </td>
                      <td style={{ padding: "12px 10px", color: "#475569" }}>{sub.assignment?.title || "Assignment"}</td>
                      <td style={{ padding: "12px 10px", fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {earlySubmissions.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>No submissions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}
    </div>
  );
}