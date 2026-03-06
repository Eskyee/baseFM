'use client';

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

export function WebDesignContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission opens email client (no direct email displayed)
    const subject = encodeURIComponent(`Web Design Inquiry: ${formData.projectType}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nProject Type: ${formData.projectType}\nBudget: ${formData.budget}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:rbasefm@icloud.com?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#888] mb-2">Your Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] text-[#F5F5F5] focus:border-purple-500 focus:outline-none"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="block text-sm text-[#888] mb-2">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] text-[#F5F5F5] focus:border-purple-500 focus:outline-none"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[#888] mb-2">Project Type</label>
          <select
            aria-label="Project type"
            required
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] text-[#F5F5F5] focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select type...</option>
            <option value="landing">Landing Page</option>
            <option value="website">Business Website</option>
            <option value="webapp">Web Application</option>
            <option value="redesign">Redesign</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#888] mb-2">Budget Range</label>
          <select
            aria-label="Budget range"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] text-[#F5F5F5] focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select budget...</option>
            <option value="under750">Under £750</option>
            <option value="750-1500">£750 - £1,500</option>
            <option value="1500-3000">£1,500 - £3,000</option>
            <option value="3000+">£3,000+</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#888] mb-2">Project Details</label>
        <textarea
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-[#0A0A0A] rounded-xl border border-[#2A2A2A] text-[#F5F5F5] focus:border-purple-500 focus:outline-none resize-none"
          placeholder="Tell us about your project, goals, and any specific requirements..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
      >
        Send Inquiry
      </button>

      <p className="text-center text-[#666] text-xs">
        Or send us a message using the form above.
      </p>
    </form>
  );
}
