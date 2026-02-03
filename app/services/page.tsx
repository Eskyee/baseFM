import Link from 'next/link';

export const metadata = {
  title: 'Services | baseFM',
  description: 'Professional festival production, sound systems, and DJ services available for hire.',
};

const services = [
  {
    id: 'sound-system',
    title: 'Sound System Hire',
    description: 'Full festival-grade PA systems from intimate venues to main stage productions. Funktion-One, Martin Audio, and more.',
    icon: '🔊',
    features: ['Festival Main Stage', 'Club Systems', 'Outdoor Events', 'Technical Engineers'],
    priceFrom: 'From £500/day',
  },
  {
    id: 'av-production',
    title: 'AV & Visual Production',
    description: 'Complete audio-visual setups including LED walls, projection mapping, lighting design, and live streaming.',
    icon: '🎬',
    features: ['LED Walls', 'Projection Mapping', 'Stage Lighting', 'Live Streaming'],
    priceFrom: 'From £800/day',
  },
  {
    id: 'stage-production',
    title: 'Stage & Rigging',
    description: 'Professional staging solutions from portable setups to full festival infrastructure with certified riggers.',
    icon: '🎪',
    features: ['Modular Stages', 'Truss & Rigging', 'Weather Protection', 'Safety Certified'],
    priceFrom: 'From £1,200/day',
  },
  {
    id: 'dj-booking',
    title: 'DJ & Artist Booking',
    description: 'Access our roster of talented DJs across all genres. From underground selectors to headline acts.',
    icon: '🎧',
    features: ['All Genres', 'International Acts', 'Resident DJs', 'Live PAs'],
    priceFrom: 'Enquire',
  },
  {
    id: 'event-management',
    title: 'Event Management',
    description: 'End-to-end event production from planning to execution. Licensing, logistics, and on-site coordination.',
    icon: '📋',
    features: ['Full Planning', 'Licensing Support', 'On-site Management', 'Vendor Coordination'],
    priceFrom: 'Custom Quote',
  },
  {
    id: 'livestream',
    title: 'Live Stream Production',
    description: 'Professional multi-camera live streaming with baseFM integration. Reach global audiences from any venue.',
    icon: '📡',
    features: ['Multi-Camera', 'baseFM Integration', 'Social Simulcast', 'On-demand Archive'],
    priceFrom: 'From £400/event',
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-purple-900/40 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
              Services Directory
            </h1>
            <p className="text-[#888] text-sm sm:text-base max-w-lg mx-auto mb-6">
              Professional festival production and entertainment services.
              30+ years combined experience. Available worldwide.
            </p>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              <span>Get a Quote</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#2A2A2A] hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] flex items-center justify-center text-2xl flex-shrink-0">
                  {service.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[#F5F5F5] font-bold text-lg mb-1">{service.title}</h2>
                  <p className="text-purple-400 text-sm font-medium">{service.priceFrom}</p>
                </div>
              </div>

              <p className="text-[#888] text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-[#0A0A0A] rounded-full text-xs text-[#888]"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <Link
                href={`/bookings?service=${service.id}`}
                className="block w-full py-2.5 text-center bg-[#0A0A0A] rounded-xl text-[#F5F5F5] text-sm font-medium hover:bg-purple-600 transition-colors group-hover:bg-purple-600"
              >
                Enquire Now
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">30+</div>
              <div className="text-[#888] text-xs sm:text-sm">Team Members</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">500+</div>
              <div className="text-[#888] text-xs sm:text-sm">Events Delivered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">UK/EU</div>
              <div className="text-[#888] text-xs sm:text-sm">Coverage</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">24/7</div>
              <div className="text-[#888] text-xs sm:text-sm">Support</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-[#888] text-sm mb-4">
            Need a custom package? We'll tailor a solution to your event.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/bookings"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-semibold hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              Request Quote
            </Link>
            <a
              href="mailto:bookings@raveculture.xyz"
              className="px-6 py-3 bg-[#1A1A1A] rounded-full text-[#F5F5F5] font-semibold hover:bg-[#252525] transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
