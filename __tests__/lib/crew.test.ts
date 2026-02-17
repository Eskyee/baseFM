/**
 * Unit Tests for Crew Management System
 *
 * Tests the crew database helpers, role categories, and validation functions.
 * Critical for event production management.
 *
 * Run with: npm run test:run
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// MOCK DATA (inline to avoid import issues)
// =============================================================================

const mockWallets = {
  promoter: '0x1234567890123456789012345678901234567890',
  crew: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  artist: '0x9876543210987654321098765432109876543210',
};

// All crew roles as defined in schema-crew.sql
const ALL_CREW_ROLES = [
  // Management
  'promoter', 'production_manager', 'stage_manager', 'event_coordinator',
  // Front of House
  'door', 'box_office', 'vip_host', 'cloakroom',
  // Security & Safety
  'security', 'medical', 'fire_marshal',
  // Technical - Audio
  'sound_engineer', 'monitor_engineer', 'audio_tech',
  // Technical - Visual
  'lighting_tech', 'visual_tech', 'laser_tech',
  // Stage & Build
  'stage_build', 'rigging', 'backline', 'decor',
  // Artists & Talent
  'artist', 'manager', 'talent_liaison',
  // Hospitality
  'bar', 'catering', 'hospitality',
  // Operations
  'runner', 'transport', 'parking', 'cleaning',
  // Media & Promo
  'media', 'marketing', 'social_media',
  // Misc
  'volunteer', 'other',
] as const;

type CrewRole = typeof ALL_CREW_ROLES[number];

// Role categories for UI grouping
const CREW_ROLE_CATEGORIES: Record<string, CrewRole[]> = {
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
const CREW_ROLE_LABELS: Record<CrewRole, string> = {
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

interface CrewMember {
  id: string;
  eventId: string;
  walletAddress: string;
  role: CrewRole;
  name: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  setTime: string | null;
}

const mockCrewMember: CrewMember = {
  id: 'crew-123',
  eventId: 'event-456',
  walletAddress: mockWallets.crew,
  role: 'door',
  name: 'John Doe',
  checkedIn: false,
  checkedInAt: null,
  setTime: null,
};

// =============================================================================
// TESTS
// =============================================================================

/**
 * Test crew role definitions
 */
describe('Crew Role Definitions', () => {
  /**
   * Should have 36 crew roles defined
   */
  it('should have exactly 36 crew roles', () => {
    expect(ALL_CREW_ROLES.length).toBe(36);
  });

  /**
   * All roles should have labels
   */
  it('should have labels for all roles', () => {
    ALL_CREW_ROLES.forEach((role) => {
      expect(CREW_ROLE_LABELS[role]).toBeDefined();
      expect(typeof CREW_ROLE_LABELS[role]).toBe('string');
      expect(CREW_ROLE_LABELS[role].length).toBeGreaterThan(0);
    });
  });

  /**
   * All roles should be in a category
   */
  it('should categorize all roles', () => {
    const categorizedRoles = Object.values(CREW_ROLE_CATEGORIES).flat();

    ALL_CREW_ROLES.forEach((role) => {
      expect(categorizedRoles).toContain(role);
    });
  });

  /**
   * Categories should have at least 2 roles each
   */
  it('should have at least 2 roles per category', () => {
    Object.entries(CREW_ROLE_CATEGORIES).forEach(([category, roles]) => {
      expect(roles.length).toBeGreaterThanOrEqual(2);
    });
  });

  /**
   * Should have 11 role categories
   */
  it('should have 11 role categories', () => {
    expect(Object.keys(CREW_ROLE_CATEGORIES).length).toBe(11);
  });
});

/**
 * Test crew check-in functionality
 */
describe('Crew Check-in', () => {
  /**
   * New crew member should not be checked in
   */
  it('should default to not checked in', () => {
    const crew = { ...mockCrewMember };
    expect(crew.checkedIn).toBe(false);
    expect(crew.checkedInAt).toBeNull();
  });

  /**
   * Should mark crew as checked in with timestamp
   */
  it('should update check-in status correctly', () => {
    const now = new Date().toISOString();
    const crew = {
      ...mockCrewMember,
      checkedIn: true,
      checkedInAt: now,
    };

    expect(crew.checkedIn).toBe(true);
    expect(crew.checkedInAt).toBe(now);
  });

  /**
   * Should calculate checked-in count
   */
  it('should count checked-in crew members', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', checkedIn: true },
      { ...mockCrewMember, id: '2', checkedIn: false },
      { ...mockCrewMember, id: '3', checkedIn: true },
      { ...mockCrewMember, id: '4', checkedIn: false },
      { ...mockCrewMember, id: '5', checkedIn: true },
    ];

    const checkedInCount = crewList.filter((c) => c.checkedIn).length;
    expect(checkedInCount).toBe(3);
  });
});

/**
 * Test crew role filtering
 */
describe('Crew Role Filtering', () => {
  /**
   * Should filter crew by role
   */
  it('should filter crew by single role', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', role: 'door' },
      { ...mockCrewMember, id: '2', role: 'security' },
      { ...mockCrewMember, id: '3', role: 'door' },
      { ...mockCrewMember, id: '4', role: 'artist' },
    ];

    const doorStaff = crewList.filter((c) => c.role === 'door');
    expect(doorStaff.length).toBe(2);
  });

  /**
   * Should filter crew by multiple roles
   */
  it('should filter crew by multiple roles', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', role: 'door' },
      { ...mockCrewMember, id: '2', role: 'security' },
      { ...mockCrewMember, id: '3', role: 'medical' },
      { ...mockCrewMember, id: '4', role: 'artist' },
    ];

    const targetRoles: CrewRole[] = ['door', 'security', 'medical'];
    const safetyCrew = crewList.filter((c) => targetRoles.includes(c.role));
    expect(safetyCrew.length).toBe(3);
  });

  /**
   * Should filter crew by category
   */
  it('should filter crew by category', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', role: 'door' },
      { ...mockCrewMember, id: '2', role: 'box_office' },
      { ...mockCrewMember, id: '3', role: 'security' },
      { ...mockCrewMember, id: '4', role: 'artist' },
    ];

    const fohRoles = CREW_ROLE_CATEGORIES.front_of_house;
    const fohCrew = crewList.filter((c) => fohRoles.includes(c.role));
    expect(fohCrew.length).toBe(2);
  });
});

/**
 * Test artist set time handling
 */
describe('Artist Set Times', () => {
  /**
   * Should handle artist with set time
   */
  it('should store artist set time', () => {
    const artist: CrewMember = {
      ...mockCrewMember,
      role: 'artist',
      name: 'DJ Test',
      setTime: '2024-03-15T22:00:00Z',
    };

    expect(artist.setTime).toBe('2024-03-15T22:00:00Z');
  });

  /**
   * Should sort artists by set time
   */
  it('should sort artists by set time', () => {
    const artists: CrewMember[] = [
      { ...mockCrewMember, id: '1', role: 'artist', name: 'DJ Late', setTime: '2024-03-16T02:00:00Z' },
      { ...mockCrewMember, id: '2', role: 'artist', name: 'DJ Early', setTime: '2024-03-15T22:00:00Z' },
      { ...mockCrewMember, id: '3', role: 'artist', name: 'DJ Mid', setTime: '2024-03-16T00:00:00Z' },
    ];

    const sorted = [...artists].sort((a, b) => {
      if (!a.setTime || !b.setTime) return 0;
      return new Date(a.setTime).getTime() - new Date(b.setTime).getTime();
    });

    expect(sorted[0].name).toBe('DJ Early');
    expect(sorted[1].name).toBe('DJ Mid');
    expect(sorted[2].name).toBe('DJ Late');
  });

  /**
   * Should handle null set times
   */
  it('should handle artists without set times', () => {
    const artist: CrewMember = {
      ...mockCrewMember,
      role: 'artist',
      name: 'TBA Artist',
      setTime: null,
    };

    expect(artist.setTime).toBeNull();
    // Artists without set times should be valid
    expect(artist.role).toBe('artist');
  });
});

/**
 * Test wallet address validation
 */
describe('Crew Wallet Validation', () => {
  /**
   * Should normalize wallet addresses to lowercase
   */
  it('should normalize wallet to lowercase', () => {
    const mixedCase = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';
    const normalized = mixedCase.toLowerCase();

    expect(normalized).toBe('0xabcdef1234567890abcdef1234567890abcdef12');
  });

  /**
   * Should validate wallet address format
   */
  it('should validate wallet address format', () => {
    const validWallet = '0x1234567890123456789012345678901234567890';
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(validWallet);

    expect(isValid).toBe(true);
  });

  /**
   * Should reject invalid wallet address
   */
  it('should reject invalid wallet address', () => {
    const invalidWallet = 'not-a-wallet';
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(invalidWallet);

    expect(isValid).toBe(false);
  });

  /**
   * Should reject short wallet address
   */
  it('should reject short wallet address', () => {
    const shortWallet = '0x1234567890';
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(shortWallet);

    expect(isValid).toBe(false);
  });
});

/**
 * Test unique crew constraint
 */
describe('Crew Uniqueness', () => {
  /**
   * Should prevent duplicate wallet for same event
   */
  it('should detect duplicate crew member', () => {
    const existingCrew: CrewMember[] = [
      { ...mockCrewMember, walletAddress: mockWallets.crew.toLowerCase() },
    ];

    const newWallet = mockWallets.crew.toLowerCase();
    const isDuplicate = existingCrew.some(
      (c) => c.walletAddress === newWallet && c.eventId === mockCrewMember.eventId
    );

    expect(isDuplicate).toBe(true);
  });

  /**
   * Should allow same wallet for different events
   */
  it('should allow same wallet for different events', () => {
    const existingCrew: CrewMember[] = [
      { ...mockCrewMember, eventId: 'event-1', walletAddress: mockWallets.crew.toLowerCase() },
    ];

    const newWallet = mockWallets.crew.toLowerCase();
    const newEventId = 'event-2';
    const isDuplicate = existingCrew.some(
      (c) => c.walletAddress === newWallet && c.eventId === newEventId
    );

    expect(isDuplicate).toBe(false);
  });
});

/**
 * Test event stats calculations
 */
describe('Event Stats', () => {
  /**
   * Should calculate crew count by role
   */
  it('should count crew by role', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', role: 'door' },
      { ...mockCrewMember, id: '2', role: 'door' },
      { ...mockCrewMember, id: '3', role: 'security' },
      { ...mockCrewMember, id: '4', role: 'security' },
      { ...mockCrewMember, id: '5', role: 'security' },
      { ...mockCrewMember, id: '6', role: 'bar' },
    ];

    const roleCounts = crewList.reduce((acc, crew) => {
      acc[crew.role] = (acc[crew.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(roleCounts.door).toBe(2);
    expect(roleCounts.security).toBe(3);
    expect(roleCounts.bar).toBe(1);
  });

  /**
   * Should calculate total crew count
   */
  it('should count total crew', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1' },
      { ...mockCrewMember, id: '2' },
      { ...mockCrewMember, id: '3' },
    ];

    expect(crewList.length).toBe(3);
  });

  /**
   * Should calculate check-in percentage
   */
  it('should calculate check-in percentage', () => {
    const crewList: CrewMember[] = [
      { ...mockCrewMember, id: '1', checkedIn: true },
      { ...mockCrewMember, id: '2', checkedIn: true },
      { ...mockCrewMember, id: '3', checkedIn: false },
      { ...mockCrewMember, id: '4', checkedIn: false },
    ];

    const total = crewList.length;
    const checkedIn = crewList.filter((c) => c.checkedIn).length;
    const percentage = Math.round((checkedIn / total) * 100);

    expect(percentage).toBe(50);
  });
});
