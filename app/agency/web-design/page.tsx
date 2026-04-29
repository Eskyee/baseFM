import Link from 'next/link';
import { WebDesignContactForm } from '@/components/WebDesignContactForm';

export const metadata = {
  title: 'Web Design Agency | baseFM',
  description: 'Professional web design and development services. Modern, fast websites built with Next.js.',
};

const portfolioProjects = [
  {
    name: 'Web Design Agency',
    description: 'Professional web design services page with portfolio, pricing, and contact form',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
    url: '/agency/web-design',
    category: 'website',
  },
  {
    name: 'baseFM Radio',
    description: 'Live streaming radio platform with wallet integration',
    tech: ['Next.js', 'Supabase', 'Wagmi', 'Livepeer'],
    url: 'https://basefm.space',
    tagline: 'Live streaming radio platform with wallet integration',
    category: 'webapp',
  },
  {
    name: 'AI Cloud Dashboard',
    description: 'AI agent management and analytics platform',
    tech: ['Next.js', 'TypeScript', 'Tailwind', 'Charts'],
    url: '/tools',
    category: 'webapp',
  },
  {
    name: 'Event Platform',
    description: 'Event discovery and ticket management system',
    tech: ['Next.js', 'Supabase', 'Stripe', 'Vercel'],
    url: '/events',
    category: 'website',
  },
  {
    name: 'Crew Management',
    description: 'Team coordination and scheduling tool',
    tech: ['Next.js', 'Real-time', 'Auth', 'Dashboard'],
    url: '/admin/crew',
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
              Fast, modern websites built with Next.js. From concept to launch &mdash; we handle everything so you can focus on your business.
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

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioProjects.map((project) => {
            const isExternal = project.url.startsWith('http');
            return (
              <Link
                key={project.name}
                href={project.url}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[#F5F5F5] font-bold text-xl group-hover:text-purple-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-[#888] text-sm mt-1">{project.tagline || project.description}</p>
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
              </Link>
            );
          })}
        </div>
      </div>

      {/* Services & Pricing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#0A0A0A]/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#F5F5F5] mb-3">Services &amp; Pricing</h2>
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
              Tell us about your project and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <WebDesignContactForm />
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

        {/* Vercel Logo */}
        <div className="mt-8 flex justify-center">
          <svg width="120" height="24" viewBox="0 0 2048 407" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
            <path fillRule="evenodd" clipRule="evenodd" d="M467.444 406.809L233.722 0.335938L0 406.809H467.444ZM703.186 388.306L898.51 18.813H814.024L679.286 287.152L544.547 18.813H460.061L655.385 388.306H703.186ZM2034.31 18.813V388.307H1964.37V18.813H2034.31ZM1644.98 250.395C1644.98 221.599 1650.99 196.272 1663.01 174.415C1675.03 152.557 1691.79 135.731 1713.28 123.935C1734.77 112.139 1759.91 106.241 1788.69 106.241C1814.19 106.241 1837.14 111.792 1857.54 122.894C1877.94 133.996 1894.15 150.476 1906.17 172.333C1918.19 194.191 1924.39 220.905 1924.75 252.477V268.61H1718.75C1720.2 291.508 1726.94 309.549 1738.96 322.733C1751.35 335.57 1767.93 341.988 1788.69 341.988C1801.8 341.988 1813.83 338.519 1824.75 331.58C1835.68 324.641 1843.88 315.274 1849.34 303.478L1920.93 308.682C1912.18 334.702 1895.79 355.519 1871.75 371.131C1847.7 386.744 1820.02 394.55 1788.69 394.55C1759.91 394.55 1734.77 388.652 1713.28 376.856C1691.79 365.06 1675.03 348.233 1663.01 326.376C1650.99 304.518 1644.98 279.192 1644.98 250.395ZM1852.62 224.375C1850.07 201.823 1842.97 185.344 1831.31 174.935C1819.65 164.18 1805.45 158.802 1788.69 158.802C1769.38 158.802 1753.72 164.527 1741.7 175.976C1729.67 187.425 1722.21 203.558 1719.29 224.375H1852.62ZM1526.96 174.935C1538.62 184.303 1545.9 197.313 1548.82 213.966L1620.94 210.323C1618.39 189.16 1610.93 170.772 1598.54 155.159C1586.15 139.547 1570.13 127.578 1550.45 119.251C1531.15 110.577 1509.84 106.241 1486.52 106.241C1457.74 106.241 1432.61 112.139 1411.11 123.935C1389.62 135.731 1372.86 152.557 1360.84 174.415C1348.82 196.272 1342.81 221.599 1342.81 250.395C1342.81 279.192 1348.82 304.518 1360.84 326.376C1372.86 348.233 1389.62 365.06 1411.11 376.856C1432.61 388.652 1457.74 394.55 1486.52 394.55C1510.56 394.55 1532.42 390.213 1552.09 381.54C1571.77 372.519 1587.79 359.856 1600.18 343.549C1612.57 327.243 1620.03 308.161 1622.58 286.304L1549.91 283.181C1547.36 301.569 1540.25 315.794 1528.6 325.855C1516.94 335.57 1502.91 340.427 1486.52 340.427C1463.94 340.427 1446.45 332.621 1434.06 317.008C1421.68 301.396 1415.49 279.192 1415.49 250.395C1415.49 221.599 1421.68 199.395 1434.06 183.782C1446.45 168.17 1463.94 160.364 1486.52 160.364C1502.19 160.364 1515.66 165.221 1526.96 174.935ZM1172.15 112.473H1237.24L1239.12 165.559C1243.74 150.533 1250.16 138.864 1258.39 130.552C1270.32 118.5 1286.96 112.473 1308.29 112.473H1334.87V169.293H1307.75C1292.56 169.293 1280.09 171.359 1270.32 175.491C1260.92 179.624 1253.69 186.166 1248.63 195.12C1243.93 204.073 1241.58 215.437 1241.58 229.211V388.306H1172.15V112.473ZM871.925 174.415C859.904 196.272 853.893 221.599 853.893 250.395C853.893 279.192 859.904 304.518 871.925 326.376C883.947 348.233 900.704 365.06 922.198 376.856C943.691 388.652 968.827 394.55 997.606 394.55C1028.93 394.55 1056.62 386.744 1080.66 371.131C1104.71 355.519 1121.1 334.702 1129.84 308.682L1058.26 303.478C1052.8 315.274 1044.6 324.641 1033.67 331.58C1022.74 338.519 1010.72 341.988 997.606 341.988C976.841 341.988 960.266 335.57 947.88 322.733C935.858 309.549 929.119 291.508 927.662 268.61H1133.67V252.477C1133.3 220.905 1127.11 194.191 1115.09 172.333C1103.07 150.476 1086.86 133.996 1066.46 122.894C1046.06 111.792 1023.11 106.241 997.606 106.241C968.827 106.241 943.691 112.139 922.198 123.935C900.704 135.731 883.947 152.557 871.925 174.415ZM1040.23 174.935C1051.88 185.344 1058.99 201.823 1061.54 224.375H928.208C931.123 203.558 938.591 187.425 950.612 175.976C962.634 164.527 978.298 158.802 997.606 158.802C1014.36 158.802 1028.57 164.18 1040.23 174.935Z" fill="white"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
