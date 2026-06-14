import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="min-h-screen bg-surface py-16 px-4" id="contact-page">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left — Info */}
          <div className="flex flex-col space-y-6">
            <div className="inline-flex items-center space-x-2 bg-surface-container-low text-secondary font-label-md px-3 py-1.5 rounded-full w-max border border-outline-variant/30">
              <span className="material-symbols-outlined text-sm" data-icon="mail">mail</span>
              <span>Contact</span>
            </div>
            <h1 className="font-display-lg text-primary font-bold">Get in touch</h1>
            <p className="font-body-lg text-on-surface-variant">
              Have a question, feedback, or just want to say hi? We'd love to
              hear from you. Fill out the form and we'll get back to you shortly.
            </p>

            <div className="flex flex-col space-y-6 mt-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary bg-surface-container p-3 rounded-xl">email</span>
                <div>
                  <p className="font-label-md text-on-surface-variant">Email</p>
                  <p className="font-body-md text-primary font-medium">hello@resumeai.app</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary bg-surface-container p-3 rounded-xl">location_on</span>
                <div>
                  <p className="font-label-md text-on-surface-variant">Based in</p>
                  <p className="font-body-md text-primary font-medium">India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary bg-surface-container p-3 rounded-xl">schedule</span>
                <div>
                  <p className="font-label-md text-on-surface-variant">Response time</p>
                  <p className="font-body-md text-primary font-medium">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-white rounded-xl p-8 border border-outline-variant/20 shadow-level-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-label-md text-primary mb-1">Name</label>
                <input type="text" name="name" className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors" placeholder="Your name" value={formData.name} onChange={handleChange} required />
              </div>

              <div>
                <label className="block font-label-md text-primary mb-1">Email</label>
                <input type="email" name="email" className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div>
                <label className="block font-label-md text-primary mb-1">Message</label>
                <textarea name="message" className="w-full p-3 bg-surface border border-outline-variant/40 rounded-lg font-body-md text-primary focus:border-secondary outline-none transition-colors resize-y" placeholder="How can we help?" value={formData.message} onChange={handleChange} rows="5" required></textarea>
              </div>

              <button type="submit" className="w-full bg-[#0f172a] hover:bg-[#00687a] text-white font-label-md px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                Send Message <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              {submitted && (
                <div className="p-3 bg-[#eff6ff] text-[#3b82f6] rounded-lg text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Message sent successfully. We'll be in touch!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
