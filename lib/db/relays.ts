import { createServerClient } from '@/lib/supabase/client';

export type RelayStatus = 'healthy' | 'pending' | 'degraded' | 'failed' | 'offline';
export type RelayType = 'origin' | 'first-party' | 'youtube' | 'other';

export interface RelayRow {
  id: string;
  key: string;
  name: string;
  type: RelayType;
  required: boolean;
  enabled: boolean;
  status: RelayStatus;
  viewer_url: string | null;
  probe_url: string | null;
  last_healthy_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Relay {
  id: string;
  key: string;
  name: string;
  type: RelayType;
  required: boolean;
  enabled: boolean;
  status: RelayStatus;
  viewerUrl: string | null;
  probeUrl: string | null;
  lastHealthyAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
}

function fromRow(row: RelayRow): Relay {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    type: row.type,
    required: row.required,
    enabled: row.enabled,
    status: row.status,
    viewerUrl: row.viewer_url,
    probeUrl: row.probe_url,
    lastHealthyAt: row.last_healthy_at,
    lastErrorAt: row.last_error_at,
    lastErrorMessage: row.last_error_message,
  };
}

const supabase = createServerClient();

export async function listRelays(): Promise<Relay[]> {
  const { data, error } = await supabase
    .from('relays')
    .select('*')
    .order('required', { ascending: false })
    .order('name', { ascending: true });
  if (error) throw new Error(`Failed to list relays: ${error.message}`);
  return (data || []).map((row) => fromRow(row as RelayRow));
}

export async function getRelayByKey(key: string): Promise<Relay | null> {
  const { data, error } = await supabase
    .from('relays')
    .select('*')
    .eq('key', key)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get relay: ${error.message}`);
  }
  return fromRow(data as RelayRow);
}

export async function upsertRelay(input: {
  key: string;
  name: string;
  type: RelayType;
  required?: boolean;
  enabled?: boolean;
  viewerUrl?: string | null;
  probeUrl?: string | null;
  status?: RelayStatus;
}): Promise<Relay> {
  const { data, error } = await supabase
    .from('relays')
    .upsert(
      {
        key: input.key,
        name: input.name,
        type: input.type,
        required: input.required ?? false,
        enabled: input.enabled ?? true,
        viewer_url: input.viewerUrl ?? null,
        probe_url: input.probeUrl ?? null,
        status: input.status ?? 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )
    .select()
    .single();
  if (error) throw new Error(`Failed to upsert relay: ${error.message}`);
  return fromRow(data as RelayRow);
}

export async function recordRelayProbeResult(
  key: string,
  result: { ok: boolean; error?: string | null }
): Promise<Relay | null> {
  const now = new Date().toISOString();
  const update: Partial<RelayRow> = result.ok
    ? {
        status: 'healthy',
        last_healthy_at: now,
        last_error_at: null,
        last_error_message: null,
        updated_at: now,
      }
    : {
        status: 'failed',
        last_error_at: now,
        last_error_message: result.error || 'Probe failed',
        updated_at: now,
      };

  const { data, error } = await supabase
    .from('relays')
    .update(update)
    .eq('key', key)
    .select()
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to record probe result: ${error.message}`);
  }
  return fromRow(data as RelayRow);
}
