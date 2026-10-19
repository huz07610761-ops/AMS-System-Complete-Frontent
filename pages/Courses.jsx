import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyTiming = () => ({
  label: "",
  startTime: "09:00",
  endTime: "11:00",
});

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    fee: "",
    timings: [emptyTiming()],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCourses() {
    try {
      const { data } = await api.get("/courses");
      setCourses(data);
    } catch (err) {
      setError("Failed to load courses");
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      duration: "",
      fee: "",
      timings: [emptyTiming()],
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(course) {
    setForm({
      name: course.name || "",
      description: course.description || "",
      duration: course.duration || "",
      fee: course.fee ?? "",
      timings:
        course.timings?.length > 0
          ? course.timings.map((t) => ({
              label: t.label || "",
              startTime: t.startTime || "09:00",
              endTime: t.endTime || "11:00",
            }))
          : [emptyTiming()],
    });
    setEditingId(course._id);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function addTiming() {
    setForm((prev) => ({
      ...prev,
      timings: [...prev.timings, emptyTiming()],
    }));
  }

  function removeTiming(index) {
    if (form.timings.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      timings: prev.timings.filter((_, i) => i !== index),
    }));
  }

  function updateTiming(index, field, value) {
    setForm((prev) => {
      const timings = [...prev.timings];
      timings[index] = { ...timings[index], [field]: value };
      return { ...prev, timings };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Course name is required");
      return;
    }

    // timings validate
    for (let i = 0; i < form.timings.length; i++) {
      const t = form.timings[i];
      if (!t.label.trim() || !t.startTime || !t.endTime) {
        setError(`Timing ${i + 1}: label, start time aur end time required hain`);
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      duration: form.duration.trim(),
      fee: form.fee === "" ? 0 : Number(form.fee),
      timings: form.timings.map((t) => ({
        label: t.label.trim(),
        startTime: t.startTime,
        endTime: t.endTime,
      })),
    };

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        setSuccess("Course updated successfully");
      } else {
        await api.post("/courses", payload);
        setSuccess("Course added successfully");
      }
      resetForm();
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save course");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      loadCourses();
    } catch (err) {
      setError("Failed to delete course");
    }
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Courses</h1>
        <button
          className="btn"
          onClick={() => {
            if (showForm) resetForm();
            else {
              setShowForm(true);
              setEditingId(null);
              setForm({
                name: "",
                description: "",
                duration: "",
                fee: "",
                timings: [emptyTiming()],
              });
            }
          }}
        >
          {showForm ? "Cancel" : "+ Add Course"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>
            {editingId ? "Edit Course" : "New Course"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-3">
              <div>
                <label>Course Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Duration</label>
                <input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 3 months"
                />
              </div>
              <div>
                <label>Fee (PKR)</label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                />
              </div>
            </div>

            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* ========== TIMINGS ========== */}
            <h4 style={{ margin: "20px 0 12px" }}>Class Timings</h4>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              Har batch ki timing set karein. Public register pe student inhi timings mein se select karega.
            </p>

            {form.timings.map((t, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                  marginBottom: 12,
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>Timing {i + 1}</strong>
                  {form.timings.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => removeTiming(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label>Label (e.g. Morning Batch)</label>
                <input
                  value={t.label}
                  onChange={(e) => updateTiming(i, "label", e.target.value)}
                  placeholder="Morning 9:00 – 11:00"
                  required
                />

                <div className="grid grid-3" style={{ marginTop: 4 }}>
                  <div>
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={t.startTime}
                      onChange={(e) => updateTiming(i, "startTime", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>End Time</label>
                    <input
                      type="time"
                      value={t.endTime}
                      onChange={(e) => updateTiming(i, "endTime", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={addTiming}
              style={{ marginBottom: 16 }}
            >
              + Add Timing
            </button>

            <button type="submit" className="btn" style={{ width: "100%" }}>
              {editingId ? "Update Course" : "Save Course"}
            </button>
          </form>
        </div>
      )}

      {/* ========== LIST ========== */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Fee</th>
              <th>Timings</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.duration || "-"}</td>
                <td>{c.fee ? `PKR ${c.fee}` : "-"}</td>
                <td>
                  {c.timings?.length > 0 ? (
                    <div style={{ fontSize: 12 }}>
                      {c.timings.map((t, i) => (
                        <div key={i}>
                          {t.label} ({t.startTime}–{t.endTime})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#9ca3af" }}>No timings</span>
                  )}
                </td>
                <td>{c.description || "-"}</td>
                <td className="flex-row">
                  <button
                    className="btn"
                    style={{ padding: "6px 10px" }}
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px 10px" }}
                    onClick={() => handleDelete(c._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                  No courses added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}