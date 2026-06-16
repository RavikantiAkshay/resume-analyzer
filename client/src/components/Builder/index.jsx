import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";

const API_URL = "http://localhost:5000";

const Builder = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  
  const getToken = () => localStorage.getItem("isAuthenticated");

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleLogout = async () => {
    try { await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); } catch (err) {}
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder`, {
        credentials: "include",
        
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
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json", },
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
        credentials: "include",
        method: "DELETE",
        
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
        credentials: "include",
        method: "POST",
        
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Create new resume with the structured data
        const createRes = await fetch(`${API_URL}/builder`, {
        credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json", },
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
        credentials: "include",
        method: "PUT",
        headers: { "Content-Type": "application/json", },
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

  const generateBullets = async (rawText, index, sectionType = "experience") => {
    if (!rawText) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/builder/generate-bullets`, {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ rawExperience: rawText })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedSection = [...activeResume[sectionType]];
        updatedSection[index].bullets = data.data;
        setActiveResume({ ...activeResume, [sectionType]: updatedSection });
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

  const addProject = () => {
    setActiveResume({
      ...activeResume,
      projects: [...(activeResume.projects || []), { title: "", link: "", description: "", bullets: [] }]
    });
  };

  const updateProject = (index, field, value) => {
    const updated = [...(activeResume.projects || [])];
    updated[index][field] = value;
    setActiveResume({ ...activeResume, projects: updated });
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
    // split by comma and map to array without filtering out empty strings to preserve trailing commas during typing
    const skillsArray = skillsString.split(',').map(s => s.trimStart());
    setActiveResume({ ...activeResume, skills: skillsArray });
  };

  const addCustomSection = () => {
    setActiveResume({
      ...activeResume,
      customSections: [...(activeResume.customSections || []), { title: "New Section", body: "" }]
    });
  };

  const updateCustomSection = (index, field, value) => {
    const updated = [...(activeResume.customSections || [])];
    updated[index][field] = value;
    setActiveResume({ ...activeResume, customSections: updated });
  };

  const deleteCustomSection = (index) => {
    const updated = activeResume.customSections.filter((_, i) => i !== index);
    setActiveResume({ ...activeResume, customSections: updated });
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview-pdf');
    if (!element) return;
    
    // Temporarily remove scaling for crisp 1:1 PDF generation
    element.classList.remove('transform', 'scale-[0.7]');
    
    const opt = {
      margin:       0,
      filename:     `${activeResume.personalInfo?.fullName || 'resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore scaling after generation
      element.classList.add('transform', 'scale-[0.7]');
    });
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

        <div className="flex-grow flex flex-col h-full bg-surface-container-lowest">
          {error && (
            <div className="max-w-4xl mx-auto w-full mt-4">
              <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined">error</span><span className="font-body-md">{error}</span>
              </div>
            </div>
          )}

          {!activeResume ? (
            <div className="flex-grow flex items-center justify-center p-md lg:p-lg bg-[#f0f4f8]">
              <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-outline-variant/10 p-12 flex flex-col items-center text-center transform transition-all hover:scale-[1.01] duration-300">
                <div className="bg-surface-container-low w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-[#00687a]">edit_document</span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Let's Build Your Resume</h2>
                <p className="text-gray-500 mb-10 text-lg max-w-lg">Create a professional, ATS-friendly resume from scratch or auto-fill your details using an existing PDF.</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button onClick={createEmptyResume} className="bg-gradient-to-r from-[#00687a] to-[#005161] hover:from-[#005161] hover:to-[#004250] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <span className="material-symbols-outlined">add</span> Start from Scratch
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-0.5">
                    <span className="material-symbols-outlined">upload</span> Auto-Fill from PDF
                  </button>
                  <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} hidden />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-row h-full overflow-hidden w-full">
              {/* Editor Panel */}
              <div className="w-full xl:w-[45%] bg-white border-r border-outline-variant/30 flex flex-col h-full relative">
                  <div className="bg-surface-container-low p-md border-b border-outline-variant/20 flex justify-between items-center sticky top-0 z-10 flex-shrink-0">
                    <input 
                      type="text" 
                      value={activeResume.title} 
                      onChange={e => setActiveResume({...activeResume, title: e.target.value})} 
                      className="bg-transparent font-headline-md text-primary font-bold outline-none border-b border-transparent focus:border-secondary w-full max-w-[200px]" 
                    />
                    <div className="flex gap-2">
                      <button onClick={handleDownloadPDF} className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-label-md flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span> Download PDF
                      </button>
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
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">GitHub</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.github || ""} onChange={e => updatePersonalInfo("github", e.target.value)} /></div>
                        <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Portfolio</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-surface" value={activeResume.personalInfo?.portfolio || ""} onChange={e => updatePersonalInfo("portfolio", e.target.value)} /></div>
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

                    {/* Projects */}
                    <section>
                      <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
                        <h3 className="font-title-lg text-primary">Projects</h3>
                        <button onClick={addProject} className="text-secondary flex items-center gap-1 font-label-md"><span className="material-symbols-outlined text-sm">add</span> Add</button>
                      </div>
                      
                      <div className="flex flex-col gap-6">
                        {activeResume.projects?.map((proj, i) => (
                          <div key={i} className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Project Title</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={proj.title || ""} onChange={e => updateProject(i, "title", e.target.value)} /></div>
                              <div><label className="block text-xs font-bold text-on-surface-variant mb-1">Link</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={proj.link || ""} onChange={e => updateProject(i, "link", e.target.value)} /></div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-secondary mb-1">Raw Description (What did the project do?)</label>
                              <textarea rows="3" className="w-full p-2 border border-outline-variant/40 rounded bg-white mb-2" placeholder="e.g. Built a full stack app using React and Node that helps people..." value={proj.description || ""} onChange={e => updateProject(i, "description", e.target.value)} />
                              <button onClick={() => generateBullets(proj.description, i, "projects")} disabled={loading || !proj.description} className="bg-primary-container text-on-primary-container px-4 py-2 rounded font-label-md flex items-center gap-2 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">auto_awesome</span> Generate STAR Bullets
                              </button>
                            </div>
                            
                            {proj.bullets && proj.bullets.length > 0 && (
                              <div className="bg-white p-4 rounded border border-outline-variant/30">
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Final Bullet Points</label>
                                <ul className="list-disc pl-5 space-y-2">
                                  {proj.bullets.map((b, bIdx) => (
                                    <li key={bIdx} className="text-sm text-primary flex gap-2">
                                      <input type="text" className="w-full bg-transparent border-b border-transparent hover:border-outline-variant/50 focus:border-secondary outline-none" value={b} onChange={e => {
                                        const newBullets = [...proj.bullets];
                                        newBullets[bIdx] = e.target.value;
                                        updateProject(i, "bullets", newBullets);
                                      }} />
                                      <button onClick={() => {
                                        const newBullets = proj.bullets.filter((_, idx) => idx !== bIdx);
                                        updateProject(i, "bullets", newBullets);
                                      }} className="text-on-surface-variant hover:text-error"><span className="material-symbols-outlined text-sm">close</span></button>
                                    </li>
                                  ))}
                                </ul>
                                <button onClick={() => updateProject(i, "bullets", [...proj.bullets, ""])} className="mt-2 text-xs font-bold text-secondary flex items-center gap-1">
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

                    {/* Custom Sections */}
                    <section>
                      <div className="flex justify-between items-center mb-2 border-b border-outline-variant/30 pb-2 mt-8">
                        <h3 className="font-title-lg text-primary">Custom Sections</h3>
                        <button onClick={addCustomSection} className="text-secondary flex items-center gap-1 font-label-md"><span className="material-symbols-outlined text-sm">add</span> Add</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs text-gray-500 flex items-center font-bold">Suggestions:</span>
                        {['Languages', 'Certifications', 'Awards'].map(suggestion => (
                          <button key={suggestion} onClick={() => {
                            setActiveResume({
                              ...activeResume,
                              customSections: [...(activeResume.customSections || []), { title: suggestion, body: "" }]
                            });
                          }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors">
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-col gap-6">
                        {activeResume.customSections?.map((section, i) => (
                          <div key={i} className="p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="w-full pr-4"><label className="block text-xs font-bold text-on-surface-variant mb-1">Section Title</label><input type="text" className="w-full p-2 border border-outline-variant/40 rounded bg-white" value={section.title || ""} onChange={e => updateCustomSection(i, "title", e.target.value)} /></div>
                              <button onClick={() => deleteCustomSection(i)} className="text-error mt-6"><span className="material-symbols-outlined">delete</span></button>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
                              <textarea rows="4" className="w-full p-2 border border-outline-variant/40 rounded bg-white" placeholder="Write the content for this section..." value={section.body || ""} onChange={e => updateCustomSection(i, "body", e.target.value)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                  </div>
                </div>

                {/* Live Preview Panel - Modern 2-Column Professional Design */}
                <div className="bg-[#525659] hidden xl:flex xl:w-[55%] flex-col h-full items-center py-8 overflow-y-auto">
                  
                  {/* Fixed scaling wrapper to prevent text breaking and layout shifting */}
                  <div className="relative" style={{ width: "571px", height: "739px" }}>
                    <div id="resume-preview-pdf" className="absolute top-0 left-0 bg-white shadow-2xl flex flex-col font-sans shrink-0 w-[816px] min-h-[1056px] origin-top-left transform scale-[0.7]">
                    
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
                            {activeResume.personalInfo?.github && <div className="flex items-start break-all"><strong>GitHub:</strong> <br/>{activeResume.personalInfo.github}</div>}
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
                              {activeResume.skills.map((skill, i) => skill.trim() && (
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
                                    <p className="text-gray-400 text-xs italic whitespace-pre-wrap">{exp.description || "Generate STAR bullets to see them here."}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {activeResume.projects && activeResume.projects.length > 0 && (
                          <div>
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-gray-200 pb-1 mb-4 text-lg">Projects</h2>
                            <div className="flex flex-col gap-5">
                              {activeResume.projects.map((proj, i) => (
                                <div key={i}>
                                  <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-800 text-base">{proj.title || "Project Name"}</h3>
                                    <span className="text-xs font-semibold text-[#2b3a4a] whitespace-nowrap ml-4">
                                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{proj.link}</a>}
                                    </span>
                                  </div>
                                  
                                  {proj.bullets && proj.bullets.length > 0 ? (
                                    <ul className="list-disc pl-4 text-gray-700 text-sm space-y-1.5 marker:text-gray-400">
                                      {proj.bullets.map((b, bIdx) => b.trim() && <li key={bIdx} className="pl-1">{b}</li>)}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-400 text-xs italic whitespace-pre-wrap">{proj.description || "Generate STAR bullets to see them here."}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Sections */}
                        {activeResume.customSections?.map((section, i) => section.title && section.body && (
                          <div key={i} className="mt-2">
                            <h2 className="text-[#2b3a4a] font-bold tracking-widest uppercase border-b-2 border-gray-200 pb-1 mb-4 text-lg">{section.title}</h2>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{section.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Builder;
