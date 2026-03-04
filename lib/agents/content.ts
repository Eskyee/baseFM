// Content generation for agent posts
// Uses templates with optional AI enhancement

import { Agent, AgentTrack, AgentTone } from '@/types/agent';

// Post templates by tone
const TEMPLATES: Record<AgentTone, string[]> = {
  professional: [
    'New release: "{title}" - now available. {link}',
    'Check out my latest track "{title}" {hashtags} {link}',
    'Excited to share "{title}" with you all. {link}',
    '"{title}" is out now. Hope you enjoy it. {link}',
    'Fresh music: "{title}" {hashtags} {link}',
  ],
  underground: [
    'late night session "{title}" {link}',
    'new heat dropped "{title}" {hashtags} {link}',
    'for the heads: "{title}" {link}',
    '"{title}" out now. iykyk {link}',
    'fresh from the studio "{title}" {hashtags} {link}',
    'this one hits different "{title}" {link}',
  ],
  hype: [
    'JUST DROPPED "{title}" {hashtags} {link}',
    'NEW MUSIC ALERT "{title}" is OUT NOW {link}',
    'LETS GOOO "{title}" just dropped {link}',
    'THE WAIT IS OVER "{title}" {hashtags} {link}',
    'BIG TUNE INCOMING "{title}" {link}',
  ],
  chill: [
    'vibes. "{title}" {link}',
    'made something nice "{title}" {link}',
    'for your late nights: "{title}" {link}',
    '"{title}" for the mood {hashtags} {link}',
    'easy listening: "{title}" {link}',
  ],
  mysterious: [
    '"{title}" {link}',
    '... "{title}" {link}',
    '{title} {link}',
    'transmission incoming: "{title}" {link}',
    '▓▒░ "{title}" ░▒▓ {link}',
  ],
};

// General promotion templates (no track)
const PROMO_TEMPLATES: Record<AgentTone, string[]> = {
  professional: [
    'Spinning {genre} vibes tonight. Tune in to baseFM',
    'Curating the best {genre} sounds on baseFM',
    'New music discovery session on baseFM',
  ],
  underground: [
    'digging through the crates on baseFM',
    '{genre} heads know where to find us',
    'basement frequencies on baseFM rn',
  ],
  hype: [
    'LIVE ON baseFM RIGHT NOW',
    'WE GO AGAIN. baseFM {genre} session',
    'ENERGY. baseFM. NOW.',
  ],
  chill: [
    'low key vibes on baseFM',
    '{genre} for the timeline',
    'smooth selections on baseFM today',
  ],
  mysterious: [
    'baseFM.',
    'frequencies.',
    '...',
  ],
};

// Engagement templates (for auto-engage)
const ENGAGEMENT_TEMPLATES = [
  'fire track',
  'this slaps',
  'heavy',
  'nice one',
  'big tune',
  'quality',
  'love this',
  'proper',
];

// Genre-specific hashtags
const GENRE_HASHTAGS: Record<string, string[]> = {
  'techno': ['#techno', '#darktechno', '#technomusic', '#rave'],
  'house': ['#house', '#housemusic', '#deephouse', '#techhouse'],
  'drum-and-bass': ['#dnb', '#drumandbass', '#jungle', '#liquid'],
  'garage': ['#ukgarage', '#garage', '#2step', '#ukbaseline'],
  'dubstep': ['#dubstep', '#bass', '#bassmusic', '#wobble'],
  'ambient': ['#ambient', '#electronica', '#atmospheric', '#soundscape'],
  'experimental': ['#experimental', '#avantgarde', '#noise', '#glitch'],
  'breakbeat': ['#breakbeat', '#breaks', '#bigbeat', '#electronicmusic'],
  'trance': ['#trance', '#psytrance', '#uplifting', '#progressive'],
  'electro': ['#electro', '#electroclash', '#synthwave', '#newwave'],
};

interface GeneratePostContentParams {
  agent: Agent;
  track?: AgentTrack;
  type: 'track_promo' | 'general_promo' | 'engagement';
  targetCast?: { text: string; authorUsername: string };
}

/**
 * Generate post content based on agent settings and content type
 */
export function generatePostContent(params: GeneratePostContentParams): string {
  const { agent, track, type, targetCast } = params;

  switch (type) {
    case 'track_promo':
      return generateTrackPromo(agent, track);
    case 'general_promo':
      return generateGeneralPromo(agent);
    case 'engagement':
      return generateEngagementReply(targetCast);
    default:
      return generateGeneralPromo(agent);
  }
}

function generateTrackPromo(agent: Agent, track?: AgentTrack): string {
  if (!track) {
    return generateGeneralPromo(agent);
  }

  const templates = TEMPLATES[agent.tone];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Build hashtags
  const hashtags = buildHashtags(agent, track);

  // Build link (to track or baseFM)
  const link = track.sourceUrl || `https://basefm.space`;

  return template
    .replace('{title}', track.title)
    .replace('{hashtags}', hashtags)
    .replace('{link}', link)
    .trim();
}

function generateGeneralPromo(agent: Agent): string {
  const templates = PROMO_TEMPLATES[agent.tone];
  const template = templates[Math.floor(Math.random() * templates.length)];

  const genre = agent.genres[0] || 'electronic';

  return template
    .replace('{genre}', genre)
    .trim();
}

function generateEngagementReply(targetCast?: { text: string; authorUsername: string }): string {
  const template = ENGAGEMENT_TEMPLATES[Math.floor(Math.random() * ENGAGEMENT_TEMPLATES.length)];

  if (targetCast?.authorUsername) {
    return `@${targetCast.authorUsername} ${template}`;
  }

  return template;
}

function buildHashtags(agent: Agent, track?: AgentTrack): string {
  const hashtags: string[] = [];

  // Add agent's custom hashtags
  if (agent.hashtags.length > 0) {
    hashtags.push(...agent.hashtags.slice(0, 2));
  }

  // Add genre-specific hashtags
  const genre = track?.genre || agent.genres[0];
  if (genre && GENRE_HASHTAGS[genre.toLowerCase()]) {
    const genreTags = GENRE_HASHTAGS[genre.toLowerCase()];
    hashtags.push(genreTags[Math.floor(Math.random() * genreTags.length)]);
  }

  // Always add baseFM hashtag
  hashtags.push('#baseFM');

  // Dedupe and limit
  const unique = [...new Set(hashtags)].slice(0, 4);
  return unique.join(' ');
}

/**
 * Check if current hour is a peak hour for the agent
 */
export function isPeakHour(agent: Agent): boolean {
  const currentHour = new Date().getUTCHours();
  return agent.peakHours.includes(currentHour);
}

/**
 * Calculate post priority based on various factors
 */
export function calculatePostPriority(agent: Agent, hasNewTrack: boolean): number {
  let priority = 0;

  // Peak hours = higher priority
  if (isPeakHour(agent)) {
    priority += 10;
  }

  // New tracks = higher priority
  if (hasNewTrack) {
    priority += 20;
  }

  // Active posting frequency = higher priority
  const frequencyBonus = {
    minimal: 0,
    moderate: 5,
    active: 10,
  };
  priority += frequencyBonus[agent.postingFrequency];

  // Boosted agents get priority (handled separately in runner)

  return priority;
}

/**
 * Get the maximum posts per day for an agent's tier
 */
export function getPostLimitForTier(tier: 'free' | 'pro' | 'label'): number {
  const limits = {
    free: 3,
    pro: 15,
    label: 50,
  };
  return limits[tier];
}
