import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function AssignmentsAdmin() {
  const [assignments, setAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      const { data } = await api.get("/assignments");
      setAssignments(data);
    } catch (err) {
      console.error("Error loading assignments");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/assignments/${editId}`, form);
        alert("Assignment updated successfully!");
      } else {
        await api.post("/assignments", form);
        alert("Assignment created successfully!");
      }
      setForm({ title: "", description: "", deadline: "" });
      setEditId(null);
      setShowForm(false);
      loadAssignments();
    } catch (err) {
      alert("Operation failed");
    }
  }

  async function viewSubmissions(assignmentId) {
    try {
      const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
      setSubmissions(data);
      setSubmissionsModal(assignmentId);
    } catch (err) {
      alert("Failed to load submissions");
    }
  }

  // Handle Approve or Reject
  async function handleStatusChange(subId, status) {
    try {
      await api.put(`/assignments/submissions/${subId}/status`, { status });
      // Refresh submissions list inside modal
      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === subId ? { ...sub, status } : sub))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Assignments Management</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ title: "", description: "", deadline: "" }); }} className="btn">
          {showForm ? "Cancel" : "+ Create Assignment"}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "20px", background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <h3>{editId ? "Edit Assignment" : "New Assignment"}</h3>
          <form onSubmit={handleSubmit}>
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
            
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ width: "100%", marginBottom: "10px", padding: "8px" }} />
            
            <label>Deadline</label>
            <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required style={{ width: "100%", marginBottom: "15px", padding: "8px" }} />
            
            <button type="submit" className="btn" style={{ background: "#16a34a", color: "#fff" }}>{editId ? "Update" : "Publish"}</button>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="card" style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a._id} style={{ borderBottom: "1px solid #eee" }}>
                <td><b>{a.title}</b></td>
                <td>{new Date(a.deadline).toLocaleString()}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => viewSubmissions(a._id)} style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    View Submissions
                  </button>
                  <button onClick={() => { setShowForm(true); setEditId(a._id); setForm({ title: a.title, description: a.description, deadline: a.deadline.slice(0,16) }); }} style={{ padding: "6px 12px", background: "#d97706", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submissions Modal with Approve / Reject */}
      {submissionsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "700px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>Submitted Students</h3>
            {submissions.length === 0 ? <p style={{ padding: "20px 0", color: "#64748b" }}>Koi submission nahi aayi.</p> : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Link</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td><b>{sub.student?.name}</b><br/><span style={{fontSize: "11px", color: "#64748b"}}>{sub.student?.rollNumber}</span></td>
                      <td><a href={sub.link} target="_blank" rel="noreferrer" style={{color: "#2563eb"}}>Open Link</a></td>
                      <td>
                        <span style={{
                          padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600",
                          background: sub.status === "approved" ? "#dcfce7" : sub.status === "rejected" ? "#fee2e2" : "#fef9c3",
                          color: sub.status === "approved" ? "#166534" : sub.status === "rejected" ? "#b91c1c" : "#854d0e"
                        }}>
                          {sub.status || "pending"}
                        </span>
                      </td>
                      <td style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => handleStatusChange(sub._id, "approved")}
                          style={{ padding: "4px 8px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusChange(sub._id, "rejected")}
                          style={{ padding: "4px 8px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={() => setSubmissionsModal(null)} style={{ marginTop: "16px", padding: "8px 16px", background: "#64748b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}