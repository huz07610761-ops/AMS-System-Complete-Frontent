import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Dashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [studentsRes, reportRes, insightsRes] = await Promise.all([
          api.get("/students"),
          api.get("/attendance/report"),
          api.get("/attendance/insights"),
        ]);
        setStudentCount(studentsRes.data.length);
        setTodayCount(reportRes.data.count);
        setInsightCount(insightsRes.data.insights.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="top-bar">
        <h1>Dashboard</h1>
      </div>

      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className="grid grid-3">
          <div className="stat-card" style={{ borderLeftColor: "#2563eb" }}>
            <h3>{studentCount}</h3>
            <p>Total Students</p>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#16a34a" }}>
            <h3>{todayCount}</h3>
            <p>Present Today</p>
          </div>
          <div className="stat-card" style={{ borderLeftColor: "#dc2626" }}>
            <h3>{insightCount}</h3>
            <p>Students Needing Attention (AI Insight)</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Quick Guide</h3>
        <p style={{ marginTop: 10, color: "#4b5563", lineHeight: 1.6 }}>
          Use the <b>Students</b> tab to add new students - each one automatically
          gets a unique QR code. Use the <b>QR Scanner</b> tab every morning to
          mark attendance by scanning student QR codes. Check <b>AI Insights</b>{" "}
          weekly to see which students need follow-up due to low attendance.
        </p>
      </div>
    </div>
  );
}