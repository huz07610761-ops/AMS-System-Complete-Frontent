import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
});

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [passPercentage, setPassPercentage] = useState(50);

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        api.get("/quizzes"),
        api.get("/students"),
      ]);
      setQuizzes(qRes.data);
      setStudents(sRes.data);
    } catch (err) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index, field, value) {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function updateOption(qIndex, optIndex, value) {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: opts };
      return copy;
    });
  }

  function toggleStudent(id) {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`Question ${i + 1}: all 4 options are required`);
        return;
      }
    }

    if (!assignToAll && selectedStudents.length === 0) {
      setError("Please select at least one student or choose All Students");
      return;
    }

    // Backend ke exact format ke mutabiq payload
    const payload = {
      title: title.trim(),
      description: description.trim(),
      questions: questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => o.trim()),
        correctOptionIndex: Number(q.correctOptionIndex),
      })),
      assignToAll: !!assignToAll,
      assignedTo: assignToAll ? [] : selectedStudents,
      maxAttempts: Number(maxAttempts) || 3,
      passPercentage: Number(passPercentage) || 50,
    };

    try {
      await api.post("/quizzes", payload);
      setSuccess("Quiz created & assigned successfully!");
      setTitle("");
      setDescription("");
      setQuestions([emptyQuestion()]);
      setSelectedStudents([]);
      setAssignToAll(true);
      setMaxAttempts(3);
      setPassPercentage(50);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    }
  }

  async function handleDelete(id, quizTitle) {
    if (!window.confirm(`Delete quiz "${quizTitle}"?`)) return;
    try {
      await api.delete(`/quizzes/${id}`);
      loadData();
    } catch (err) {
      setError("Failed to delete quiz");
    }
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Quizzes</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Quiz"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>New Quiz</h3>
          <form onSubmit={handleSubmit}>
            <label>Quiz Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HTML Basics Quiz"
              required
            />

            <label>Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />

            <div className="grid grid-3" style={{ marginTop: 8 }}>
              <div>
                <label>Max Attempts</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                />
              </div>
              <div>
                <label>Pass Percentage</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                />
              </div>
            </div>

            <h4 style={{ margin: "20px 0 12px" }}>Questions</h4>

            {questions.map((q, qi) => (
              <div
                key={qi}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                  background: "#f9fafb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <strong>Question {qi + 1}</strong>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: 12 }}
                      onClick={() => removeQuestion(qi)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label>Question Text</label>
                <input
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                  placeholder="Enter the question"
                  required
                />

                <label style={{ marginTop: 8 }}>Options (select the correct one)</label>
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
                  >
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctOptionIndex === oi}
                      onChange={() => updateQuestion(qi, "correctOptionIndex", oi)}
                    />
                    <span style={{ fontWeight: 600, width: 20 }}>
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      required
                      style={{ marginBottom: 0 }}
                    />
                  </div>
                ))}
              </div>
            ))}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={addQuestion}
              style={{ marginBottom: 20 }}
            >
              + Add Question
            </button>

            <h4 style={{ margin: "10px 0 12px" }}>Assign To</h4>
            <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="radio"
                  checked={assignToAll === true}
                  onChange={() => setAssignToAll(true)}
                />
                All Students
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="radio"
                  checked={assignToAll === false}
                  onChange={() => setAssignToAll(false)}
                />
                Selected Students
              </label>
            </div>

            {!assignToAll && (
              <div
                style={{
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                }}
              >
                {students.length === 0 ? (
                  <p style={{ color: "#6b7280", fontSize: 13 }}>No students found</p>
                ) : (
                  students.map((s) => (
                    <label
                      key={s._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s._id)}
                        onChange={() => toggleStudent(s._id)}
                      />
                      <span style={{ fontSize: 14 }}>
                        {s.name} ({s.rollNumber})
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}

            <button type="submit" className="btn" style={{ width: "100%" }}>
              Create & Assign Quiz
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>
          {loading ? "Loading..." : `${quizzes.length} Quiz(zes)`}
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th>Assigned</th>
                <th>Max Attempts</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q._id}>
                  <td style={{ fontWeight: 600 }}>{q.title}</td>
                  <td>{q.questions?.length || 0}</td>
                  <td>
                    {q.assignToAll
                      ? "All Students"
                      : `${q.assignedTo?.length || 0} student(s)`}
                  </td>
                  <td>{q.maxAttempts || 3}</td>
                  <td>
                    {q.createdAt
                      ? new Date(q.createdAt).toLocaleDateString("en-GB")
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "6px 10px" }}
                      onClick={() => handleDelete(q._id, q.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 20 }}>
                    No quizzes yet. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}