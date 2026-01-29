import { createServerClient } from '@/lib/supabase/client';
import {
  ScheduleSlot,
  ScheduleSlotRow,
  scheduleSlotFromRow,
  CreateScheduleSlotInput,
  UpdateScheduleSlotInput,
} from '@/types/schedule';

export async function getScheduleSlots(options?: {
  dayOfWeek?: number;
  activeOnly?: boolean;
}): Promise<ScheduleSlot[]> {
  const supabase = createServerClient();

  let query = supabase
    .from('schedule_slots')
    .select(`
      *,
      djs (
        id,
        name,
        slug,
        avatar_url,
        is_resident,
        is_verified
      )
    `)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (options?.dayOfWeek !== undefined) {
    query = query.eq('day_of_week', options.dayOfWeek);
  }

  if (options?.activeOnly !== false) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data.map((row) => scheduleSlotFromRow(row as ScheduleSlotRow));
}

export async function getScheduleSlotById(id: string): Promise<ScheduleSlot | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('schedule_slots')
    .select(`
      *,
      djs (
        id,
        name,
        slug,
        avatar_url,
        is_resident,
        is_verified
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return scheduleSlotFromRow(data as ScheduleSlotRow);
}

export async function getTodaySchedule(): Promise<ScheduleSlot[]> {
  const today = new Date().getDay(); // 0=Sunday
  return getScheduleSlots({ dayOfWeek: today, activeOnly: true });
}

export async function getCurrentAndUpcomingSlots(limit: number = 5): Promise<ScheduleSlot[]> {
  const supabase = createServerClient();
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  // Get slots for today that haven't ended yet, plus upcoming days
  const { data, error } = await supabase
    .from('schedule_slots')
    .select(`
      *,
      djs (
        id,
        name,
        slug,
        avatar_url,
        is_resident,
        is_verified
      )
    `)
    .eq('is_active', true)
    .or(`day_of_week.gt.${currentDay},and(day_of_week.eq.${currentDay},end_time.gt.${currentTime})`)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => scheduleSlotFromRow(row as ScheduleSlotRow));
}

export async function createScheduleSlot(input: CreateScheduleSlotInput): Promise<ScheduleSlot> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('schedule_slots')
    .insert({
      day_of_week: input.dayOfWeek,
      start_time: input.startTime,
      end_time: input.endTime,
      show_name: input.showName,
      description: input.description,
      genre: input.genre,
      cover_image_url: input.coverImageUrl,
      dj_id: input.djId,
      dj_wallet_address: input.djWalletAddress,
      is_recurring: input.isRecurring ?? true,
    })
    .select(`
      *,
      djs (
        id,
        name,
        slug,
        avatar_url,
        is_resident,
        is_verified
      )
    `)
    .single();

  if (error) throw new Error(error.message);
  return scheduleSlotFromRow(data as ScheduleSlotRow);
}

export async function updateScheduleSlot(
  id: string,
  input: UpdateScheduleSlotInput
): Promise<ScheduleSlot> {
  const supabase = createServerClient();

  const updateData: Record<string, unknown> = {};

  if (input.dayOfWeek !== undefined) updateData.day_of_week = input.dayOfWeek;
  if (input.startTime !== undefined) updateData.start_time = input.startTime;
  if (input.endTime !== undefined) updateData.end_time = input.endTime;
  if (input.showName !== undefined) updateData.show_name = input.showName;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.genre !== undefined) updateData.genre = input.genre;
  if (input.coverImageUrl !== undefined) updateData.cover_image_url = input.coverImageUrl;
  if (input.djId !== undefined) updateData.dj_id = input.djId;
  if (input.djWalletAddress !== undefined) updateData.dj_wallet_address = input.djWalletAddress;
  if (input.isRecurring !== undefined) updateData.is_recurring = input.isRecurring;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await supabase
    .from('schedule_slots')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      djs (
        id,
        name,
        slug,
        avatar_url,
        is_resident,
        is_verified
      )
    `)
    .single();

  if (error) throw new Error(error.message);
  return scheduleSlotFromRow(data as ScheduleSlotRow);
}

export async function deleteScheduleSlot(id: string): Promise<void> {
  const supabase = createServerClient();

  const { error } = await supabase
    .from('schedule_slots')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
