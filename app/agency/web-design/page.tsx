'use client';

import Link from 'next/link';
import { useState } from 'react';

export const metadata = {
  title: 'Web Design Agency | baseFM',
  description: 'Professional web design and development services. Modern, fast websites built with Next.js.',
};

const portfolioProjects = [
  {
    name: 'baseFM Radio',
    description: 'Live streaming radio platform with wallet integration',
    tech: ['Next.js', 'Supabase', 'Wagmi', 'Livepeer'],
    url: 'https://base.fm',
    category: 'webapp',
  },
  {
    name: 'AI Cloud Dashboard',
    description: 'AI agent management and analytics platform',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Charts'],
    url: 'https://base.fm/aicloud',
    category: 'webapp',
  },
  {
    name: 'Event Platform',
    description: 'Event discovery and ticket management system',
    tech: ['Next.js', 'Supabase', 'Stripe', 'Vercel'],
    url: 'https://base.fm/events',
    category: 'website',
  },
  {
    name: 'Crew Management',
    description: 'Team coordination and scheduling tool',
    tech: ['Next.js', 'Real-time', 'Auth', 'Dashboard'],
    url: 'https://base.fm/admin/crew',
    category: 'webapp',
  },
];

const services = [
  {
    title: 'Landing Page',
    description: 'Perfect for small businesses and events',
    price: '£750',
    delivery: '5-7 days',
    features: [
      'Up to 5 pages',
      'Mobile responsive',
      'Contact forms',
      'Basic SEO',
      '1 revision round',
    ],
    notIncluded: ['CMS', 'E-commerce', 'Blog'],
  },
  {
    title: 'Business Website',
    description: 'Full website for growing businesses',
    price: '£1,500',
    delivery: '2-3 weeks',
    popular: true,
    features: [
      'Up to 10 pages',
      'CMS included',
      'Blog setup',
      'Contact forms',
      'Basic SEO',
      'Analytics',
      '3 revision rounds',
    ],
    notIncluded: ['E-commerce'],
  },
  {
    title: 'Web Application',
    description: 'Custom functionality and integrations',
    price: '£3,000+',
    delivery: '4-8 weeks',
    features: [
      'Custom development',
      'User authentication',
      'Database design',
      'API integrations',
      'Dashboard features',
      'Payment processing',
      'Unlimited support',
    ],
    notIncluded: [],
  },
];

const process = [
  {
    step: '1',
    title: 'Discovery',
    description: 'We discuss your goals, audience, and requirements to create a brief.',
  },
  {
    step: '2',
    title: 'Design',
    description: 'Wireframes and mockups showing the look and feel of your site.',
  },
  {
    step: '3',
    title: 'Build',
    description: 'Development with regular progress updates and testing.',
  },
  {
    step: '4',
    title: 'Launch',
    description: 'Deploy and hand over with documentation and support options.',
  },
];

export default function WebDesignPage() {
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });

  const filteredProjects = filter === 'all' 
    ? portfolioProjects 
    : portfolioProjects.filter(p => p.category === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Web Design Inquiry: ${formData.projectType}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nProject Type: ${formData.projectType}\nBudget: ${formData.budget}\n\nMessage:\n${formData.message}`);
    // Form submission opens email client (no direct email displayed)
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full text-purple-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Now Accepting New Clients
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#F5F5F5] mb-4">
              We Build Websites That <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Actually Work</span>
            </h1>
            <p className="text-[#888] text-lg mb-8 max-w-2xl mx-auto">
              Fast, modern websites built with Next.js. From concept to launch — we handle everything so you can focus on your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#portfolio"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
              >
                See Our Work
              </a>
              <a
                href="#contact"
                className="px-8 py-4 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-semibold hover:bg-[#252525] transition-colors border border-[#2A2A2A]"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-y border-[#2A2A2A] bg-[#0A0A0A]/50">
        <p className="text-center text-[#666] text-sm mb-6">POWERED BY MODERN TECH</p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
          {['Next.js', 'React', 'TypeScript', 'Tailwind', 'Supabase', 'Vercel'].map((tech) => (
            <span key={tech} className="text-[#888] font-medium">{tech}</span>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div id="portfolio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#F5F5F5] mb-3">Our Work</h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Real projects, live on the web. Click any project to see it in action.
          </p>
        </div>

        {/* Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {['all', 'website', 'webapp'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-[#1A1A1A] text-[#888] hover:text-white'
              }`}
            >
              {f === 'all' ? 'All Projects' : f === 'website' ? 'Websites' : 'Web Apps'}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[#F5F5F5] font-bold text-xl group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-[#888] text-sm mt-1">{project.description}</p>
                </div>
                <svg className="w-5 h-5 text-[#666] group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-2 py-1 bg-[#0A0A0A] rounded-full text-xs text-[#666]">
                    {t}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Services & Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#0A0A0A]/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#F5F5F5] mb-3">Services & Pricing</h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Clear pricing with no hidden costs. Everything you need to get online.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative bg-[#1A1A1A] rounded-2xl p-6 border ${
                service.popular 
                  ? 'border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border-[#2A2A2A]'
              }`}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-white text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-[#F5F5F5] font-bold text-xl mb-2">{service.title}</h3>
                <p className="text-[#666] text-sm mb-4">{service.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[#F5F5F5]">{service.price}</span>
                </div>
                <p className="text-purple-400 text-sm mt-2">Delivery: {service.delivery}</p>
              </div>
              <ul className="space-y-3 mb-6">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-[#888]">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
                {service.notIncluded.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#444]">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="line-through">{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`block w-full py-3 text-center rounded-xl font-medium transition-colors ${
                  service.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500'
                    : 'bg-[#0A0A0A] text-[#F5F5F5] hover:bg-[#252525]'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#F5F5F5] mb-3">How We Work</h2>
          <p className="text-[#888] max-w-xl mx-auto">
            Simple, transparent process from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {process.map((p) => (
            <div key={p.step} className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {p.step}
              </div>
              <h3 className="text-[#F5F5F5] font-bold mb-2">{p.title}</h3>
              <p className="text-[#666] text-sm">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#0A0A0A]/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-2">Fast Loading</h3>
            <p className="text-[#666] text-sm">Websites optimized for speed. Better UX, better SEO, better conversions.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-2">Mobile First</h3>
            <p className="text-[#666] text-sm">Every site looks great on phones, tablets, and desktops. No compromises.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-2">SEO Ready</h3>
            <p className="text-[#666] text-sm">Built with search engines in mind. Get found by your customers.</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div id="contact" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8 border border-[#2A2A2A]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#F5F5F5] mb-3">Get a Quote</h2>
            <p className="text-[#888]">
              Tell us about your project and we'll get back to you within 24 hours.
            </p>
          </div>

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
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <Link
          href="/agency"
          className="inline-flex items-center gap-2 text-[#666] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Agency</span>
        </Link>
      </div>
    </div>
  );
}
