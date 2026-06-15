import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const API_URL = "http://localhost:5000";

const YourResumes = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [industry, setIndustry] = useState("Technology / Software");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("upload"); // "upload" | "jd" | "analyzing" | "results"
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/resume/history`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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

  const handleInputChange = (e) => handleFileSelect(e.target.files[0]);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); };

  const handleUpload = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    setLoading(true); setError("");

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

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    setLoading(true); setError(""); setStep("analyzing");

    try {
      const res = await fetch(`${API_URL}/resume/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ resumeText, jobDescription, industry }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Analysis failed.");

      setResults(data);
      setStep("results");
      fetchHistory(); // refresh history with the new analysis
    } catch (err) {
      setError(err.message);
      setStep("jd");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null); setJobDescription(""); setResumeText(""); setResults(null);
    setError(""); setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("report-content");
    const opt = {
      margin:       0.5,
      filename:     'ResumeAI-Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const s = results?.suggestions;
  const isStructured = typeof s === "object" && s !== null;

  return (
    <div className="flex h-screen overflow-hidden font-body-md text-body-md bg-surface text-on-surface">
      {/* SideNavBar */}
      <nav className={`fixed lg:relative lg:flex flex-col w-64 h-screen p-md gap-sm bg-surface-container-low border-r border-outline-variant/20 z-40 flex-shrink-0 transition-transform transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-xl flex items-center justify-between gap-sm px-sm mt-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div>
              <h1 className="font-title-md text-title-md font-black text-primary">ResumeAI</h1>
              <p className="font-caption text-caption text-on-surface-variant">Dashboard</p>
            </div>
          </div>
          <button className="lg:hidden text-on-surface p-1" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex flex-col gap-xs flex-grow overflow-y-auto pr-xs">
          <Link to="/" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant/30 rounded-lg group transition-all duration-300">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <button onClick={handleReset} className={`flex items-center gap-md px-md py-sm rounded-lg group transition-all duration-300 ${step !== 'results' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}>
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">upload_file</span>
            <span className="font-label-md text-label-md">New Analysis</span>
          </button>
          <div className={`flex items-center gap-md px-md py-sm rounded-lg transition-all duration-300 ${step === 'results' ? 'bg-secondary-container text-on-secondary-container font-bold' : 'text-on-surface-variant/50 pointer-events-none'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Results Report</span>
          </div>
          
          {/* History Section */}
          <div className="mt-8 mb-2 px-md">
            <h4 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Recent Analyses</h4>
          </div>
          {historyLoading ? (
            <div className="px-md py-sm text-center">
              <span className="material-symbols-outlined animate-spin text-secondary text-xl">refresh</span>
            </div>
          ) : history.length > 0 ? (
            history.map((item) => (
              <button 
                key={item._id}
                onClick={() => {
                  setResults({
                    atsScore: item.atsScore,
                    suggestions: item.suggestions,
                    keywordStats: item.keywordStats // if it was saved, otherwise undefined
                  });
                  setStep("results");
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-start gap-1 px-md py-3 rounded-lg group transition-all duration-300 text-left ${results?.atsScore === item.atsScore && results?.suggestions === item.suggestions ? 'bg-surface-variant/50 border-l-4 border-secondary' : 'hover:bg-surface-variant/30 border-l-4 border-transparent'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-label-md text-primary line-clamp-1">Score: {item.atsScore}%</span>
                  <span className="font-caption text-on-surface-variant text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="font-caption text-on-surface-variant line-clamp-1 opacity-80">
                  {typeof item.suggestions?.overall_assessment === "string" 
                    ? item.suggestions.overall_assessment.substring(0, 40) + "..."
                    : "View Analysis Report"}
                </span>
              </button>
            ))
          ) : (
            <div className="px-md py-sm">
              <p className="font-caption text-on-surface-variant italic">No past analyses found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-auto flex flex-col gap-sm pt-md border-t border-outline-variant/30">
          <button onClick={handleLogout} className="flex items-center justify-center gap-xs px-sm py-2 text-on-surface hover:bg-surface-variant/50 rounded-lg transition-all border border-outline-variant/30">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Canvas Area */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* TopNavBar (Mobile only) */}
        <header className="flex lg:hidden items-center justify-between p-md bg-surface border-b border-outline-variant/20 z-30">
          <div className="flex items-center gap-sm">
            <button onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined text-secondary">menu</span>
            </button>
            <span className="font-title-md text-title-md font-bold text-primary">ResumeAI</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-md lg:p-lg bg-surface">
          <div className="max-w-[1600px] mx-auto">
            
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                <span className="font-body-md">{error}</span>
              </div>
            )}

            {/* Steps: Upload / JD / Analyzing */}
            {step !== "results" && (
              <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-xl border border-outline-variant/20 shadow-level-1">
                {step === "upload" && (
                  <div className="flex flex-col items-center">
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-2 text-center">Upload Your Resume</h2>
                    <p className="font-body-md text-on-surface-variant mb-8 text-center">We will extract the text to compare it against a job description.</p>
                    
                    <div 
                      className={`w-full border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer mb-6 ${isDragging ? "border-secondary bg-secondary/10" : "border-outline-variant/40 hover:border-secondary/50 bg-surface"}`}
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                    >
                      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleInputChange} hidden />
                      <span className="material-symbols-outlined text-4xl text-secondary mb-4">upload_file</span>
                      {file ? (
                        <div>
                          <p className="font-title-md text-primary">{file.name}</p>
                          <p className="font-caption text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-title-md text-primary mb-1">Drag & drop your PDF</p>
                          <p className="font-caption text-on-surface-variant">or click to browse</p>
                        </div>
                      )}
                    </div>
                    
                    <button onClick={handleUpload} disabled={!file || loading} className="w-full bg-[#00687a] hover:bg-[#005161] text-white font-label-md px-6 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Upload & Parse"}
                    </button>
                  </div>
                )}

                {step === "jd" && (
                  <div className="flex flex-col">
                    <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Target Job Description</h2>
                    <p className="font-body-md text-on-surface-variant mb-6">Configure your analysis context and paste the target description.</p>
                    
                    <div className="mb-4">
                      <label className="block font-label-md text-primary mb-1">Target Industry</label>
                      <select 
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors"
                      >
                        <option value="Technology / Software">Technology / Software</option>
                        <option value="Finance / Banking">Finance / Banking</option>
                        <option value="Healthcare / Medical">Healthcare / Medical</option>
                        <option value="Core Engineering / Manufacturing">Core Engineering / Manufacturing</option>
                        <option value="Marketing / Sales">Marketing / Sales</option>
                        <option value="Consulting / Management">Consulting / Management</option>
                        <option value="Design / Creative">Design / Creative</option>
                        <option value="General / Other">General / Other</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="block font-label-md text-primary mb-1">Job Description</label>
                      <textarea 
                        className="w-full p-4 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors resize-y"
                        rows="10" placeholder="Paste job description here..."
                        value={jobDescription} onChange={(e) => { setJobDescription(e.target.value); setError(""); }}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button onClick={handleReset} className="px-6 py-3 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-variant/30 transition-colors font-label-md">Back</button>
                      <button onClick={handleAnalyze} disabled={!jobDescription.trim() || loading} className="flex-grow bg-[#00687a] hover:bg-[#005161] text-white font-label-md px-6 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        Analyze with AI
                      </button>
                    </div>
                  </div>
                )}

                {step === "analyzing" && (
                  <div className="flex flex-col items-center py-12">
                    <span className="material-symbols-outlined text-secondary text-5xl animate-spin mb-6" style={{ fontVariationSettings: "'wght' 300" }}>autorenew</span>
                    <h2 className="font-title-md text-title-md text-primary mb-2">AI is analyzing your resume...</h2>
                    <p className="font-body-md text-on-surface-variant">Checking keywords, formatting, and impact metrics.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step: Results Dashboard */}
            {step === "results" && results && (
              <div id="report-content" className="grid grid-cols-1 xl:grid-cols-12 gap-lg lg:gap-gutter p-4 md:p-0">
                <div className="col-span-1 xl:col-span-9 flex flex-col gap-xl">
                  {/* Dashboard Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md pb-md border-b border-outline-variant/20">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Analysis Report</h2>
                      <p className="font-body-md text-body-md text-on-surface-variant">Reviewing against target job description</p>
                    </div>
                    <div className="text-right flex items-center gap-md" data-html2canvas-ignore>
                      <button onClick={handleDownloadPDF} className="flex items-center gap-xs bg-[#00687a] text-white hover:bg-[#005161] px-md py-sm rounded-lg transition-colors shadow-sm font-label-md">
                        <span className="material-symbols-outlined text-sm">download</span> Export PDF
                      </button>
                      <button onClick={() => setStep("jd")} className="flex items-center gap-xs bg-surface-container hover:bg-surface-variant px-sm py-sm rounded-lg transition-colors font-label-md">
                        <span className="material-symbols-outlined text-sm">refresh</span> Re-analyze
                      </button>
                    </div>
                  </div>

                  {/* Expanded Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                    <div className="bg-white rounded-xl p-md border border-surface-container-high ambient-shadow-lvl1 flex flex-col items-center justify-center relative overflow-hidden card-top-accent-teal row-span-2 col-span-2">
                      <h3 className="font-label-md text-label-md text-on-surface-variant mb-md self-start w-full">Overall Match Score</h3>
                      <div className="relative w-32 h-32 flex items-center justify-center mb-sm">
                        <svg className="circular-progress w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                          <circle className="text-secondary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (results.atsScore || 0)) / 100} strokeLinecap="round" strokeWidth="8"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-display-lg text-display-lg text-primary tracking-tighter">{results.atsScore || 0}<span className="text-xl">%</span></span>
                        </div>
                      </div>
                      {isStructured && s.letter_grade && <span className="font-title-md text-title-md text-primary">Grade: {s.letter_grade}</span>}
                    </div>

                    {isStructured && s.section_scores && (
                      <>
                        <div className="bg-white rounded-xl p-md border border-surface-container-high ambient-shadow-lvl1 card-top-accent-blue flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-sm">
                            <span className="material-symbols-outlined text-[#3b82f6] bg-[#eff6ff] p-xs rounded-lg">troubleshoot</span>
                            <span className="font-title-md text-title-md font-bold text-primary">{s.section_scores.skills_match || 0}%</span>
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-primary mb-xs">Skills Match</h4>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-md border border-surface-container-high ambient-shadow-lvl1 card-top-accent-yellow flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-sm">
                            <span className="material-symbols-outlined text-[#b07b00] bg-[#fff8e6] p-xs rounded-lg">work</span>
                            <span className="font-title-md text-title-md font-bold text-primary">{s.section_scores.experience_relevance || 0}%</span>
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-primary mb-xs">Experience Fit</h4>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-md border border-surface-container-high ambient-shadow-lvl1 card-top-accent-teal flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-sm">
                            <span className="material-symbols-outlined text-secondary bg-surface-container p-xs rounded-lg">key</span>
                            <span className="font-title-md text-title-md font-bold text-primary">{s.section_scores.keyword_optimization || 0}%</span>
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-primary mb-xs">Keyword Usage</h4>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-md border border-surface-container-high ambient-shadow-lvl1 card-top-accent-red flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-sm">
                            <span className="material-symbols-outlined text-error bg-error-container p-xs rounded-lg">format_paint</span>
                            <span className="font-title-md text-title-md font-bold text-primary">{s.section_scores.formatting_quality || 0}%</span>
                          </div>
                          <div>
                            <h4 className="font-label-md text-label-md text-primary mb-xs">Format Quality</h4>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Comprehensive Action Plan (Recommendations & Improvements) */}
                  {isStructured && (s.optimization_tips?.length > 0 || s.bullet_point_improvements?.length > 0) && (
                    <div className="bg-white rounded-xl border border-surface-container-high ambient-shadow-lvl1 overflow-hidden">
                      <div className="bg-surface p-md border-b border-surface-container-high flex justify-between items-center">
                        <h3 className="font-title-md text-title-md text-primary flex items-center gap-xs">
                          <span className="material-symbols-outlined">checklist</span> Comprehensive Action Plan
                        </h3>
                      </div>
                      <div className="p-md flex flex-col gap-sm">
                        {/* Optimization Tips */}
                        {s.optimization_tips?.map((tip, i) => (
                          <div key={`tip-${i}`} className="flex items-start gap-md p-md bg-inverse-on-surface border border-surface-variant rounded-lg">
                            <div className="mt-1">
                              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-xs mb-xs">
                                <span className="font-label-md text-label-md text-secondary font-bold uppercase tracking-wide text-xs">Optimization</span>
                              </div>
                              <p className="font-body-md text-primary">{tip}</p>
                            </div>
                          </div>
                        ))}

                        {/* Bullet Rewrites */}
                        {s.bullet_point_improvements?.map((item, i) => (
                          <div key={`bullet-${i}`} className="flex items-start gap-md p-md bg-[#fff8e6] border border-[#f5d070]/30 rounded-lg">
                            <div className="mt-1">
                              <span className="material-symbols-outlined text-[#b07b00]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center gap-xs mb-xs">
                                <span className="font-label-md text-label-md text-[#b07b00] font-bold uppercase tracking-wide text-xs">Bullet Rewrite</span>
                              </div>
                              <h4 className="font-body-md text-primary font-medium mb-1">{item.reason}</h4>
                              <div className="mt-sm bg-white p-sm rounded border border-surface-container-high text-caption font-mono text-on-surface-variant">
                                Original: {item.original}<br/><br/>
                                <span className="text-secondary">AI Suggestion: {item.suggested}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills & Keywords */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                    {/* Missing Skills */}
                    {isStructured && s.missing_skills?.length > 0 && (
                      <div className="bg-white rounded-xl border border-surface-container-high ambient-shadow-lvl1 overflow-hidden flex flex-col">
                        <div className="bg-surface p-md border-b border-surface-container-high flex justify-between items-center">
                          <h3 className="font-title-md text-title-md text-primary flex items-center gap-xs">
                            <span className="material-symbols-outlined">psychology</span> Missing Skills to Add
                          </h3>
                        </div>
                        <div className="p-md flex flex-col gap-md flex-grow">
                          {s.missing_skills.map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-surface-container-high pb-sm last:border-0">
                              <div>
                                <h4 className="font-body-md font-medium text-primary flex items-center gap-xs">
                                  <span className="material-symbols-outlined text-error text-sm">cancel</span> 
                                  {typeof item === "string" ? item : item.skill}
                                </h4>
                                {typeof item === "object" && item.suggestion && (
                                  <p className="font-caption text-on-surface-variant mt-1">{item.suggestion}</p>
                                )}
                              </div>
                              {typeof item === "object" && item.priority && (
                                <span className={`font-label-md font-bold text-xs uppercase px-2 py-1 rounded border ${item.priority === 'critical' ? 'text-error border-error/30 bg-error/10' : 'text-[#b07b00] border-[#b07b00]/30 bg-[#fff8e6]'}`}>
                                  {item.priority}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Verbs Analysis */}
                    {isStructured && s.action_verb_analysis && (
                      <div className="bg-white rounded-xl border border-surface-container-high ambient-shadow-lvl1 overflow-hidden flex flex-col">
                        <div className="bg-surface p-md border-b border-surface-container-high flex justify-between items-center">
                          <h3 className="font-title-md text-title-md text-primary flex items-center gap-xs">
                            <span className="material-symbols-outlined">record_voice_over</span> Tone & Action Verbs
                          </h3>
                        </div>
                        <div className="p-md flex flex-col gap-md flex-grow">
                          {s.action_verb_analysis.strong_verbs_used?.length > 0 && (
                            <div>
                              <span className="font-caption text-on-surface-variant block mb-2">Strong verbs detected:</span>
                              <div className="flex flex-wrap gap-2">
                                {s.action_verb_analysis.strong_verbs_used.map((v, i) => (
                                  <span key={i} className="bg-surface-container text-secondary px-2 py-1 rounded text-xs font-label-md border border-secondary/20">{v}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {s.action_verb_analysis.suggested_verbs?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-surface-container-high">
                              <span className="font-caption text-on-surface-variant block mb-2">Consider using more impactful verbs:</span>
                              <div className="flex flex-wrap gap-2">
                                {s.action_verb_analysis.suggested_verbs.map((v, i) => (
                                  <span key={i} className="bg-inverse-on-surface text-[#004e5c] px-2 py-1 rounded text-xs font-label-md border border-outline-variant/30">{v}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-span-1 xl:col-span-3 flex flex-col gap-lg">
                  <div className="bg-white rounded-xl border border-surface-container-high ambient-shadow-lvl1 overflow-hidden sticky top-lg">
                    <div className="bg-surface p-md border-b border-surface-container-high flex justify-between items-center">
                      <h3 className="font-title-md text-title-md text-primary flex items-center gap-xs">
                        <span className="material-symbols-outlined">target</span> Overall Assessment
                      </h3>
                    </div>
                    <div className="p-md flex flex-col gap-md">
                      <p className="font-body-md text-on-surface-variant">{isStructured ? s.overall_assessment : results.suggestions}</p>
                      
                      {results.keywordStats && (
                        <div className="mt-4 pt-4 border-t border-surface-container-high">
                          <h5 className="font-label-md text-label-md text-on-surface-variant mb-sm">Keyword Stats</h5>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="font-caption text-on-surface-variant">Matched</span>
                              <span className="font-label-md text-secondary font-bold">{results.keywordStats.matchedCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-caption text-on-surface-variant">Missing</span>
                              <span className="font-label-md text-error font-bold">{results.keywordStats.missingCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default YourResumes;
