'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const serviceOptions = [
  { value: 'sound-system', label: 'Sound System Hire' },
  { value: 'av-production', label: 'AV & Visual Production' },
  { value: 'stage-production', label: 'Stage & Rigging' },
  { value: 'dj-booking', label: 'DJ & Artist Booking' },
  { value: 'event-management', label: 'Event Management' },
  { value: 'livestream', label: 'Live Stream Production' },
  { value: 'other', label: 'Other / Custom Package' },
];

const eventTypes = [
  'Festival',
  'Club Night',
  'Corporate Event',
  'Private Party',
  'Wedding',
  'Conference',
  'Other',
];

export default function BookingsPage() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    eventType: '',
    eventDate: '',
    location: '',
    budget: '',
    attendees: '',
    details: '',
  });

  // Pre-fill service from URL param
  useEffect(() => {
    const service = searchParams.get('service');
    if (service) {
      setFormData((prev) => ({ ...prev, service }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F5] mb-3">Inquiry Submitted!</h1>
          <p className="text-[#888] text-sm mb-6">
            Thanks for reaching out. Our team will review your inquiry and get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-medium hover:bg-[#252525] transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/services"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-medium hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              View Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
              Book Our Services
            </h1>
            <p className="text-[#888] text-sm sm:text-base max-w-lg mx-auto">
              Tell us about your event and we'll put together a custom quote.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
            <h2 className="text-[#F5F5F5] font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="+44 123 456 7890"
                />
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Company / Org</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Company name"
                />
              </div>
            </div>
          </div>

          {/* Service & Event */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
            <h2 className="text-[#F5F5F5] font-bold mb-4">Service & Event Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Service Required *</label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">Select service</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Event Type *</label>
                <select
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">Select type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Event Date</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="City or venue"
                />
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">Select budget</option>
                  <option value="under-1k">Under £1,000</option>
                  <option value="1k-5k">£1,000 - £5,000</option>
                  <option value="5k-10k">£5,000 - £10,000</option>
                  <option value="10k-25k">£10,000 - £25,000</option>
                  <option value="25k-50k">£25,000 - £50,000</option>
                  <option value="50k+">£50,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-[#888] text-sm mb-1.5">Expected Attendees</label>
                <select
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option value="">Select size</option>
                  <option value="under-100">Under 100</option>
                  <option value="100-500">100 - 500</option>
                  <option value="500-1000">500 - 1,000</option>
                  <option value="1000-5000">1,000 - 5,000</option>
                  <option value="5000+">5,000+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A]">
            <h2 className="text-[#F5F5F5] font-bold mb-4">Additional Details</h2>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-[#F5F5F5] text-sm focus:border-purple-500 focus:outline-none transition-colors resize-none"
              placeholder="Tell us more about your event, requirements, or any specific needs..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>

          <p className="text-center text-[#666] text-xs">
            We typically respond within 24 hours. For urgent inquiries, email{' '}
            <a href="mailto:bookings@raveculture.xyz" className="text-purple-400 hover:underline">
              bookings@raveculture.xyz
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
