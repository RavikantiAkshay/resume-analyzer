import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const ctaPath = isLoggedIn ? "/your-resumes" : "/register";

  return (
    <main className="home" id="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__badge animate-slide-up">
            <span className="hero__badge-dot"></span>
            AI-Powered Resume Analysis
          </div>

          <h1 className="hero__title animate-slide-up-delay-1">
            Your resume, scored<br />
            and optimized by AI
          </h1>

          <p className="hero__subtitle animate-slide-up-delay-2">
            Upload your resume, paste a job description, and get an instant ATS
            compatibility score with actionable suggestions to land more interviews.
          </p>

          <div className="hero__actions animate-slide-up-delay-3">
            <Link to={ctaPath} className="btn btn-primary" id="hero-cta">
              {isLoggedIn ? "Go to Dashboard" : "Start Analyzing — Free"}
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/contact" className="btn btn-secondary" id="hero-learn-more">
              Learn More
            </Link>
          </div>

          <div className="hero__stats animate-slide-up-delay-3">
            <div className="hero__stat">
              <span className="hero__stat-number">90%+</span>
              <span className="hero__stat-label">Fortune 500 use ATS</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">75%</span>
              <span className="hero__stat-label">Resumes filtered out</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-number">2x</span>
              <span className="hero__stat-label">More interviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works page-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <p className="section-label">How it works</p>
            <h2 className="heading-lg">Three steps to a better resume</h2>
          </div>

          <div className="steps-grid">
            <div className="step-card card">
              <span className="step-card__number">01</span>
              <h3 className="step-card__title">Upload your resume</h3>
              <p className="step-card__desc">
                Upload your PDF resume. Our parser extracts every detail — skills,
                experience, and keywords — instantly.
              </p>
            </div>

            <div className="step-card card">
              <span className="step-card__number">02</span>
              <h3 className="step-card__title">Get your ATS score</h3>
              <p className="step-card__desc">
                We compare your resume keywords against the job description and
                calculate a precise compatibility score.
              </p>
            </div>

            <div className="step-card card">
              <span className="step-card__number">03</span>
              <h3 className="step-card__title">AI-powered suggestions</h3>
              <p className="step-card__desc">
                Receive detailed, actionable feedback — missing skills, bullet
                point rewrites, and optimization tips from AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features page-section" id="features-section">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Features</p>
            <h2 className="heading-lg">Built for job seekers who<br />mean business</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card card" id="feature-ats-score">
              <div className="feature-card__icon">◎</div>
              <h3 className="feature-card__title">ATS Score</h3>
              <p className="feature-card__desc">
                Keyword-by-keyword comparison between your resume and the job
                description. See exactly what's missing.
              </p>
            </div>

            <div className="feature-card card" id="feature-ai-analysis">
              <div className="feature-card__icon">◆</div>
              <h3 className="feature-card__title">AI Analysis</h3>
              <p className="feature-card__desc">
                Powered by advanced LLMs to give you contextual, human-quality
                suggestions that go beyond simple keyword matching.
              </p>
            </div>

            <div className="feature-card card" id="feature-pdf-parsing">
              <div className="feature-card__icon">▣</div>
              <h3 className="feature-card__title">PDF Parsing</h3>
              <p className="feature-card__desc">
                Upload any PDF resume. Our parser handles multi-page documents,
                tables, columns, and complex layouts.
              </p>
            </div>

            <div className="feature-card card" id="feature-secure">
              <div className="feature-card__icon">◇</div>
              <h3 className="feature-card__title">Secure & Private</h3>
              <p className="feature-card__desc">
                JWT-based authentication. Your resume data is processed in
                real-time and never stored permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section page-section" id="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="heading-lg">Ready to beat the ATS?</h2>
            <p className="text-secondary" style={{ fontSize: "var(--font-lg)", maxWidth: "500px", margin: "0 auto" }}>
              Join thousands of job seekers who are using AI to land their dream job.
            </p>
            <Link to={ctaPath} className="btn btn-primary" id="cta-bottom-btn">
              {isLoggedIn ? "Go to Dashboard" : "Get Started — It's Free"}
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <span className="navbar__logo-icon">◈</span>
            <span className="navbar__logo-text" style={{ fontSize: "var(--font-base)" }}>ResumeAI</span>
          </div>
          <p className="footer__copy">© 2026 ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
