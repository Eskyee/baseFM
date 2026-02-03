import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'RaveCulture Agency | Festival Production & DJ Booking',
  description: 'Full-service festival production, DJ booking agency, and event technology. 30+ team members, 500+ events delivered across UK & Europe.',
  keywords: 'festival production UK, DJ booking agency, event AV hire, stage production, live streaming events',
  openGraph: {
    title: 'RaveCulture Agency | Festival Production & DJ Booking',
    description: 'Full-service festival production, DJ booking agency, and event technology.',
    images: ['/og-agency.png'],
  },
};

const pillars = [
  {
    icon: '🔊',
    title: 'Production',
    description: 'Festival-grade sound systems, AV, staging, and technical production for events of any scale.',
    services: ['Sound Systems', 'LED & Visuals', 'Stage Design', 'Technical Crew'],
  },
  {
    icon: '🎧',
    title: 'Talent',
    description: 'Curated roster of DJs and live acts across all electronic genres. From underground to headline.',
    services: ['DJ Booking', 'Live Acts', 'Residencies', 'Festival Lineups'],
  },
  {
    icon: '📡',
    title: 'Technology',
    description: 'Cutting-edge streaming, onchain ticketing, and digital experiences powered by baseFM.',
    services: ['Live Streaming', 'baseFM Integration', 'NFT Ticketing', 'Analytics'],
  },
  {
    icon: '📋',
    title: 'Consulting',
    description: 'End-to-end event strategy, licensing support, and operational expertise.',
    services: ['Event Strategy', 'Licensing', 'Vendor Management', 'Safety Planning'],
  },
];

const caseStudies = [
  {
    title: 'Summer Festival 2024',
    type: 'Festival Production',
    location: 'Oxfordshire, UK',
    stats: { attendees: '5,000+', stages: '3', artists: '40+' },
    image: '/portfolio/festival-1.jpg',
  },
  {
    title: 'Warehouse Series',
    type: 'Club Night Series',
    location: 'London, UK',
    stats: { events: '12', capacity: '800', streams: '50k+' },
    image: '/portfolio/warehouse-1.jpg',
  },
  {
    title: 'Corporate Launch',
    type: 'Brand Activation',
    location: 'Manchester, UK',
    stats: { guests: '500', reach: '100k', engagement: '15%' },
    image: '/portfolio/corporate-1.jpg',
  },
];

const team = [
  { name: 'Founder', role: 'Creative Director', emoji: '👤' },
  { name: 'Head of Production', role: 'Technical Lead', emoji: '🎛️' },
  { name: 'Talent Manager', role: 'Artist Relations', emoji: '🎧' },
  { name: 'Operations Lead', role: 'Event Management', emoji: '📋' },
];

const clients = [
  'Ministry of Sound', 'Fabric', 'Printworks', 'Hospitality',
  'RAM Records', 'Critical Music', 'Metalheadz', 'Exit Festival',
];

export default function AgencyPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-blue-900/40 to-[#0A0A0A]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              Available for 2025/2026 bookings
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F5F5] mb-6 leading-tight">
              RaveCulture<br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Agency
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#888] mb-8 max-w-2xl mx-auto">
              Full-service festival production, DJ booking, and event technology.
              30+ team members delivering unforgettable experiences across UK & Europe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/bookings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold text-lg hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
              >
                Get a Quote
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href="https://calendly.com/raveculture"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-semibold text-lg hover:bg-[#252525] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book a Call
              </a>
            </div>
          </div>

          {/* Video Showreel Placeholder */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="aspect-video bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] flex items-center justify-center group cursor-pointer hover:border-purple-500/50 transition-colors">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors">
                  <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-[#888] text-sm">Watch Showreel</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[#1A1A1A] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">30+</div>
              <div className="text-[#888] text-sm mt-1">Team Members</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">500+</div>
              <div className="text-[#888] text-sm mt-1">Events Delivered</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">10+</div>
              <div className="text-[#888] text-sm mt-1">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#F5F5F5]">UK/EU</div>
              <div className="text-[#888] text-sm mt-1">Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">What We Do</h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            Four pillars of expertise to deliver complete event solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] hover:border-purple-500/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                {pillar.icon}
              </div>
              <h3 className="text-xl font-bold text-[#F5F5F5] mb-2">{pillar.title}</h3>
              <p className="text-[#888] text-sm mb-4">{pillar.description}</p>
              <ul className="space-y-1">
                {pillar.services.map((service) => (
                  <li key={service} className="text-[#666] text-sm flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-[#0D0D0D] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Our Work</h2>
            <p className="text-[#888] max-w-2xl mx-auto">
              Selected projects showcasing our capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <div
                key={study.title}
                className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A] hover:border-purple-500/50 transition-all group"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                  <span className="text-4xl">📸</span>
                </div>
                <div className="p-5">
                  <div className="text-purple-400 text-xs font-medium mb-1">{study.type}</div>
                  <h3 className="text-lg font-bold text-[#F5F5F5] mb-1">{study.title}</h3>
                  <p className="text-[#888] text-sm mb-4">{study.location}</p>
                  <div className="flex gap-4">
                    {Object.entries(study.stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-[#F5F5F5] font-bold">{value}</div>
                        <div className="text-[#666] text-xs capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">The Team</h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            30+ experienced professionals across production, talent, and operations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-[#1A1A1A] rounded-2xl p-5 text-center border border-[#2A2A2A]"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-3 text-2xl">
                {member.emoji}
              </div>
              <h3 className="text-[#F5F5F5] font-bold">{member.name}</h3>
              <p className="text-[#888] text-sm">{member.role}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[#666] text-sm mt-6">
          + 26 more team members across sound, lighting, visuals, and operations
        </p>
      </section>

      {/* Clients */}
      <section className="bg-[#0D0D0D] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Trusted By</h2>
            <p className="text-[#888]">Industry leaders we've worked with</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {clients.map((client) => (
              <div
                key={client}
                className="px-6 py-3 bg-[#1A1A1A] rounded-full text-[#888] text-sm font-medium border border-[#2A2A2A]"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Kit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Press Kit</h2>
              <p className="text-[#888]">
                Download our media pack with logos, photos, tech specs, and company info.
              </p>
            </div>
            <a
              href="/press-kit.zip"
              download
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-semibold hover:bg-[#252525] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Press Kit
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Get In Touch</h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            Ready to create something amazing? Reach out through any channel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Booking Form */}
          <Link
            href="/bookings"
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-center hover:from-purple-500 hover:to-blue-500 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-1">Booking Form</h3>
            <p className="text-white/70 text-sm">Get a custom quote</p>
          </Link>

          {/* Email */}
          <a
            href="mailto:bookings@raveculture.xyz"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-purple-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">Email</h3>
            <p className="text-[#888] text-sm">bookings@raveculture.xyz</p>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/447000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-green-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">WhatsApp</h3>
            <p className="text-[#888] text-sm">Quick chat</p>
          </a>

          {/* Calendly */}
          <a
            href="https://calendly.com/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-blue-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">Schedule Call</h3>
            <p className="text-[#888] text-sm">Book a meeting</p>
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 mt-8">
          <a
            href="https://instagram.com/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] hover:text-[#F5F5F5] hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://twitter.com/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] hover:text-[#F5F5F5] hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a
            href="https://linkedin.com/company/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] hover:text-[#F5F5F5] hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a
            href="https://warpcast.com/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] hover:text-[#F5F5F5] hover:bg-[#252525] transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.24 2.4H5.76C3.936 2.4 2.4 3.936 2.4 5.76v12.48c0 1.824 1.536 3.36 3.36 3.36h12.48c1.824 0 3.36-1.536 3.36-3.36V5.76c0-1.824-1.536-3.36-3.36-3.36zm-1.44 15.12h-2.88l-1.92-4.8-1.92 4.8H7.2l3.36-7.68h2.88l3.36 7.68z"/>
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
