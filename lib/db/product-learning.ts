import { createServerClient } from '@/lib/supabase/client';

export type ProductLearningSeverity = 'info' | 'warning' | 'error';

export interface ProductLearningEventInput {
  eventType: string;
  severity?: ProductLearningSeverity;
  surface: string;
  route?: string;
  walletAddress?: string | null;
  streamId?: string | null;
  details?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ProductLearningEventRow {
  id: string;
  event_type: string;
  severity: ProductLearningSeverity;
  surface: string;
  route: string | null;
  wallet_address: string | null;
  stream_id: string | null;
  details: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ProductLearningInsight {
  key: string;
  eventType: string;
  severity: ProductLearningSeverity;
  surface: string;
  count: number;
  lastSeenAt: string;
  sampleDetails: string[];
}

export async function recordProductLearningEvent(input: ProductLearningEventInput) {
  const supabase = createServerClient();

  const { error } = await supabase.from('product_learning_events').insert({
    event_type: input.eventType,
    severity: input.severity || 'info',
    surface: input.surface,
    route: input.route || null,
    wallet_address: input.walletAddress?.toLowerCase() || null,
    stream_id: input.streamId || null,
    details: input.details || null,
    metadata: input.metadata || null,
  });

  if (error) {
    throw new Error(`Failed to record product learning event: ${error.message}`);
  }
}

export async function getRecentProductLearningEvents(days = 7) {
  const supabase = createServerClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('product_learning_events')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    throw new Error(`Failed to load product learning events: ${error.message}`);
  }

  return (data || []) as ProductLearningEventRow[];
}

export function buildProductLearningInsights(events: ProductLearningEventRow[]): ProductLearningInsight[] {
  const grouped = new Map<string, ProductLearningInsight>();

  for (const event of events) {
    const key = `${event.event_type}:${event.surface}:${event.severity}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        key,
        eventType: event.event_type,
        severity: event.severity,
        surface: event.surface,
        count: 1,
        lastSeenAt: event.created_at,
        sampleDetails: event.details ? [event.details] : [],
      });
      continue;
    }

    existing.count += 1;
    if (event.created_at > existing.lastSeenAt) {
      existing.lastSeenAt = event.created_at;
    }
    if (event.details && !existing.sampleDetails.includes(event.details) && existing.sampleDetails.length < 3) {
      existing.sampleDetails.push(event.details);
    }
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const severityRank = { error: 3, warning: 2, info: 1 };
    if (severityRank[b.severity] !== severityRank[a.severity]) {
      return severityRank[b.severity] - severityRank[a.severity];
    }
    return b.count - a.count;
  });
}
