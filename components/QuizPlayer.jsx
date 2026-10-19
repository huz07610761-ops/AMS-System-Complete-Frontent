import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/axios.js";

export default function QuizPlayer({ quizId, onClose, onSubmitSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [maxAttempts, setMaxAttempts] = useState(3);

  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOption }
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const isFinishedRef = useRef(false);
  const attemptIdRef = useRef(null);

  // Start / resume attempt
  useEffect(() => {
    let cancelled = false;

    async function startPlay() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.post(`/quizzes/${quizId}/play`);
        if (cancelled) return;

        setTitle(data.title);
        setQuestions(data.questions || []);
        setAttemptId(data.attemptId);
        attemptIdRef.current = data.attemptId;
        setAttemptNumber(data.attemptNumber);
        setMaxAttempts(data.maxAttempts);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not start quiz");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    startPlay();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  // Leave / power-off → abandon attempt (best-effort)
  const handleLeave = useCallback(() => {
    if (isFinishedRef.current || !attemptIdRef.current) return;
    // sendBeacon works even when page is closing
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/quizzes/${quizId}/abandon`;
    const body = JSON.stringify({ attemptId: attemptIdRef.current });

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      // sendBeacon cannot set Authorization header easily, so fallback to fetch keepalive
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
        keepalive: true,
      }).catch(() => {});
    } else {
      api.post(`/quizzes/${quizId}/abandon`, { attemptId: attemptIdRef.current }).catch(() => {});
    }
  }, [quizId]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") handleLeave();
    };
    const onBeforeUnload = () => handleLeave();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [handleLeave]);

  function selectOption(qIndex, optionIndex) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  }

  async function submitQuiz() {
    if (submitting || isFinishedRef.current || !attemptId) return;
    setSubmitting(true);
    isFinishedRef.current = true;

    const answersArray = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: Number(questionIndex),
      selectedOption: Number(selectedOption),
    }));

    try {
      const { data } = await api.post(`/quizzes/${quizId}/submit`, {
        attemptId,
        answers: answersArray,
      });
      setResult(data);
      if (onSubmitSuccess) onSubmitSuccess(data);
    } catch (err) {
      setResult({
        score: 0,
        total: questions.length,
        percentage: 0,
        passed: false,
        message: err.response?.data?.message || "Submit failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Loading
  if (loading) {
    return (
      <div style={overlayStyle}>
        <div style={playerBoxStyle}>
          <p style={{ textAlign: "center" }}>Starting quiz...</p>
        </div>
      </div>
    );
  }

  // Error starting
  if (error) {
    return (
      <div style={overlayStyle}>
        <div style={resultBoxStyle}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ marginBottom: 8 }}>Cannot start quiz</h2>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>{error}</p>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    const isHigh = result.percentage >= 70;
    const isPass = result.passed;

    return (
      <div style={overlayStyle}>
        <div style={resultBoxStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {isHigh ? "🎉" : isPass ? "👍" : "😔"}
          </div>
          <h2 style={{ marginBottom: 8 }}>
            {isHigh
              ? "Mubarak ho! Bohot accha score!"
              : isPass
              ? "Pass ho gaye!"
              : "Dobara try karo"}
          </h2>
          <p style={{ fontSize: 22, fontWeight: 700, margin: "12px 0" }}>
            Score: {result.score} / {result.total} ({result.percentage}%)
          </p>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            {result.message || (isPass ? "Well done!" : "Keep practicing.")}
          </p>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <div style={overlayStyle}>
      <div style={playerBoxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
            <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
              Attempt {attemptNumber} of {maxAttempts}
            </p>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {current + 1} / {questions.length}
          </div>
        </div>

        <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, marginBottom: 24 }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#2563eb",
              borderRadius: 99,
              transition: "width 0.3s",
            }}
          />
        </div>

        {q && (
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              {q.questionText}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(q.options || []).map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => selectOption(current, oi)}
                  style={{
                    textAlign: "left",
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: answers[current] === oi ? "2px solid #2563eb" : "1px solid #d1d5db",
                    background: answers[current] === oi ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: 8 }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            className="btn btn-secondary"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            Previous
          </button>

          {current < questions.length - 1 ? (
            <button className="btn" onClick={() => setCurrent((c) => c + 1)}>
              Next
            </button>
          ) : (
            <button className="btn" onClick={submitQuiz} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.85)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const playerBoxStyle = {
  background: "#fff",
  borderRadius: 16,
  padding: 28,
  width: "100%",
  maxWidth: 560,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
};

const resultBoxStyle = {
  ...playerBoxStyle,
  textAlign: "center",
  maxWidth: 420,
};