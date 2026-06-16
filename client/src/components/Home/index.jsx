import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("isAuthenticated");
    setIsLoggedIn(!!token);
  }, []);

  const ctaPath = isLoggedIn ? "/your-resumes" : "/register";

  return (
    <main className="bg-background text-on-background font-body-md antialiased overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-xxl pb-xxl px-gutter max-w-container-max mx-auto overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-secondary-container/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[400px] h-[400px] bg-primary-container/10 rounded-full blur-3xl -z-10"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xxl items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 flex flex-col space-y-lg">
            <div className="inline-flex items-center space-x-2 bg-surface-container-low text-secondary font-label-md px-3 py-1.5 rounded-full w-max border border-outline-variant/30">
              <span className="material-symbols-outlined text-sm" data-icon="auto_awesome">auto_awesome</span>
              <span>AI-Powered ATS Analysis</span>
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[56px] md:leading-[64px] font-bold text-[#0f172a] tracking-tight">
              Get Past the Bots.<br/>
              <span className="text-secondary">Land the Interview.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Upload your resume to see how it performs against Applicant Tracking Systems (ATS) and get instant feedback to improve your score.
            </p>
            
            {/* CTA disguised as Dropzone */}
            <div className="mt-lg">
              <Link to={ctaPath} className="block">
                <div className="border-2 border-dashed border-secondary/40 bg-secondary/5 rounded-xl p-8 text-center transition-all hover:border-secondary hover:bg-secondary/10 cursor-pointer shadow-level-2 group" id="hero-upload-zone">
                  <span className="material-symbols-outlined text-4xl text-secondary mb-4 group-hover:-translate-y-1 transition-transform" data-icon="upload_file">upload_file</span>
                  <h3 className="font-title-md text-title-md font-semibold text-[#0f172a] mb-2">{isLoggedIn ? 'Go to Dashboard' : 'Upload Resume'}</h3>
                  <p className="font-caption text-caption text-on-surface-variant mb-4">Click to {isLoggedIn ? 'start analyzing your resume' : 'get started for free'}.</p>
                  <button className="bg-[#00687a] hover:bg-[#005161] text-white font-label-md px-6 py-2.5 rounded-lg transition-colors shadow-sm">
                    {isLoggedIn ? 'Open Dashboard' : 'Get Started'}
                  </button>
                </div>
              </Link>
              <p className="font-caption text-caption text-center text-on-surface-variant/70 mt-3 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]" data-icon="lock">lock</span>
                Secure &amp; private. We don't share your data.
              </p>
            </div>
          </div>
          
          {/* Hero Visual / Resume Builder Teaser */}
          <div className="lg:col-span-6 relative hidden md:block">
            <div className="bg-white rounded-xl shadow-level-3 border border-outline-variant/20 overflow-hidden relative z-10 transform transition-transform hover:-translate-y-2 duration-500 flex flex-col h-full min-h-[400px]">
              <div className="h-1 bg-secondary w-full"></div>
              
              <div className="p-8 flex-grow flex flex-col justify-center items-center text-center relative overflow-hidden">
                {/* Background decorative grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                
                <div className="bg-primary-container/30 text-primary font-label-md px-4 py-1.5 rounded-full w-max border border-primary/20 mb-6 z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span>New Feature</span>
                </div>
                
                <div className="relative w-24 h-24 bg-surface-container-low rounded-2xl flex items-center justify-center mb-6 z-10 shadow-sm border border-outline-variant/30 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'wght' 300" }}>draw</span>
                  <div className="absolute -bottom-2 -right-2 bg-[#0f172a] text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-md">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </div>
                </div>
                
                <h3 className="font-display-lg text-3xl font-bold text-[#0f172a] mb-4 z-10">
                  AI Resume Builder
                </h3>
                
                <p className="font-body-md text-on-surface-variant max-w-sm mb-8 z-10">
                  Craft an ATS-perfect resume from scratch using our intelligent builder. Convert raw experience into high-impact STAR bullets instantly.
                </p>
                
                <div className="w-full flex justify-center z-10">
                  <Link to={ctaPath} className="bg-[#0f172a] hover:bg-[#00687a] text-white font-label-md px-6 py-3 rounded-lg transition-colors shadow-sm flex items-center gap-2 border border-transparent">
                    <span className="material-symbols-outlined text-sm">edit_document</span>
                    Start Building Now
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Floating decoration */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-level-2 border border-outline-variant/20 z-20 animate-[bounce_4s_ease-in-out_infinite]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" data-icon="brush">brush</span>
                <span className="font-label-md text-label-md text-[#0f172a]">Smart Templates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-xxl px-gutter max-w-container-max mx-auto bg-white/50 border-t border-b border-outline-variant/20 relative" id="how-it-works">
        <div className="text-center mb-xl">
          <h2 className="font-headline-lg md:text-headline-lg font-bold text-[#0f172a] mb-sm">How it Works</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Three simple steps to optimize your resume and increase your chances of landing the interview.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-outline-variant/30 z-0"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-level-2 border border-outline-variant/20 mb-6 group-hover:border-secondary transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#0f172a]" data-icon="upload_file">upload_file</span>
              <div className="absolute top-0 right-4 w-6 h-6 bg-[#00687a] text-white rounded-full flex items-center justify-center font-label-md text-xs shadow-sm">1</div>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">Upload or Build</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Upload an existing PDF or start from scratch using our AI Builder.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-level-2 border border-outline-variant/20 mb-6 group-hover:border-secondary transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#0f172a]" data-icon="auto_fix">auto_fix</span>
              <div className="absolute top-0 right-4 w-6 h-6 bg-[#00687a] text-white rounded-full flex items-center justify-center font-label-md text-xs shadow-sm">2</div>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">AI Optimize</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Our AI helps you write high-impact STAR bullets for your experience.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-level-2 border border-outline-variant/20 mb-6 group-hover:border-secondary transition-colors">
              <span className="material-symbols-outlined text-4xl text-[#0f172a]" data-icon="query_stats">query_stats</span>
              <div className="absolute top-0 right-4 w-6 h-6 bg-[#00687a] text-white rounded-full flex items-center justify-center font-label-md text-xs shadow-sm">3</div>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">ATS Analyze</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Scan your final resume against a Job Description to ensure it passes ATS filters.</p>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-xxl px-gutter max-w-container-max mx-auto" id="features-section">
        <div className="mb-xl">
          <h2 className="font-headline-lg md:text-headline-lg font-bold text-[#0f172a] mb-sm">Comprehensive Analysis</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Everything you need to ensure your resume reaches a human reader.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg auto-rows-[240px]">
          
          <div className="md:col-span-8 bg-white rounded-xl p-8 border border-outline-variant/20 shadow-level-1 hover:shadow-level-2 transition-shadow flex flex-col sm:flex-row gap-6 relative overflow-hidden">
            <div className="flex-1 flex flex-col justify-center z-10">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary" data-icon="score">score</span>
              </div>
              <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">ATS Compatibility Score</h3>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">Get a definitive score based on parsability, keyword matching, and structural integrity. Know exactly where you stand before you apply.</p>
            </div>
            <div className="hidden sm:flex flex-1 items-center justify-center z-10">
              <div className="w-full max-w-[200px] h-32 bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-end p-4 gap-2">
                <div className="w-full bg-[#00687a]/20 rounded-t-sm h-[40%] relative"><div className="absolute bottom-full w-full text-center text-xs text-on-surface-variant mb-1">Skills</div></div>
                <div className="w-full bg-[#00687a]/60 rounded-t-sm h-[70%] relative"><div className="absolute bottom-full w-full text-center text-xs text-on-surface-variant mb-1">Keywords</div></div>
                <div className="w-full bg-[#00687a] rounded-t-sm h-[90%] relative"><div className="absolute bottom-full w-full text-center text-xs text-[#0f172a] font-bold mb-1">Impact</div></div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-4 bg-white rounded-xl p-8 border border-outline-variant/20 shadow-level-1 hover:shadow-level-2 transition-shadow flex flex-col justify-center relative overflow-hidden">
            <div className="bg-primary-container/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#0f172a]" data-icon="edit_document">edit_document</span>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">Resume Builder & AI</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Use our live-preview Builder to craft your resume. One click instantly converts raw experience into high-impact STAR bullets.</p>
          </div>
          
          <div className="md:col-span-5 bg-[#0f172a] rounded-xl p-8 border border-outline-variant/20 shadow-level-2 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#00687a]/20 rounded-bl-full blur-xl"></div>
            <div className="bg-[#00687a]/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 border border-[#00687a]/50">
              <span className="material-symbols-outlined text-white" data-icon="vpn_key">vpn_key</span>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-white mb-2">Keyword Optimization</h3>
            <p className="font-body-md text-body-md text-white/80 text-sm mb-4">Match your resume against specific job descriptions to uncover missing critical hard skills.</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="bg-white/10 px-2 py-1 rounded text-xs font-label-md border border-white/20">Python</span>
              <span className="bg-white/10 px-2 py-1 rounded text-xs font-label-md border border-white/20">AWS</span>
              <span className="bg-error/20 text-error-container px-2 py-1 rounded text-xs font-label-md border border-error/30 line-through">Docker</span>
            </div>
          </div>
          
          <div className="md:col-span-7 bg-white rounded-xl p-8 border border-outline-variant/20 shadow-level-1 hover:shadow-level-2 transition-shadow flex flex-col justify-center">
            <div className="bg-surface-container-highest w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-secondary" data-icon="insights">insights</span>
            </div>
            <h3 className="font-title-md text-title-md font-bold text-[#0f172a] mb-2">Actionable Insights</h3>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm mb-4">We don't just give you a score. We provide granular feedback on missing skills and tone optimization.</p>
            <div className="bg-surface p-3 rounded-lg border border-outline-variant/30 border-l-2 border-l-secondary text-sm font-body-md text-[#0f172a]">
              <span className="font-bold">Suggestion:</span> "Managed team of 5" → "Directed a cross-functional team of 5, increasing output by 20%."
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-low border-t border-outline-variant w-full mt-xxl">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-gutter py-xl max-w-container-max mx-auto">
          <div className="font-title-md text-title-md font-bold text-primary mb-4 md:mb-0">
            ResumeAI
          </div>
          <div className="font-caption text-caption text-on-surface-variant mb-4 md:mb-0">
            © 2026 ResumeAI Analyzer. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/contact" className="font-caption text-caption text-on-surface-variant/70 hover:text-secondary transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
