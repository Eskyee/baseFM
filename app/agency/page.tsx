import Link from 'next/link';

export const metadata = {
  title: 'RaveCulture Agency | DIY Network — Plugged In',
  description: 'Underground collective building the future of rave culture. DIY production, talent network, and onchain infrastructure. No gatekeepers. No middlemen. Direct to the dancefloor.',
  keywords: 'DIY rave collective, underground events UK, soundsystem culture, onchain events, free party network',
  openGraph: {
    title: 'RaveCulture Agency | DIY Network — Plugged In',
    description: 'Underground collective building the future of rave culture. No gatekeepers. No middlemen.',
    images: ['/og-agency.png'],
  },
};

const manifesto = [
  'We don\'t wait for permission.',
  'We build our own platforms.',
  'We pay artists directly.',
  'We own our culture.',
];

const pillars = [
  {
    icon: '🔊',
    title: 'Soundsystem Culture',
    description: 'From free parties to festival main stages. We bring the bass, the rigs, and the energy that started in warehouses and fields.',
    heritage: ['Free Party Roots', 'Festival Grade Systems', 'Mobile Rigs', 'DIY Repairs'],
  },
  {
    icon: '🎧',
    title: 'Artist Network',
    description: 'Direct bookings, no agents skimming 20%. Our roster is built on trust, not contracts. Underground to headline — same respect.',
    heritage: ['Direct Bookings', 'Fair Pay Always', 'Emerging Talent', 'Legends of the Scene'],
  },
  {
    icon: '⛓️',
    title: 'Onchain Infrastructure',
    description: 'baseFM, crew payouts, NFT tickets — we\'re building the tools so the next generation doesn\'t need the old gatekeepers.',
    heritage: ['baseFM Radio', 'Instant Payouts', 'Ticket Ownership', 'Community Treasury'],
  },
  {
    icon: '🤝',
    title: 'Collective Power',
    description: 'Not an agency. A network. Promoters, artists, crews, ravers — all plugged into the same mission. We rise together.',
    heritage: ['Crew Network', 'Knowledge Sharing', 'Resource Pooling', 'Mutual Support'],
  },
  {
    icon: '💻',
    title: 'Web Development',
    description: 'Modern websites and web apps built with Next.js. From landing pages to full-stack applications with CMS and e-commerce.',
    heritage: ['Next.js Apps', 'E-commerce', 'CMS Integration', 'API Development'],
  },
];

const timeline = [
  { year: '1988', event: 'Acid House', description: 'The second summer of love. Warehouse parties, smiley faces, and a movement born in abandoned spaces.' },
  { year: '1992', event: 'Jungle Emerges', description: 'Breakbeats meet bass. Pirates on the airwaves. Sound systems in every borough.' },
  { year: '1994', event: 'Criminal Justice Act', description: 'They tried to stop the music. "Repetitive beats" became illegal. We kept going.' },
  { year: '2000s', event: 'Superclubs Rise & Fall', description: 'The scene went commercial, then underground again. The real ones never left.' },
  { year: '2020', event: 'Pandemic Silence', description: 'Clubs closed. Artists struggled. The industry showed its fragility.' },
  { year: '2024', event: 'Onchain Renaissance', description: 'New tools, same spirit. Direct payments, community ownership, no middlemen.' },
];

const principles = [
  {
    title: 'No Gatekeepers',
    description: 'The old industry kept artists waiting for approval. We build direct connections. Your music, your audience, your money.',
    icon: '🚪',
  },
  {
    title: 'Fair Pay, Fast Pay',
    description: 'Artists get paid the night of the gig, direct to wallet. No 90-day invoices. No "exposure" offers. Respect.',
    icon: '💰',
  },
  {
    title: 'Open Source Everything',
    description: 'Our code is public. Our methods are shared. If another crew wants to build something better, good — we all benefit.',
    icon: '🔓',
  },
  {
    title: 'Community First',
    description: 'Every decision passes one test: does this serve the dancefloor? If it only serves shareholders, it\'s not for us.',
    icon: '👥',
  },
];

const crew = [
  { role: 'Sound Engineers', count: '8+', description: 'From intimate rooms to 10k capacity' },
  { role: 'Visual Artists', count: '5+', description: 'Projection mapping, LED, lasers' },
  { role: 'Promoters', count: '12+', description: 'UK-wide network, trusted venues' },
  { role: 'Artists', count: '50+', description: 'Residents and guests across all genres' },
];

const heritage = [
  'Spiral Tribe', 'DiY Collective', 'Exodus', 'United Systems',
  'Fabric', 'Tresor', 'The End', 'Plastic People',
  'Metalheadz', 'Ram Records', 'Hospital', 'Critical',
];

export default function AgencyPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-[#0A0A0A]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Plugged In · DIY Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F5F5F5] mb-6 leading-tight">
              We Don&apos;t Wait For<br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Permission
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[#888] mb-8 max-w-2xl mx-auto">
              Underground collective building the future of rave culture.
              No gatekeepers. No middlemen. Direct to the dancefloor.
            </p>

            {/* Manifesto */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {manifesto.map((line, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-[#1A1A1A] border border-[#333] rounded-full text-[#F5F5F5] text-sm"
                >
                  {line}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/bookings"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-full font-semibold text-lg text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                Join The Network
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/agency/web-design"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1A1A] border border-[#333] rounded-full text-[#F5F5F5] font-semibold text-lg hover:bg-[#252525] hover:border-purple-500/50 transition-all"
              >
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Web Design
              </Link>
              <a
                href="https://warpcast.com/raveculture"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1A1A] border border-[#333] rounded-full text-[#F5F5F5] font-semibold text-lg hover:bg-[#252525] hover:border-purple-500/50 transition-all"
              >
                <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
                </svg>
                Follow on Farcaster
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Timeline */}
      <section className="border-y border-[#1A1A1A] bg-[#0A0A0A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-center text-2xl font-bold text-[#F5F5F5] mb-8">
            Built On Decades of Underground Culture
          </h2>
          <div className="flex gap-8 overflow-x-auto pb-4 hide-scrollbar">
            {timeline.map((item, i) => (
              <div key={i} className="flex-shrink-0 w-64">
                <div className="text-purple-400 font-mono text-sm mb-1">{item.year}</div>
                <div className="text-[#F5F5F5] font-bold mb-1">{item.event}</div>
                <div className="text-[#666] text-sm">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">
            The DIY Network
          </h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            Four pillars. One mission. Build the infrastructure so the culture controls itself.
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
                {pillar.heritage.map((item) => (
                  <li key={item} className="text-[#666] text-sm flex items-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="bg-[#0D0D0D] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">
              How We Move Different
            </h2>
            <p className="text-[#888] max-w-2xl mx-auto">
              The old model is broken. These are our operating principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#2A2A2A] flex gap-4"
              >
                <div className="text-3xl flex-shrink-0">{principle.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-[#F5F5F5] mb-2">{principle.title}</h3>
                  <p className="text-[#888] text-sm">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Crew */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">The Crew</h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            Not employees. Family. A decentralised network of people who give a shit.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {crew.map((member) => (
            <div
              key={member.role}
              className="bg-[#1A1A1A] rounded-2xl p-5 text-center border border-[#2A2A2A]"
            >
              <div className="text-3xl font-bold text-[#F5F5F5] mb-1">{member.count}</div>
              <h3 className="text-[#F5F5F5] font-medium mb-1">{member.role}</h3>
              <p className="text-[#666] text-xs">{member.description}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[#666] text-sm mt-6">
          + countless ravers, supporters, and believers keeping the culture alive
        </p>
      </section>

      {/* Standing on Shoulders */}
      <section className="bg-[#0D0D0D] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">
              Standing On Shoulders
            </h2>
            <p className="text-[#888]">
              We didn&apos;t invent this. We&apos;re continuing what the pioneers started.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {heritage.map((name) => (
              <div
                key={name}
                className="px-5 py-2.5 bg-[#1A1A1A] rounded-full text-[#888] text-sm font-medium border border-[#2A2A2A] hover:border-purple-500/30 hover:text-[#F5F5F5] transition-all cursor-default"
              >
                {name}
              </div>
            ))}
          </div>

          <p className="text-center text-[#444] text-xs mt-8 max-w-lg mx-auto">
            &quot;The history of rave is the history of people creating spaces outside the system.
            We&apos;re not nostalgic — we&apos;re building the next chapter.&quot;
          </p>
        </div>
      </section>

      {/* baseFM Integration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Powered by baseFM</span>
              </div>
              <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Onchain Radio Infrastructure</h2>
              <p className="text-[#888] max-w-lg">
                Every stream, every tip, every crew payout — direct to wallet.
                No platforms taking 30%. No waiting for checks. The tools we wished existed, built by us.
              </p>
            </div>
            <Link
              href="/"
              className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-blue-500 transition-all active:scale-[0.98]"
            >
              Explore baseFM
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Plug In</h2>
          <p className="text-[#888] max-w-2xl mx-auto">
            Whether you&apos;re an artist, promoter, or just someone who believes in the culture — let&apos;s connect.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Booking Form */}
          <Link
            href="/bookings"
            className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-bold mb-1">Join Network</h3>
            <p className="text-white/70 text-sm">Artists & Crews</p>
          </Link>

          {/* Email */}
          <a
            href="mailto:crew@raveculture.xyz"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-purple-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">Email</h3>
            <p className="text-[#888] text-sm">crew@raveculture.xyz</p>
          </a>

          {/* Warpcast */}
          <a
            href="https://warpcast.com/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-purple-500/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.24 4.315l-6.24 15.63-2.385-6.15L3.465 11.4l14.775-7.085zm.255-.63L3.21 10.77a.75.75 0 00-.135 1.29l6.855 2.67 2.67 6.855a.75.75 0 001.29-.135l7.085-14.775a.75.75 0 00-.93-.99z"/>
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">Farcaster</h3>
            <p className="text-[#888] text-sm">@raveculture</p>
          </a>

          {/* Base */}
          <a
            href="https://base.app/profile/raveculture"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1A1A1A] rounded-2xl p-6 text-center border border-[#2A2A2A] hover:border-[#0052FF]/50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#0052FF]/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#0052FF]" viewBox="0 0 111 111" fill="currentColor">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"/>
              </svg>
            </div>
            <h3 className="text-[#F5F5F5] font-bold mb-1">Base</h3>
            <p className="text-[#888] text-sm">@raveculture</p>
          </a>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-12 py-8 border-t border-[#1A1A1A]">
          <p className="text-[#666] text-sm">
            No corporate investors. No VC money. Just culture. 🥷
          </p>
        </div>
      </section>
    </div>
  );
}
