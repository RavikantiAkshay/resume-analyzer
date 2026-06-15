import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const Builder = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  
  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (res.ok && data.success) {
        setResumes(data.data);
        if (data.data.length > 0 && !activeResume) {
          setActiveResume(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createEmptyResume = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ title: "New Resume", experience: [], education: [], skills: [] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResumes([data.data, ...resumes]);
        setActiveResume(data.data);
      } else {
        setError(data.message || "Failed to create resume.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newResumes = resumes.filter(r => r._id !== id);
        setResumes(newResumes);
        if (activeResume?._id === id) setActiveResume(null);
      } else {
        setError(data.message || "Failed to delete resume.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch(`${API_URL}/builder/parse-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Create new resume with the structured data
        const createRes = await fetch(`${API_URL}/builder`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ ...data.data, title: "Imported Resume" })
        });
        const createData = await createRes.json();
        if (createData.success) {
          setResumes([createData.data, ...resumes]);
          setActiveResume(createData.data);
        }
      } else {
        setError(data.message || "Failed to parse resume");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveResume = async () => {
    if (!activeResume) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder/${activeResume._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(activeResume)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResumes(resumes.map(r => r._id === activeResume._id ? data.data : r));
        setActiveResume(data.data);
        alert("Resume Saved!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBullets = async (rawText, expIndex) => {
    if (!rawText) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder/generate-bullets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ rawExperience: rawText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedExp = [...activeResume.experience];
        updatedExp[expIndex].bullets = data.data;
        setActiveResume({ ...activeResume, experience: updatedExp });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setActiveResume({
      ...activeResume,
      personalInfo: { ...activeResume.personalInfo, [field]: value }
    });
  };

  const addExperience = () => {
    setActiveResume({
      ...activeResume,
      experience: [...(activeResume.experience || []), { company: "", role: "", description: "", bullets: [] }]
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...activeResume.experience];
    updated[index][field] = value;
    setActiveResume({ ...activeResume, experience: updated });
  };

  return (
    <div className="flex h-screen overflow-hidden font-body-md text-body-md bg-surface text-on-surface">
      {/* SideNavBar (Same as Dashboard) */}
      <nav className={`fixed lg:relative lg:flex flex-col w-64 h-screen p-md gap-sm bg-surface-container-low border-r border-outline-variant/20 z-40 flex-shrink-0 transition-transform transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-xl flex items-center justify-between gap-sm px-sm mt-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>draw</span>
            <div>
              <h1 className="font-title-md text-title-md font-black text-primary">ResumeAI</h1>
              <p className="font-caption text-caption text-on-surface-variant">Builder</p>
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
          <Link to="/your-resumes" className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-variant/30 rounded-lg group transition-all duration-300">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">upload_file</span>
            <span className="font-label-md text-label-md">ATS Analysis</span>
          </Link>
          <div className="flex items-center gap-md px-md py-sm bg-secondary-container text-on-secondary-container font-bold rounded-lg transition-all duration-300">
            <span className="material-symbols-outlined">edit_document</span>
            <span className="font-label-md text-label-md">Resume Builder</span>
          </div>
          
          <div className="mt-8 mb-2 px-md">
            <h4 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-bold">Your Drafts</h4>
          </div>
          {resumes.map(r => (
            <div key={r._id} className={`flex items-center justify-between px-md py-2 rounded-lg text-left group ${activeResume?._id === r._id ? 'bg-surface-variant/50 border-l-4 border-secondary' : 'hover:bg-surface-variant/30 border-l-4 border-transparent'}`}>
              <button onClick={() => { setActiveResume(r); setMobileMenuOpen(false); }} className="font-label-md line-clamp-1 flex-grow text-left">
                {r.title || "Untitled"}
              </button>
              <button onClick={() => deleteResume(r._id)} className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
          
          <button onClick={() => setActiveResume(null)} className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-lg hover:bg-surface-variant">
            <span className="material-symbols-outlined text-sm">add</span> New Resume
          </button>
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
        <header className="flex lg:hidden items-center justify-between p-md bg-surface border-b border-outline-variant/20 z-30">
          <div className="flex items-center gap-sm">
            <button onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined text-secondary">menu</span>
            </button>
            <span className="font-title-md text-title-md font-bold text-primary">ResumeAI Builder</span>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-md lg:p-lg bg-surface">
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span><span className="font-body-md">{error}</span>
              </div>
            )}

            {!activeResume ? (
              <div className="flex flex-col items-center justify-center h-full mt-24 text-center">
                <span className="material-symbols-outlined text-6xl text-secondary mb-6">edit_document</span>
                <h2 className="font-headline-lg text-primary mb-4">Let's Build Your Resume</h2>
                <div className="flex gap-4">
                  <button onClick={createEmptyResume} className="bg-[#00687a] text-white px-6 py-3 rounded-lg font-label-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">add</span> Start from Scratch
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-surface-container border border-outline-variant/40 px-6 py-3 rounded-lg font-label-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">upload</span> Auto-Fill from PDF
                  </button>
                  <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} hidden />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[calc(100vh-140px)] overflow-hidden">
                {/* Editor Panel */}
                <div className="bg-white rounded-xl border border-outline-variant/20 shadow-level-1 overflow-hidden flex flex-col h-full">
                  <div className="bg-surface-container-low p-md border-b border-outline-variant/20 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
                    <input 
                      type="text" 
                      value={activeResume.title} 
                      onChange={e => setActiveResume({...activeResume, title: e.target.value})} 
                      className="bg-transparent font-headline-md text-primary font-bold outline-none border-b border-transparent focus:border-secondary w-full max-w-[200px]" 
                    />
                    <div className="flex gap-2">
                      <button onClick={saveResume} disabled={loading} className="bg-[#00687a] hover:bg-[#005161] text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2">
                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <><span className="material-symbols-outlined text-sm">save</span> Save</>}
                      </button>
                    </div>
                  </div>

                  <div className="p-xl flex flex-col gap-xl overflow-y-auto flex-grow">
                    {/* Personal Info */}
                    <section>
                      <h3 className="font-title-lg text-primary mb-4 border-b border-outline-variant/30 pb-2">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.fullName || ""} onChange={e => updatePersonalInfo("fullName", e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Email</label><input type="email" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.email || ""} onChange={e => updatePersonalInfo("email", e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Phone</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.phone || ""} onChange={e => updatePersonalInfo("phone", e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">LinkedIn</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.linkedin || ""} onChange={e => updatePersonalInfo("linkedin", e.target.value)} /></div>
                      </div>
                    </section>

                    {/* Experience */}
                    <section>
                      <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
                        <h3 className="font-title-lg text-primary">Experience</h3>
                        <button onClick={addExperience} className="text-secondary flex items-center gap-1 font-label-md"><span className="material-symbols-outlined text-sm">add</span> Add</button>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {activeResume.experience?.map((exp, i) => (
                          <div key={i} className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Company</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={exp.company || ""} onChange={e => updateExperience(i, "company", e.target.value)} /></div>
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Role</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={exp.role || ""} onChange={e => updateExperience(i, "role", e.target.value)} /></div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-secondary mb-1">Raw Experience (What did you do?)</label>
                              <textarea rows="3" className="w-full p-2 border border-outline-variant/40 rounded bg-white mb-2" placeholder="e.g. I made the database faster and managed 3 people" value={exp.description || ""} onChange={e => updateExperience(i, "description", e.target.value)} />
                              <button onClick={() => generateBullets(exp.description, i)} disabled={loading || !exp.description} className="bg-primary-container text-on-primary-container px-4 py-2 rounded font-label-md flex items-center gap-2 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span> Generate STAR Bullets
                              </button>
                            </div>
                            
                            {exp.bullets && exp.bullets.length > 0 && (
                              <div className="bg-white p-4 rounded border border-outline-variant/30">
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Final Bullet Points</label>
                                <ul className="list-disc pl-5 space-y-2">
                                  {exp.bullets.map((b, bIdx) => (
                                    <li key={bIdx} className="text-sm text-primary flex gap-2">
                                      <input type="text" className="w-full bg-transparent border-b border-transparent hover:border-outline-variant/50 focus:border-secondary outline-none" value={b} onChange={e => {
                                        const newBullets = [...exp.bullets];
                                        newBullets[bIdx] = e.target.value;
                                        updateExperience(i, "bullets", newBullets);
                                      }} />
                                      <button onClick={() => {
                                        const newBullets = exp.bullets.filter((_, idx) => idx !== bIdx);
                                        updateExperience(i, "bullets", newBullets);
                                      }} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-sm">close</span></button>
                                    </li>
                                  ))}
                                </ul>
                                <button onClick={() => updateExperience(i, "bullets", [...exp.bullets, ""])} className="mt-2 text-xs font-bold text-secondary flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">add</span> Add Bullet
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>

                {/* Live Preview Panel */}
                <div className="bg-[#f0f0f0] rounded-xl border border-outline-variant/20 shadow-level-1 overflow-hidden hidden xl:flex flex-col h-full items-center py-4">
                  <div className="bg-white w-full max-w-[8.5in] aspect-[8.5/11] shadow-md p-8 overflow-y-auto" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                    {/* Resume Header */}
                    <div className="text-center border-b border-gray-300 pb-4 mb-4">
                      <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-wider">{activeResume.personalInfo?.fullName || "Your Name"}</h1>
                      <div className="text-sm text-gray-600 mt-2 flex justify-center gap-4 flex-wrap">
                        {activeResume.personalInfo?.email && <span>{activeResume.personalInfo.email}</span>}
                        {activeResume.personalInfo?.phone && <span>{activeResume.personalInfo.phone}</span>}
                        {activeResume.personalInfo?.linkedin && <span>{activeResume.personalInfo.linkedin}</span>}
                      </div>
                    </div>
                    
                    {/* Resume Experience */}
                    {activeResume.experience && activeResume.experience.length > 0 && (
                      <div className="mb-4">
                        <h2 className="text-lg font-serif font-bold text-gray-800 border-b border-gray-300 mb-2 uppercase tracking-wide">Experience</h2>
                        {activeResume.experience.map((exp, i) => (
                          <div key={i} className="mb-3">
                            <div className="flex justify-between items-baseline font-bold text-gray-800">
                              <span>{exp.role || "Role"}</span>
                              <span className="text-sm font-normal">{exp.startDate} - {exp.current ? "Present" : exp.endDate || "Date"}</span>
                            </div>
                            <div className="italic text-gray-600 mb-1">{exp.company || "Company"}</div>
                            {exp.bullets && exp.bullets.length > 0 ? (
                              <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                {exp.bullets.map((b, bIdx) => b.trim() && <li key={bIdx}>{b}</li>)}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm italic">{exp.description || "Generate STAR bullets to see them here."}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

export default Builder;
