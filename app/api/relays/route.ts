import { NextRequest, NextResponse } from 'next/server';
import { listRelays, upsertRelay } from '@/lib/db/relays';
import { isAdminWallet } from '@/lib/admin/config';

export async function GET() {
  try {
    const relays = await listRelays();
    return NextResponse.json({ relays });
  } catch (err) {
    console.error('[GET /api/relays] error:', err);
    return NextResponse.json({ error: 'Failed to list relays' }, { status: 500 });
  }
}

// POST /api/relays — admin-only, used by the dashboard's "Save YouTube Relay" form.
// Keeps relay registration server-side so listeners can't inject arbitrary
// destinations.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminWallet, key, name, type, required, viewerUrl, probeUrl } = body as {
      adminWallet?: string;
      key?: string;
      name?: string;
      type?: 'origin' | 'first-party' | 'youtube' | 'other';
      required?: boolean;
      viewerUrl?: string | null;
      probeUrl?: string | null;
    };

    if (!adminWallet || !isAdminWallet(adminWallet)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!key || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, type' },
        { status: 400 }
      );
    }

    const relay = await upsertRelay({
      key,
      name,
      type,
      required: required ?? false,
      viewerUrl: viewerUrl ?? null,
      probeUrl: probeUrl ?? null,
    });

    return NextResponse.json({ relay });
  } catch (err) {
    console.error('[POST /api/relays] error:', err);
    return NextResponse.json({ error: 'Failed to upsert relay' }, { status: 500 });
  }
}
