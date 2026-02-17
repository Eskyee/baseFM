// Event Crew Management Database Helpers
import { createServerClient } from '@/lib/supabase/client';

// Comprehensive crew roles for festival production
export type CrewRole =
  // Management
  | 'promoter'
  | 'production_manager'
  | 'stage_manager'
  | 'event_coordinator'
  // Front of House
  | 'door'
  | 'box_office'
  | 'vip_host'
  | 'cloakroom'
  // Security & Safety
  | 'security'
  | 'medical'
  | 'fire_marshal'
  // Technical - Audio
  | 'sound_engineer'
  | 'monitor_engineer'
  | 'audio_tech'
  // Technical - Visual
  | 'lighting_tech'
  | 'visual_tech'
  | 'laser_tech'
  // Stage & Build
  | 'stage_build'
  | 'rigging'
  | 'backline'
  | 'decor'
  // Artists & Talent
  | 'artist'
  | 'manager'
  | 'talent_liaison'
  // Hospitality
  | 'bar'
  | 'catering'
  | 'hospitality'
  // Operations
  | 'runner'
  | 'transport'
  | 'parking'
  | 'cleaning'
  // Media & Promo
  | 'media'
  | 'marketing'
  | 'social_media'
  // Misc
  | 'volunteer'
  | 'other';

// Role categories for UI grouping
export const CREW_ROLE_CATEGORIES = {
  management: ['promoter', 'production_manager', 'stage_manager', 'event_coordinator'],
  front_of_house: ['door', 'box_office', 'vip_host', 'cloakroom'],
  security_safety: ['security', 'medical', 'fire_marshal'],
  audio: ['sound_engineer', 'monitor_engineer', 'audio_tech'],
  visual: ['lighting_tech', 'visual_tech', 'laser_tech'],
  stage_build: ['stage_build', 'rigging', 'backline', 'decor'],
  talent: ['artist', 'manager', 'talent_liaison'],
  hospitality: ['bar', 'catering', 'hospitality'],
  operations: ['runner', 'transport', 'parking', 'cleaning'],
  media: ['media', 'marketing', 'social_media'],
  misc: ['volunteer', 'other'],
};

// Human-readable role labels
export const CREW_ROLE_LABELS: Record<CrewRole, string> = {
  promoter: 'Promoter',
  production_manager: 'Production Manager',
  stage_manager: 'Stage Manager',
  event_coordinator: 'Event Coordinator',
  door: 'Door Staff',
  box_office: 'Box Office',
  vip_host: 'VIP Host',
  cloakroom: 'Cloakroom',
  security: 'Security',
  medical: 'Medical/First Aid',
  fire_marshal: 'Fire Marshal',
  sound_engineer: 'Sound Engineer',
  monitor_engineer: 'Monitor Engineer',
  audio_tech: 'Audio Tech',
  lighting_tech: 'Lighting Tech',
  visual_tech: 'Visual/VJ',
  laser_tech: 'Laser Operator',
  stage_build: 'Stage Build',
  rigging: 'Rigging Crew',
  backline: 'Backline Tech',
  decor: 'Decor/Theming',
  artist: 'Artist/DJ',
  manager: 'Artist Manager',
  talent_liaison: 'Talent Liaison',
  bar: 'Bar Staff',
  catering: 'Catering',
  hospitality: 'Hospitality',
  runner: 'Runner',
  transport: 'Transport',
  parking: 'Parking',
  cleaning: 'Cleaning',
  media: 'Photo/Video',
  marketing: 'Marketing',
  social_media: 'Social Media',
  volunteer: 'Volunteer',
  other: 'Other',
};

export interface CrewMember {
  id: string;
  eventId: string;
  walletAddress: string;
  role: CrewRole;
  name: string | null;
  contact: string | null;
  setTime: string | null;
  setDurationMinutes: number | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  notes: string | null;
  addedBy: string;
  createdAt: string;
}

export interface EventStats {
  ticketsSold: number;
  ticketsScanned: number;
  revenueUsdc: number;
  currentCapacity: number;
  snapshotAt: string;
}

// Get all crew for an event
export async function getEventCrew(eventId: string): Promise<CrewMember[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_crew')
    .select('*')
    .eq('event_id', eventId)
    .order('role')
    .order('name');

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    eventId: row.event_id,
    walletAddress: row.wallet_address,
    role: row.role as CrewRole,
    name: row.name,
    contact: row.contact,
    setTime: row.set_time,
    setDurationMinutes: row.set_duration_minutes,
    checkedIn: row.checked_in,
    checkedInAt: row.checked_in_at,
    notes: row.notes,
    addedBy: row.added_by,
    createdAt: row.created_at,
  }));
}

// Add crew member to event
export async function addCrewMember(
  eventId: string,
  walletAddress: string,
  role: CrewRole,
  addedBy: string,
  options?: {
    name?: string;
    contact?: string;
    setTime?: string;
    setDurationMinutes?: number;
    notes?: string;
  }
): Promise<CrewMember> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_crew')
    .insert({
      event_id: eventId,
      wallet_address: walletAddress.toLowerCase(),
      role,
      added_by: addedBy.toLowerCase(),
      name: options?.name || null,
      contact: options?.contact || null,
      set_time: options?.setTime || null,
      set_duration_minutes: options?.setDurationMinutes || null,
      notes: options?.notes || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    eventId: data.event_id,
    walletAddress: data.wallet_address,
    role: data.role as CrewRole,
    name: data.name,
    contact: data.contact,
    setTime: data.set_time,
    setDurationMinutes: data.set_duration_minutes,
    checkedIn: data.checked_in,
    checkedInAt: data.checked_in_at,
    notes: data.notes,
    addedBy: data.added_by,
    createdAt: data.created_at,
  };
}

// Remove crew member
export async function removeCrewMember(crewId: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('event_crew')
    .delete()
    .eq('id', crewId);

  if (error) throw error;
}

// Check in crew member
export async function checkInCrewMember(
  crewId: string
): Promise<CrewMember> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_crew')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', crewId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    eventId: data.event_id,
    walletAddress: data.wallet_address,
    role: data.role as CrewRole,
    name: data.name,
    contact: data.contact,
    setTime: data.set_time,
    setDurationMinutes: data.set_duration_minutes,
    checkedIn: data.checked_in,
    checkedInAt: data.checked_in_at,
    notes: data.notes,
    addedBy: data.added_by,
    createdAt: data.created_at,
  };
}

// Check if wallet is crew for an event
export async function isEventCrew(
  eventId: string,
  walletAddress: string
): Promise<{ isCrew: boolean; role: CrewRole | null }> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_crew')
    .select('role')
    .eq('event_id', eventId)
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return { isCrew: false, role: null };
  }

  return { isCrew: true, role: data.role as CrewRole };
}

// Get event stats
export async function getEventStats(eventId: string): Promise<EventStats | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_stats')
    .select('*')
    .eq('event_id', eventId)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    ticketsSold: data.tickets_sold,
    ticketsScanned: data.tickets_scanned,
    revenueUsdc: parseFloat(data.revenue_usdc),
    currentCapacity: data.current_capacity,
    snapshotAt: data.snapshot_at,
  };
}

// Update event stats
export async function updateEventStats(
  eventId: string,
  stats: Partial<EventStats>
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('event_stats').insert({
    event_id: eventId,
    tickets_sold: stats.ticketsSold ?? 0,
    tickets_scanned: stats.ticketsScanned ?? 0,
    revenue_usdc: stats.revenueUsdc ?? 0,
    current_capacity: stats.currentCapacity ?? 0,
  });

  if (error) throw error;
}

// Log a crew notification
export async function logCrewNotification(
  eventId: string,
  type: string,
  message: string,
  roles: CrewRole[],
  sentVia: string[],
  sentBy: string
): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase.from('crew_notifications').insert({
    event_id: eventId,
    notification_type: type,
    message,
    sent_to_roles: roles,
    sent_via: sentVia,
    sent_by: sentBy.toLowerCase(),
  });

  if (error) throw error;
}

// Get artists sorted by set time
export async function getEventLineup(eventId: string): Promise<CrewMember[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('event_crew')
    .select('*')
    .eq('event_id', eventId)
    .eq('role', 'artist')
    .order('set_time', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    eventId: row.event_id,
    walletAddress: row.wallet_address,
    role: row.role as CrewRole,
    name: row.name,
    contact: row.contact,
    setTime: row.set_time,
    setDurationMinutes: row.set_duration_minutes,
    checkedIn: row.checked_in,
    checkedInAt: row.checked_in_at,
    notes: row.notes,
    addedBy: row.added_by,
    createdAt: row.created_at,
  }));
}
