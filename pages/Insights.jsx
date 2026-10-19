import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/insights")
      .then(({ data }) => setInsights(data.insights))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="top-bar">
        <h1>AI Attendance Insights</h1>
      </div>

      <div className="card">
        <p style={{ color: "#6b7280" }}>
          This automatically scans the last 14 days of attendance and flags
          students whose attendance rate has dropped below 50%, so you don't
          have to read through raw attendance tables manually.
        </p>
      </div>

      {loading ? (
        <p>Analyzing attendance data...</p>
      ) : insights.length === 0 ? (
        <div className="card">
          <p>✅ No attendance concerns right now. All active students are attending regularly.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Attendance (14 days)</th>
                <th>Risk Level</th>
                <th>Insight</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((item) => (
                <tr key={item.student.id}>
                  <td>{item.student.rollNumber}</td>
                  <td>{item.student.name}</td>
                  <td>{item.presentDays}/{item.totalDays} ({item.attendanceRate}%)</td>
                  <td><span className={`badge badge-${item.risk}`}>{item.risk}</span></td>
                  <td style={{ maxWidth: 320 }}>{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}