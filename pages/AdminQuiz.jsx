import { useEffect, useState } from "react";
import api from "../api/axios.js";

const emptyQuestion = { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 };

export default function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resultsFor, setResultsFor] = useState(null);
  const [results, setResults] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([{ ...emptyQuestion, options: [...emptyQuestion.options] }]);
  const [assignToAll, setAssignToAll] = useState(true);
  const [assignedTo, setAssignedTo] = useState([]);

  async function loadData() {
    try {
      const [quizRes, studentRes] = await Promise.all([api.get("/quizzes"), api.get("/students")]);
      setQuizzes(quizRes.data);
      setStudents(studentRes.data);
    } catch (err) {
      setError("Failed to load data");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateQuestion(index, field, value) {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  }

  function updateOption(qIndex, oIndex, value) {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  }

  function addQuestion() {
    setQuestions([...questions, { ...emptyQuestion, options: ["", "", "", ""] }]);
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function toggleStudent(id) {
    setAssignedTo((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setQuestions([{ ...emptyQuestion, options: ["", "", "", ""] }]);
    setAssignToAll(true);
    setAssignedTo([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/quizzes", { title, description, questions, assignToAll, assignedTo });
      setSuccess("Quiz created and assigned successfully!");
      resetForm();
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this quiz? All student attempts will also be removed.")) return;
    await api.delete(`/quizzes/${id}`);
    loadData();
  }

  async function viewResults(quiz) {
    setResultsFor(quiz);
    const { data } = await api.get(`/quizzes/${quiz._id}/results`);
    setResults(data);
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Quiz Management</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Create Quiz"}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <label>Quiz Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />

            <label>Description (optional)</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} />

            <h3 style={{ margin: "16px 0 10px" }}>Questions</h3>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="card" style={{ background: "#f9fafb" }}>
                <div className="top-bar">
                  <label style={{ marginBottom: 0 }}>Question {qIndex + 1}</label>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-danger" style={{ padding: "4px 10px" }} onClick={() => removeQuestion(qIndex)}>
                      Remove
                    </button>
                  )}
                </div>
                <input
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                  placeholder="Type the question here"
                  required
                />
                <div className="grid grid-3">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex}>
                      <label style={{ fontSize: 12 }}>
                        Option {oIndex + 1} {q.correctOptionIndex === oIndex && "✅ Correct"}
                      </label>
                      <input value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} required />
                    </div>
                  ))}
                </div>
                <label style={{ fontSize: 12 }}>Correct Option</label>
                <select
                  value={q.correctOptionIndex}
                  onChange={(e) => updateQuestion(qIndex, "correctOptionIndex", Number(e.target.value))}
                >
                  {q.options.map((_, oIndex) => (
                    <option key={oIndex} value={oIndex}>Option {oIndex + 1}</option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addQuestion} style={{ marginBottom: 16 }}>
              + Add Another Question
            </button>

            <h3 style={{ margin: "16px 0 10px" }}>Assign To</h3>
            <label className="flex-row" style={{ fontWeight: 400 }}>
              <input type="checkbox" style={{ width: "auto" }} checked={assignToAll} onChange={(e) => setAssignToAll(e.target.checked)} />
              Assign to all students
            </label>

            {!assignToAll && (
              <div className="card" style={{ maxHeight: 220, overflowY: "auto", background: "#f9fafb" }}>
                {students.map((s) => (
                  <label key={s._id} className="flex-row" style={{ fontWeight: 400, marginBottom: 8 }}>
                    <input
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={assignedTo.includes(s._id)}
                      onChange={() => toggleStudent(s._id)}
                    />
                    {s.name} ({s.rollNumber})
                  </label>
                ))}
              </div>
            )}

            <button type="submit" className="btn" style={{ marginTop: 12 }}>Create & Assign Quiz</button>
          </form>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Questions</th>
              <th>Assigned</th>
              <th>Max Attempts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q._id}>
                <td>{q.title}</td>
                <td>{q.questions.length}</td>
                <td>{q.assignToAll ? "All students" : `${q.assignedTo.length} student(s)`}</td>
                <td>{q.maxAttempts}</td>
                <td className="flex-row">
                  <button className="btn" style={{ padding: "6px 10px" }} onClick={() => viewResults(q)}>Results</button>
                  <button className="btn btn-danger" style={{ padding: "6px 10px" }} onClick={() => handleDelete(q._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>No quizzes created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {resultsFor && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => { setResultsFor(null); setResults(null); }}
        >
          <div className="card" style={{ width: 600, maxHeight: "80vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h3>{resultsFor.title} — Results</h3>
            {!results ? (
              <p>Loading...</p>
            ) : (
              <table style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map((r) => (
                    <tr key={r.student.id}>
                      <td>{r.student.name} ({r.student.rollNumber})</td>
                      <td><span className={`badge badge-${r.status === "completed" ? "paid" : r.status === "failed" ? "overdue" : "pending"}`}>{r.status}</span></td>
                      <td>{r.attemptsUsed}/{r.maxAttempts}</td>
                      <td>{r.score !== null ? `${r.score}/${r.totalQuestions}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="btn" style={{ marginTop: 16 }} onClick={() => { setResultsFor(null); setResults(null); }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}