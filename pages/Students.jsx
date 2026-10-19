import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [qrPreview, setQrPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterFee, setFilterFee] = useState("all");

  // Calendar / Month Selector State (Format: YYYY-MM)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    phone: "",
    course: "",
  });

  async function loadData() {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get("/students"),
        api.get("/courses"),
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data.students || []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.courses || []);
    } catch (err) {
      setError("Failed to load students");
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/students", form);
      setSuccess(`Student "${data.student?.name || form.name}" added successfully!`);
      setForm({ name: "", email: "", password: "", rollNumber: "", phone: "", course: "" });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add student");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete ${name}? This also removes their attendance history.`)) return;
    try {
      await api.delete(`/students/${id}`);
      loadData();
    } catch (err) {
      setError("Failed to delete student");
    }
  }

  // Helper to get fee status for the currently selected month from feeHistory array
  function getMonthFeeStatus(student) {
    if (!student.feeHistory || !Array.isArray(student.feeHistory)) {
      return student.feeStatus || "pending";
    }
    const record = student.feeHistory.find((h) => h.month === selectedMonth);
    return record ? record.status : "pending";
  }

  // Update Fee Status for the Selected Month
  async function updateMonthlyFeeStatus(id, newStatus) {
    setError("");
    setSuccess("");
    try {
      await api.put(`/students/${id}/fee`, {
        month: selectedMonth,
        status: newStatus,
      });
      setSuccess(`Fee status for ${selectedMonth} updated to "${newStatus}"`);
      loadData();
    } catch (err) {
      // Fallback if specific route doesn't exist, update via general put
      try {
        await api.put(`/students/${id}`, { feeStatus: newStatus });
        setSuccess(`Fee status updated to "${newStatus}"`);
        loadData();
      } catch (innerErr) {
        setError(innerErr.response?.data?.message || "Failed to update monthly fee status");
      }
    }
  }

  const filtered = students.filter((s) => {
    const status = getMonthFeeStatus(s);
    if (filterFee === "all") return true;
    return status === filterFee;
  });

  const counts = {
    paid: students.filter((s) => getMonthFeeStatus(s) === "paid").length,
    pending: students.filter((s) => getMonthFeeStatus(s) === "pending").length,
    overdue: students.filter((s) => getMonthFeeStatus(s) === "overdue").length,
  };

  return (
    <div style={{ padding: "8px" }}>
      {/* PROFESSIONAL TOP BANNER WITH CALENDAR MONTH SELECTOR */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "20px 24px",
          color: "#ffffff",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)"
        }}
      >
        <div>
          <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", fontWeight: "600" }}>
            📅 Monthly Billing Calendar & Fee Ledger
          </div>
          <h2 style={{ margin: "4px 0 0 0", fontSize: "22px", fontWeight: "700" }}>
            Students & Fee Management ({selectedMonth})
          </h2>
        </div>

        {/* Calendar Month Picker */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.1)", padding: "8px 14px", borderRadius: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>Select Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              background: "#ffffff",
              border: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              color: "#0f172a",
              cursor: "pointer"
            }}
          />
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
      {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}

      {/* STATS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 20, gap: 16 }}>
        <div style={{ borderLeft: "4px solid #16a34a", background: "#fff", padding: "18px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: 0, fontSize: "24px", color: "#16a34a" }}>{counts.paid}</h3>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Paid ({selectedMonth})</p>
        </div>
        <div style={{ borderLeft: "4px solid #d97706", background: "#fff", padding: "18px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: 0, fontSize: "24px", color: "#d97706" }}>{counts.pending}</h3>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Pending ({selectedMonth})</p>
        </div>
        <div style={{ borderLeft: "4px solid #dc2626", background: "#fff", padding: "18px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: 0, fontSize: "24px", color: "#dc2626" }}>{counts.overdue}</h3>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>Overdue ({selectedMonth})</p>
        </div>
      </div>

      {/* FILTER & ADD BUTTON */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: "12px" }}>
        <div style={{ background: "#fff", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", margin: 0, flex: 1, minWidth: "220px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>Filter by Fee Status ({selectedMonth})</label>
          <select
            value={filterFee}
            onChange={(e) => setFilterFee(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          >
            <option value="all">All Students</option>
            <option value="paid">Paid only</option>
            <option value="pending">Pending only</option>
            <option value="overdue">Overdue only</option>
          </select>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          style={{ background: "#2563eb", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", color: "#fff", cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {/* ADD STUDENT FORM */}
      {showForm && (
        <div style={{ marginBottom: 20, background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ marginBottom: 16, fontSize: "18px" }}>New Student Registration</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Roll Number</label>
                <input name="rollNumber" value={form.rollNumber} onChange={handleChange} required style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>Course</label>
                <select name="course" value={form.course} onChange={handleChange} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}>
                  <option value="">-- Select course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" style={{ marginTop: "16px", padding: "10px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
              Create Student & Generate QR
            </button>
          </form>
        </div>
      )}

      {/* STUDENTS TABLE WITH MONTHLY FEE STATUS */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
              <th style={{ padding: "12px" }}>Roll No.</th>
              <th style={{ padding: "12px" }}>Name</th>
              <th style={{ padding: "12px" }}>Course</th>
              <th style={{ padding: "12px" }}>Fee Status ({selectedMonth})</th>
              <th style={{ padding: "12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const currentStatus = getMonthFeeStatus(s);

              return (
                <tr key={s._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px" }}>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{s.rollNumber}</td>
                  <td style={{ padding: "12px" }}>{s.name}</td>
                  <td style={{ padding: "12px" }}>{s.course?.name || "-"}</td>
                  <td style={{ padding: "12px" }}>
                    <select
                      value={currentStatus}
                      onChange={(e) => updateMonthlyFeeStatus(s._id, e.target.value)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: "1px solid #cbd5e1",
                        fontWeight: 600,
                        fontSize: "12px",
                        background:
                          currentStatus === "paid"
                            ? "#dcfce7"
                            : currentStatus === "overdue"
                            ? "#fee2e2"
                            : "#fef9c3",
                        color:
                          currentStatus === "paid"
                            ? "#166534"
                            : currentStatus === "overdue"
                            ? "#b91c1c"
                            : "#854d0e",
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "6px" }}>
                    <button
                      style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", background: "#e2e8f0", border: "none", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => setQrPreview(s)}
                    >
                      View QR
                    </button>
                    <button
                      style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => handleDelete(s._id, s.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                  No students found for {selectedMonth}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QR PREVIEW MODAL */}
      {qrPreview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setQrPreview(null)}
        >
          <div
            style={{ width: 300, background: "#fff", padding: "24px", borderRadius: "16px", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 4px 0" }}>{qrPreview.name}</h3>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 16px 0" }}>
              Roll No: {qrPreview.rollNumber}
            </p>
            <img src={qrPreview.qrImage} alt="Student QR Code" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", marginBottom: "16px" }} />
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: "16px" }}>
              Print this and give it to the student, or they can access it in their portal.
            </p>
            <button onClick={() => setQrPreview(null)} style={{ width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}