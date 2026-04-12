import Link from 'next/link';
import { TOKEN_SURFACES } from '@/lib/token/surfaces';

type TokenSurfacePanelProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function TokenSurfacePanel({
  title = 'Token map',
  subtitle = 'BaseFM uses a Base-side station token and the wider Solana Agentbot token path.',
  compact = false,
}: TokenSurfacePanelProps) {
  return (
    <div className="basefm-panel p-6 sm:p-8">
      <div className="max-w-3xl mb-6">
        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-3">{title}</div>
        <p className="text-sm text-zinc-400 leading-relaxed">{subtitle}</p>
      </div>

      <div className={`grid gap-px bg-zinc-900 ${compact ? 'lg:grid-cols-2' : 'xl:grid-cols-2'}`}>
        {TOKEN_SURFACES.map((token) => (
          <div key={token.id} className="bg-black p-5">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="basefm-kicker text-blue-500">{token.network}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-white">{token.name}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Contract</div>
                <code className="block break-all text-xs text-zinc-300">{token.contract}</code>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed">{token.purpose}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{token.detail}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={token.primaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basefm-button-secondary !px-4 !py-2"
                >
                  {token.primaryLabel}
                </Link>
                <Link
                  href={token.secondaryHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="basefm-button-secondary !px-4 !py-2"
                >
                  {token.secondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
