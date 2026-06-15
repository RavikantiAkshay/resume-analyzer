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

  const addEducation = () => {
    setActiveResume({
      ...activeResume,
      education: [...(activeResume.education || []), { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }]
    });
  };

  const updateEducation = (index, field, value) => {
    const updated = [...activeResume.education];
    updated[index][field] = value;
    setActiveResume({ ...activeResume, education: updated });
  };

  const updateSkills = (skillsString) => {
    // split by comma and map to array
    const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s);
    setActiveResume({ ...activeResume, skills: skillsArray });
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

                    {/* Education */}
                    <section>
                      <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
                        <h3 className="font-title-lg text-primary">Education</h3>
                        <button onClick={addEducation} className="text-secondary flex items-center gap-1 font-label-md"><span className="material-symbols-outlined text-sm">add</span> Add</button>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {activeResume.education?.map((edu, i) => (
                          <div key={i} className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">School</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={edu.school || ""} onChange={e => updateEducation(i, "school", e.target.value)} /></div>
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Degree</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={edu.degree || ""} onChange={e => updateEducation(i, "degree", e.target.value)} /></div>
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Field of Study</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={edu.fieldOfStudy || ""} onChange={e => updateEducation(i, "fieldOfStudy", e.target.value)} /></div>
                              <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Start Date</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white placeholder-gray-400" placeholder="e.g. Sep 2018" value={edu.startDate || ""} onChange={e => updateEducation(i, "startDate", e.target.value)} /></div>
                                <div><label className="block text-xs font-bold text-on-surface-variant mb-1">End Date</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white placeholder-gray-400" placeholder="e.g. May 2022" value={edu.endDate || ""} onChange={e => updateEducation(i, "endDate", e.target.value)} /></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Skills */}
                    <section>
                      <h3 className="font-title-lg text-primary mb-4 border-b border-outline-variant/30 pb-2">Skills</h3>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-1">Comma-separated skills</label>
                        <textarea 
                          rows="3" 
                          className="w-full p-2 border border-outline-variant/40 rounded bg-surface" 
                          placeholder="e.g. React, Node.js, Python, AWS" 
                          value={activeResume.skills?.join(', ') || ""} 
                          onChange={e => updateSkills(e.target.value)} 
                        />
                      </div>
                    </section>

                  </div>
                </div>

                {/* Live Preview Panel - Modern 2-Column Professional Design */}
                <div className="bg-[#f0f0f0] rounded-xl border border-outline-variant/20 shadow-level-1 overflow-hidden hidden xl:flex flex-col h-full items-center py-4">
                  <div className="bg-white w-full max-w-[8.5in] aspect-[8.5/11] shadow-md overflow-hidden flex flex-col font-sans" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                    
                    {/* Header Top Bar */}
                    <div className="bg-[#2b3a4a] text-white p-8">
                      <h1 className="text-4xl font-bold tracking-wider uppercase mb-1">{activeResume.personalInfo?.fullName || "Your Name"}</h1>
                      {activeResume.personalInfo?.location && <div className="text-[#a5b4fc] text-lg font-medium">{activeResume.personalInfo.location}</div>}
                    </div>

                    <div className="flex flex-row flex-grow h-full">
                      
                      {/* Left Sidebar (Contact, Education, Skills) */}
                      <div className="w-1/3 bg-[#f4f6f8] p-6 border-r border-gray-200 flex flex-col gap-8">
                        {/* Contact section */}
                        <div>
                          <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-[#2b3a4a] pb-1 mb-4 text-sm">Contact</h2>
                          <div className="flex flex-col gap-3 text-sm text-gray-700">
                            {activeResume.personalInfo?.phone && <div className="flex items-start break-all"><strong>Phone:</strong> <br/>{activeResume.personalInfo.phone}</div>}
                            {activeResume.personalInfo?.email && <div className="flex items-start break-all"><strong>Email:</strong> <br/>{activeResume.personalInfo.email}</div>}
                            {activeResume.personalInfo?.linkedin && <div className="flex items-start break-all"><strong>LinkedIn:</strong> <br/>{activeResume.personalInfo.linkedin}</div>}
                            {activeResume.personalInfo?.portfolio && <div className="flex items-start break-all"><strong>Portfolio:</strong> <br/>{activeResume.personalInfo.portfolio}</div>}
                          </div>
                        </div>

                        {/* Education section */}
                        {activeResume.education && activeResume.education.length > 0 && (
                          <div>
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-[#2b3a4a] pb-1 mb-4 text-sm">Education</h2>
                            <div className="flex flex-col gap-4">
                              {activeResume.education.map((edu, i) => (
                                <div key={i} className="text-sm">
                                  <div className="font-bold text-gray-800 leading-tight">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</div>
                                  <div className="text-gray-600 mt-1">{edu.school}</div>
                                  <div className="text-gray-500 text-xs italic mt-0.5">{edu.startDate} {edu.startDate && edu.endDate && '-'} {edu.endDate}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills section */}
                        {activeResume.skills && activeResume.skills.length > 0 && (
                          <div>
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-[#2b3a4a] pb-1 mb-4 text-sm">Skills</h2>
                            <ul className="list-none flex flex-col gap-1 text-sm text-gray-700">
                              {activeResume.skills.map((skill, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-[#2b3a4a] rounded-full"></span>
                                  <span>{skill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right Main Content (Summary, Experience) */}
                      <div className="w-2/3 p-6 bg-white flex flex-col gap-6">
                        
                        {/* Summary / Profile (if exists) */}
                        {activeResume.personalInfo?.summary && (
                          <div>
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-gray-200 pb-1 mb-3 text-lg">Profile</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">{activeResume.personalInfo.summary}</p>
                          </div>
                        )}

                        {/* Experience */}
                        {activeResume.experience && activeResume.experience.length > 0 && (
                          <div>
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-gray-200 pb-1 mb-4 text-lg">Professional Experience</h2>
                            <div className="flex flex-col gap-5">
                              {activeResume.experience.map((exp, i) => (
                                <div key={i}>
                                  <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-800 text-base">{exp.role || "Role"}</h3>
                                    <span className="text-xs font-semibold text-[#2b3a4a] whitespace-nowrap ml-4">
                                      {exp.startDate} {exp.startDate && '-'} {exp.current ? "Present" : exp.endDate}
                                    </span>
                                  </div>
                                  <div className="text-gray-600 font-medium italic text-sm mb-2">{exp.company || "Company"}</div>
                                  
                                  {exp.bullets && exp.bullets.length > 0 ? (
                                    <ul className="list-disc pl-4 text-gray-700 text-sm space-y-1.5 marker:text-gray-400">
                                      {exp.bullets.map((b, bIdx) => b.trim() && <li key={bIdx} className="pl-1">{b}</li>)}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-400 text-xs italic">{exp.description || "Generate STAR bullets to see them here."}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
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

export default Builder;
