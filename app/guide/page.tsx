'use client';

import Link from 'next/link';

const firstSteps = [
  {
    step: '01',
    title: 'Connect a Base wallet',
    body: 'Use a Base wallet so you can sign in, keep your listener identity, tip DJs, and unlock token-gated areas when they apply.',
  },
  {
    step: '02',
    title: 'Choose your lane',
    body: 'Most people start as listeners. DJs go to the dashboard when they are ready to control a set. Builders can go deeper through the advanced guide.',
  },
  {
    step: '03',
    title: 'Follow the station path',
    body: 'baseFM is the public radio surface. Agentbot handles the live station, relay truth, and broadcast recovery in the background.',
  },
];

const paths = [
  {
    href: '/guide/beginner',
    label: 'Listener path',
    body: 'Simple guide for getting a wallet, joining the station, and following live shows.',
  },
  {
    href: '/dashboard',
    label: 'DJ path',
    body: 'Control sets, create streams, manage playback, and work from the broadcast dashboard.',
  },
  {
    href: '/guide/advanced',
    label: 'Builder path',
    body: 'Technical deep-dive for contributors, operators, and people extending the stack.',
  },
];

const quickLinks = [
  ['/live', 'Live', 'Listen to the current program feed.'],
  ['/schedule', 'Schedule', 'See what is coming up next.'],
  ['/djs', 'DJs', 'Browse artists and profiles.'],
  ['/events', 'Events', 'Find physical events and public dates.'],
  ['/community', 'Community', 'Open the wallet-native social layer.'],
  ['/wallet', 'Wallet', 'Check balances, support, and access state.'],
  ['https://agentbot.sh/learn', 'Agentbot Learn', 'Read the broader platform guides and operator docs.'],
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-black text-white font-mono pb-20 selection:bg-blue-500/30">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="basefm-kicker text-blue-500">Guide</span>
            <span className="basefm-kicker text-zinc-500">baseFM by Agentbot</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter uppercase leading-[0.9]">
              Use baseFM
              <br />
              <span className="text-zinc-700">without getting lost.</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              This is the cleanest path through the station. Start here if you want to listen, stream, support a DJ,
              or understand where baseFM ends and Agentbot begins.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/live" className="basefm-button-primary">
              Listen Live
            </Link>
            <Link href="/guide/beginner" className="basefm-button-secondary">
              Beginner Guide
            </Link>
            <Link href="/guide/advanced" className="basefm-button-secondary">
              Advanced Guide
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">First steps</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              Start here.
              <br />
              <span className="text-zinc-700">Three moves, then the station makes sense.</span>
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-900 lg:grid-cols-3">
            {firstSteps.map((item) => (
              <div key={item.step} className="bg-black p-6">
                <div className="text-[10px] uppercase tracking-widest text-blue-500 mb-4">{item.step}</div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Choose a path</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              Listener. DJ. Builder.
              <br />
              <span className="text-zinc-700">Different jobs, same station.</span>
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-900 lg:grid-cols-3">
            {paths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-black p-6 hover:bg-zinc-950 transition-colors"
              >
                <div className="text-sm font-bold uppercase tracking-wider text-white mb-3">{item.label}</div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-5">{item.body}</p>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600">Open route</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="grid gap-px bg-zinc-900 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Broadcast model</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-6">
                baseFM is the front door.
                <br />
                <span className="text-zinc-700">Agentbot runs the machinery.</span>
              </h2>
              <div className="space-y-4 text-sm text-zinc-400">
                {[
                  ['baseFM', 'Public listener surface, culture layer, events, and community routes.'],
                  ['Agentbot', 'Canonical live state, relay verification, operator controls, and runtime diagnostics.'],
                  ['Mux', 'Live ingest, playback, archive retention, and cleanup policy.'],
                  ['DJ workflow', 'Keep your decks, mixer, and encoder habits. Treat Agentbot like the broadcast rack after your master out.'],
                ].map(([label, body]) => (
                  <div key={label} className="grid grid-cols-[110px_1fr] gap-4 border-t border-zinc-900 pt-4 first:border-t-0 first:pt-0">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</div>
                    <div className="leading-relaxed">{body}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black p-6 sm:p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Need help fast?</div>
              <div className="space-y-3">
                <Link href="/dashboard" className="block border border-zinc-800 p-4 hover:border-zinc-600 transition-colors">
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">DJ dashboard</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Use this if you are going live, managing relays, or troubleshooting a set.</p>
                </Link>
                <a
                  href="https://agentbot.sh/learn/developers/openclaw-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border border-zinc-800 p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-1">Managed runtime guide</div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Open the Agentbot-side runtime and skills guide when the issue is operational, not musical.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Routes</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">
              Go where you need.
              <br />
              <span className="text-zinc-700">The main surfaces in one place.</span>
            </h2>
          </div>

          <div className="grid gap-px bg-zinc-900 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(([href, label, body]) => {
              const external = href.startsWith('http');
              const classes = 'bg-black p-5 hover:bg-zinc-950 transition-colors';
              const content = (
                <>
                  <div className="text-sm font-bold uppercase tracking-wider text-white mb-2">{label}</div>
                  <p className="text-xs leading-relaxed text-zinc-500">{body}</p>
                </>
              );

              return external ? (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes}
                >
                  {content}
                </a>
              ) : (
                <Link key={href} href={href} className={classes}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
          <div className="basefm-panel p-6 sm:p-8">
            <div className="max-w-3xl">
              <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-4">Bottom line</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase mb-4">
                baseFM stays open.
                <br />
                <span className="text-zinc-700">Agentbot keeps the station reliable.</span>
              </h2>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6">
                That is the model. baseFM remains the public protocol and cultural surface. Agentbot makes the live station,
                relay state, recovery paths, and operator tooling work like a real system.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard" className="basefm-button-primary">
                  Open Dashboard
                </Link>
                <a
                  href="https://github.com/Eskyee/baseFM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basefm-button-secondary"
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
