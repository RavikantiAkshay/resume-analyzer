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
  const [activeTab, setActiveTab] = useState("overview");

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
      setActiveTab("overview");
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
    setActiveTab("overview");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Helpers ──
  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#ef4444";
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith("A")) return "#22c55e";
    if (grade?.startsWith("B")) return "#3b82f6";
    if (grade?.startsWith("C")) return "#eab308";
    return "#ef4444";
  };

  const getPriorityColor = (priority) => {
    if (priority === "critical") return "#ef4444";
    if (priority === "important") return "#eab308";
    return "#6b7280";
  };

  // ── SVG Score Ring ──
  const ScoreRing = ({ score, size = 160, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <svg width={size} height={size} className="score-ring">
        <circle
          className="score-ring__bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className="score-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text x="50%" y="44%" className="score-ring__value" style={{ fill: color }}>
          {score}
        </text>
        <text x="50%" y="60%" className="score-ring__label">
          / 100
        </text>
      </svg>
    );
  };

  // ── Section Score Bar ──
  const SectionBar = ({ label, score }) => (
    <div className="section-bar">
      <div className="section-bar__header">
        <span className="section-bar__label">{label}</span>
        <span className="section-bar__value" style={{ color: getScoreColor(score) }}>
          {score}%
        </span>
      </div>
      <div className="section-bar__track">
        <div
          className="section-bar__fill"
          style={{ width: `${score}%`, background: getScoreColor(score) }}
        />
      </div>
    </div>
  );

  const s = results?.suggestions;
  const isStructured = typeof s === "object" && s !== null;

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

        {/* ══════════ Step 1: Upload ══════════ */}
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

        {/* ══════════ Step 2: Job Description ══════════ */}
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

        {/* ══════════ Step 3: Analyzing Spinner ══════════ */}
        {step === "analyzing" && (
          <div className="card dashboard-card analyzing-card animate-slide-up">
            <div className="analyzing-spinner-container">
              <div className="analyzing-spinner"></div>
              <p className="analyzing-text">AI is analyzing your resume...</p>
              <p className="analyzing-hint">This may take 10–20 seconds.</p>
            </div>
          </div>
        )}

        {/* ══════════ Step 4: Results ══════════ */}
        {step === "results" && results && (
          <div className="results-container animate-slide-up">

            {/* ── Hero Score Section ── */}
            <div className="card results-hero">
              <div className="results-hero__left">
                <ScoreRing score={results.atsScore} />
              </div>
              <div className="results-hero__right">
                <p className="results-hero__label">ATS Compatibility Score</p>
                {isStructured && s.letter_grade && (
                  <div className="results-hero__grade" style={{ color: getGradeColor(s.letter_grade) }}>
                    {s.letter_grade}
                  </div>
                )}
                {isStructured && s.overall_assessment && (
                  <p className="results-hero__assessment">{s.overall_assessment}</p>
                )}
                {/* Keyword Stats */}
                {results.keywordStats && (
                  <div className="keyword-stats-row">
                    <div className="keyword-stat">
                      <span className="keyword-stat__value">{results.keywordStats.matchedCount}</span>
                      <span className="keyword-stat__label">Matched</span>
                    </div>
                    <div className="keyword-stat">
                      <span className="keyword-stat__value">{results.keywordStats.missingCount}</span>
                      <span className="keyword-stat__label">Missing</span>
                    </div>
                    <div className="keyword-stat">
                      <span className="keyword-stat__value">{results.keywordStats.totalJdKeywords}</span>
                      <span className="keyword-stat__label">Total JD Keywords</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Tabs Navigation ── */}
            {isStructured && (
              <div className="results-tabs">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "keywords", label: "Keywords" },
                  { id: "skills", label: "Missing Skills" },
                  { id: "tips", label: "Optimization" },
                  { id: "bullets", label: "Bullet Rewrites" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`results-tab ${activeTab === tab.id ? "results-tab--active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* ── Tab: Overview ── */}
            {isStructured && activeTab === "overview" && (
              <div className="results-tab-panel animate-fade-in">
                {/* Section Scores */}
                {s.section_scores && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">📊 Section Breakdown</h3>
                    <div className="section-bars">
                      <SectionBar label="Skills Match" score={s.section_scores.skills_match} />
                      <SectionBar label="Experience Relevance" score={s.section_scores.experience_relevance} />
                      <SectionBar label="Education Fit" score={s.section_scores.education_fit} />
                      <SectionBar label="Formatting Quality" score={s.section_scores.formatting_quality} />
                      <SectionBar label="Keyword Optimization" score={s.section_scores.keyword_optimization} />
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="results-two-col">
                  {s.strengths?.length > 0 && (
                    <div className="card results-section-card">
                      <h3 className="results-section-title">✅ Strengths</h3>
                      <ul className="results-list results-list--strengths">
                        {s.strengths.map((item, i) => (
                          <li key={i} className="results-list-item">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {s.weaknesses?.length > 0 && (
                    <div className="card results-section-card">
                      <h3 className="results-section-title">⚠️ Weaknesses</h3>
                      <ul className="results-list results-list--weaknesses">
                        {s.weaknesses.map((item, i) => (
                          <li key={i} className="results-list-item">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Verbs */}
                {s.action_verb_analysis && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">💪 Action Verb Analysis</h3>
                    <div className="verb-analysis">
                      {s.action_verb_analysis.strong_verbs_used?.length > 0 && (
                        <div className="verb-group">
                          <span className="verb-group__label">Strong verbs you're using:</span>
                          <div className="tag-cloud">
                            {s.action_verb_analysis.strong_verbs_used.map((v, i) => (
                              <span key={i} className="tag tag--green">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.action_verb_analysis.suggested_verbs?.length > 0 && (
                        <div className="verb-group">
                          <span className="verb-group__label">Consider using:</span>
                          <div className="tag-cloud">
                            {s.action_verb_analysis.suggested_verbs.map((v, i) => (
                              <span key={i} className="tag tag--blue">{v}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Keywords ── */}
            {isStructured && activeTab === "keywords" && (
              <div className="results-tab-panel animate-fade-in">
                {/* AI Keyword Analysis */}
                {s.keyword_analysis && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">🔑 AI Keyword Analysis</h3>
                    {s.keyword_analysis.well_used_keywords?.length > 0 && (
                      <div className="keyword-group">
                        <span className="keyword-group__label">Well-used keywords:</span>
                        <div className="tag-cloud">
                          {s.keyword_analysis.well_used_keywords.map((kw, i) => (
                            <span key={i} className="tag tag--green">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.keyword_analysis.underused_keywords?.length > 0 && (
                      <div className="keyword-group">
                        <span className="keyword-group__label">Underused keywords:</span>
                        <div className="tag-cloud">
                          {s.keyword_analysis.underused_keywords.map((kw, i) => (
                            <span key={i} className="tag tag--yellow">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.keyword_analysis.missing_keywords?.length > 0 && (
                      <div className="keyword-group">
                        <span className="keyword-group__label">Missing keywords:</span>
                        <div className="tag-cloud">
                          {s.keyword_analysis.missing_keywords.map((kw, i) => (
                            <span key={i} className="tag tag--red">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw keyword match from backend */}
                {results.keywordStats && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">📋 Keyword Match Details</h3>
                    <p className="keyword-match-summary">
                      <strong>{results.keywordStats.matchedCount}</strong> of <strong>{results.keywordStats.totalJdKeywords}</strong> unique JD keywords found in your resume.
                    </p>
                    {results.keywordStats.matchedKeywords?.length > 0 && (
                      <div className="keyword-group">
                        <span className="keyword-group__label">Matched ({results.keywordStats.matchedCount}):</span>
                        <div className="tag-cloud">
                          {results.keywordStats.matchedKeywords.slice(0, 40).map((kw, i) => (
                            <span key={i} className="tag tag--green">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {results.keywordStats.missingKeywords?.length > 0 && (
                      <div className="keyword-group">
                        <span className="keyword-group__label">Missing ({results.keywordStats.missingCount}):</span>
                        <div className="tag-cloud">
                          {results.keywordStats.missingKeywords.slice(0, 40).map((kw, i) => (
                            <span key={i} className="tag tag--red">{kw}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Missing Skills ── */}
            {isStructured && activeTab === "skills" && (
              <div className="results-tab-panel animate-fade-in">
                {s.missing_skills?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">🔍 Missing Skills</h3>
                    <div className="missing-skills-list">
                      {s.missing_skills.map((item, i) => (
                        <div key={i} className="missing-skill-item">
                          <div className="missing-skill-item__header">
                            <span className="missing-skill-item__name">
                              {typeof item === "string" ? item : item.skill}
                            </span>
                            {typeof item === "object" && item.priority && (
                              <span
                                className="missing-skill-item__priority"
                                style={{ color: getPriorityColor(item.priority), borderColor: getPriorityColor(item.priority) }}
                              >
                                {item.priority}
                              </span>
                            )}
                          </div>
                          {typeof item === "object" && item.suggestion && (
                            <p className="missing-skill-item__suggestion">{item.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Optimization Tips ── */}
            {isStructured && activeTab === "tips" && (
              <div className="results-tab-panel animate-fade-in">
                {s.optimization_tips?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">💡 Optimization Tips</h3>
                    <ul className="results-list results-list--tips">
                      {s.optimization_tips.map((tip, i) => (
                        <li key={i} className="results-list-item">
                          <span className="tip-number">{i + 1}</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Bullet Point Improvements ── */}
            {isStructured && activeTab === "bullets" && (
              <div className="results-tab-panel animate-fade-in">
                {s.bullet_point_improvements?.length > 0 && (
                  <div className="card results-section-card">
                    <h3 className="results-section-title">✏️ Bullet Point Improvements</h3>
                    <div className="bullet-improvements">
                      {s.bullet_point_improvements.map((item, i) => (
                        <div key={i} className="bullet-improvement">
                          <div className="bullet-improvement__original">
                            <span className="bullet-label">Original:</span>
                            <p>{item.original}</p>
                          </div>
                          <div className="bullet-improvement__arrow">→</div>
                          <div className="bullet-improvement__suggested">
                            <span className="bullet-label">Improved:</span>
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
              </div>
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
