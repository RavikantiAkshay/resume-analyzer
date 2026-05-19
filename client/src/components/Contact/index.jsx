import { useState } from "react";
import "./index.css";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to a backend endpoint
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="contact-page" id="contact-page">
      <div className="container">
        <div className="contact-layout">
          {/* Left — Info */}
          <div className="contact-info animate-slide-up">
            <p className="section-label">Contact</p>
            <h1 className="heading-lg">Get in touch</h1>
            <p className="contact-info__desc">
              Have a question, feedback, or just want to say hi? We'd love to
              hear from you. Fill out the form and we'll get back to you shortly.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <span className="contact-detail__icon">✉</span>
                <div>
                  <p className="contact-detail__label">Email</p>
                  <p className="contact-detail__value">hello@resumeai.app</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail__icon">◈</span>
                <div>
                  <p className="contact-detail__label">Based in</p>
                  <p className="contact-detail__value">India</p>
                </div>
              </div>
              <div className="contact-detail">
                <span className="contact-detail__icon">⟐</span>
                <div>
                  <p className="contact-detail__label">Response time</p>
                  <p className="contact-detail__value">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <form className="contact-form card animate-slide-up-delay-1" onSubmit={handleSubmit} id="contact-form">
            <div className="contact-form__group">
              <label htmlFor="contact-name" className="contact-form__label">Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                className="input-field"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form__group">
              <label htmlFor="contact-email" className="contact-form__label">Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-form__group">
              <label htmlFor="contact-message" className="contact-form__label">Message</label>
              <textarea
                id="contact-message"
                name="message"
                className="input-field contact-form__textarea"
                placeholder="How can we help?"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary contact-form__submit" id="contact-submit-btn">
              Send Message
              <span className="btn-arrow">→</span>
            </button>

            {submitted && (
              <p className="contact-form__success">
                ✓ Message sent successfully. We'll be in touch!
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default Contact;
