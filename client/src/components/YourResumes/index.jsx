import { useState, useRef } from "react";
import "./index.css";

const API_URL = "http://localhost:5000";

const YourResumes = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload"); // "upload" | "jd" | "analyzing" | "results"
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const getToken = () => localStorage.getItem("token");

  // ── File Selection ──
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return;
    }
    setError("");
    setFile(selectedFile);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  // ── Drag & Drop ──
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  // ── Step 1: Upload PDF ──
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API_URL}/resume/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");

      setResumeText(data.text);
      setStep("jd");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Analyze ──
  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }
    setLoading(true);
    setError("");
    setStep("analyzing");

    try {
      const res = await fetch(`${API_URL}/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Analysis failed.");

      setResults(data);
      setStep("results");
    } catch (err) {
      setError(err.message);
      setStep("jd");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ──
  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResumeText("");
    setResults(null);
    setError("");
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Score Color ──
  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <main className="dashboard-page animate-fade-in" id="your-resumes-page">
      <div className="container dashboard-container">
        <div className="dashboard-header">
          <span className="dashboard-icon">◈</span>
          <h1 className="heading-md dashboard-title">Resume Analyzer</h1>
          <p className="dashboard-subtitle">
            Upload your resume, paste a job description, and get AI-powered feedback.
          </p>
        </div>

        {/* ── Progress Steps ── */}
        <div className="progress-bar">
          <div className={`progress-step ${step === "upload" ? "progress-step--active" : ""} ${["jd", "analyzing", "results"].includes(step) ? "progress-step--done" : ""}`}>
            <span className="progress-step__number">1</span>
            <span className="progress-step__label">Upload</span>
          </div>
          <div className="progress-step__connector"></div>
          <div className={`progress-step ${step === "jd" ? "progress-step--active" : ""} ${["analyzing", "results"].includes(step) ? "progress-step--done" : ""}`}>
            <span className="progress-step__number">2</span>
            <span className="progress-step__label">Job Description</span>
          </div>
          <div className="progress-step__connector"></div>
          <div className={`progress-step ${step === "analyzing" || step === "results" ? "progress-step--active" : ""} ${step === "results" ? "progress-step--done" : ""}`}>
            <span className="progress-step__number">3</span>
            <span className="progress-step__label">Results</span>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="dashboard-error">
            <span className="message-bullet">✦</span> {error}
          </div>
        )}

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="card dashboard-card animate-slide-up">
            <div
              className={`dropzone ${isDragging ? "dropzone--active" : ""} ${file ? "dropzone--has-file" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              id="resume-dropzone"
            >
              <input
                type="file"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleInputChange}
                hidden
              />
              {file ? (
                <div className="dropzone__selected">
                  <span className="dropzone__file-icon">📄</span>
                  <span className="dropzone__file-name">{file.name}</span>
                  <span className="dropzone__file-size">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <div className="dropzone__placeholder">
                  <span className="dropzone__upload-icon">⬆</span>
                  <p className="dropzone__text">
                    Drag & drop your PDF resume here
                  </p>
                  <p className="dropzone__hint">or click to browse (max 10MB)</p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary dashboard-action-btn"
              onClick={handleUpload}
              disabled={!file || loading}
              id="upload-btn"
            >
              {loading ? <span className="btn-spinner"></span> : "Upload & Parse Resume"}
            </button>
          </div>
        )}

        {/* ── Step 2: Job Description ── */}
        {step === "jd" && (
          <div className="card dashboard-card animate-slide-up">
            <div className="jd-section">
              <label className="form-label" htmlFor="jd-textarea">
                Paste the Job Description
              </label>
              <textarea
                id="jd-textarea"
                className="input-field jd-textarea"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (error) setError("");
                }}
                rows={10}
              />
            </div>

            <div className="dashboard-actions-row">
              <button className="btn btn-secondary" onClick={handleReset}>
                ← Back
              </button>
              <button
                className="btn btn-primary dashboard-action-btn"
                onClick={handleAnalyze}
                disabled={!jobDescription.trim() || loading}
                id="analyze-btn"
              >
                Analyze with AI
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Analyzing Spinner ── */}
        {step === "analyzing" && (
          <div className="card dashboard-card analyzing-card animate-slide-up">
            <div className="analyzing-spinner-container">
              <div className="analyzing-spinner"></div>
              <p className="analyzing-text">AI is analyzing your resume...</p>
              <p className="analyzing-hint">This may take 10–20 seconds.</p>
            </div>
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {step === "results" && results && (
          <div className="results-container animate-slide-up">
            {/* Score Card */}
            <div className="card results-score-card">
              <h2 className="results-score-title">ATS Compatibility Score</h2>
              <div className="score-circle" style={{ "--score-color": getScoreColor(results.atsScore) }}>
                <span className="score-value">{results.atsScore}</span>
                <span className="score-unit">/ 100</span>
              </div>
              <p className="score-verdict">
                {results.atsScore >= 75
                  ? "Great match! Your resume aligns well with this role."
                  : results.atsScore >= 50
                  ? "Decent match. Some improvements could boost your chances."
                  : "Low match. Significant improvements are recommended."}
              </p>
            </div>

            {/* AI Suggestions */}
            {typeof results.suggestions === "object" && results.suggestions !== null && (
              <>
                {/* Missing Skills */}
                {results.suggestions.missing_skills?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">🔍 Missing Skills</h3>
                    <ul className="results-list">
                      {results.suggestions.missing_skills.map((skill, i) => (
                        <li key={i} className="results-list-item">{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optimization Tips */}
                {results.suggestions.optimization_tips?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">💡 Optimization Tips</h3>
                    <ul className="results-list">
                      {results.suggestions.optimization_tips.map((tip, i) => (
                        <li key={i} className="results-list-item">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bullet Point Improvements */}
                {results.suggestions.bullet_point_improvements?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">✏️ Bullet Point Improvements</h3>
                    <div className="bullet-improvements">
                      {results.suggestions.bullet_point_improvements.map((item, i) => (
                        <div key={i} className="bullet-improvement">
                          <div className="bullet-improvement__original">
                            <span className="bullet-label">Original:</span>
                            <p>{item.original}</p>
                          </div>
                          <div className="bullet-improvement__suggested">
                            <span className="bullet-label">Suggested:</span>
                            <p>{item.suggested}</p>
                          </div>
                          <div className="bullet-improvement__reason">
                            <span className="bullet-label">Why:</span>
                            <p>{item.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* If suggestions came back as raw text (fallback) */}
            {typeof results.suggestions === "string" && (
              <div className="card results-section-card">
                <h3 className="results-section-title">AI Feedback</h3>
                <p className="results-raw-text">{results.suggestions}</p>
              </div>
            )}

            <button className="btn btn-primary dashboard-action-btn" onClick={handleReset} id="analyze-another-btn">
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default YourResumes;
