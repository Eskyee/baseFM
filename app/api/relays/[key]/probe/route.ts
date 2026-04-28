import { NextRequest, NextResponse } from 'next/server';
import { getRelayByKey, recordRelayProbeResult } from '@/lib/db/relays';

// Probes a relay endpoint to determine whether it is reachable.
// We deliberately limit this to public HTTP(S) GET/HEAD probes against the
// relay's viewer/probe URL — there is no SSRF surface for arbitrary internal
// hosts because the URL is admin-managed in the relays table.
export async function POST(
  _request: NextRequest,
  { params }: { params: { key: string } }
) {
  const relay = await getRelayByKey(params.key);
  if (!relay) {
    return NextResponse.json({ error: 'Relay not found' }, { status: 404 });
  }

  const target = relay.probeUrl || relay.viewerUrl;
  if (!target) {
    await recordRelayProbeResult(relay.key, {
      ok: false,
      error: 'No probe URL configured',
    });
    return NextResponse.json(
      { ok: false, error: 'No probe URL configured for this relay.' },
      { status: 400 }
    );
  }

  try {
    const url = new URL(target);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Probe URL must be http(s)');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    const response = await fetch(url.toString(), {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    }).catch(async (err) => {
      // Some hosts reject HEAD; fall back to GET.
      if (err?.name === 'AbortError') throw err;
      return fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        cache: 'no-store',
      });
    });
    clearTimeout(timer);

    const ok = response.ok || response.status < 500;
    const updated = await recordRelayProbeResult(relay.key, {
      ok,
      error: ok ? null : `HTTP ${response.status}`,
    });

    return NextResponse.json({
      ok,
      status: response.status,
      relay: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Probe failed';
    const updated = await recordRelayProbeResult(relay.key, { ok: false, error: message });
    return NextResponse.json({ ok: false, error: message, relay: updated }, { status: 200 });
  }
}
