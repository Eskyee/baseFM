import { DJ } from './dj';

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  showName: string;
  description?: string;
  genre?: string;
  coverImageUrl?: string;
  djId?: string;
  djWalletAddress?: string;
  isRecurring: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Joined data
  dj?: DJ;
}

export interface ScheduleSlotRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  show_name: string;
  description: string | null;
  genre: string | null;
  cover_image_url: string | null;
  dj_id: string | null;
  dj_wallet_address: string | null;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  djs?: {
    id: string;
    name: string;
    slug: string;
    avatar_url: string | null;
    is_resident: boolean;
    is_verified: boolean;
  } | null;
}

export function scheduleSlotFromRow(row: ScheduleSlotRow): ScheduleSlot {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    showName: row.show_name,
    description: row.description || undefined,
    genre: row.genre || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    djId: row.dj_id || undefined,
    djWalletAddress: row.dj_wallet_address || undefined,
    isRecurring: row.is_recurring,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    dj: row.djs ? {
      id: row.djs.id,
      walletAddress: row.dj_wallet_address || '',
      name: row.djs.name,
      slug: row.djs.slug,
      avatarUrl: row.djs.avatar_url || undefined,
      genres: [],
      isResident: row.djs.is_resident,
      isVerified: row.djs.is_verified,
      isBanned: false,
      totalShows: 0,
      totalListeners: 0,
      createdAt: '',
      updatedAt: '',
    } : undefined,
  };
}

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface CreateScheduleSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  showName: string;
  description?: string;
  genre?: string;
  coverImageUrl?: string;
  djId?: string;
  djWalletAddress?: string;
  isRecurring?: boolean;
}

export interface UpdateScheduleSlotInput {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  showName?: string;
  description?: string;
  genre?: string;
  coverImageUrl?: string;
  djId?: string;
  djWalletAddress?: string;
  isRecurring?: boolean;
  isActive?: boolean;
}
