// Stream status constants for consistent usage across the application
export const STREAM_STATUS = {
  CREATED: 'CREATED',
  PREPARING: 'PREPARING',
  LIVE: 'LIVE',
  ENDING: 'ENDING',
  ENDED: 'ENDED',
} as const;

// Stream statuses that can be stopped (ENDING included so DJs can force-end a stream
// stuck in the Mux idle window when their encoder dropped or the auto-disconnect
// webhook hasn't fired yet)
export const STOPPABLE_STATUSES = [
  STREAM_STATUS.PREPARING,
  STREAM_STATUS.LIVE,
  STREAM_STATUS.ENDING,
] as const;

// Mux stream statuses
export const MUX_STATUS = {
  IDLE: 'idle',
  ACTIVE: 'active',
  DISCONNECTED: 'disconnected',
} as const;
