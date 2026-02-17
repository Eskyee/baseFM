// Slack Webhook Integration
// Sends notifications to different Slack channels

// Channel-specific webhook URLs from environment variables
const SLACK_WEBHOOKS = {
  bookings: process.env.SLACK_WEBHOOK_BOOKINGS,
  streams: process.env.SLACK_WEBHOOK_STREAMS,
  alerts: process.env.SLACK_WEBHOOK_ALERTS,
  general: process.env.SLACK_WEBHOOK_GENERAL,
} as const;

type SlackChannel = keyof typeof SLACK_WEBHOOKS;

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: {
    type: string;
    text: string;
  }[];
  elements?: unknown[];
  accessory?: unknown;
}

interface SlackMessage {
  text?: string;
  blocks?: SlackBlock[];
  attachments?: unknown[];
}

// Simple text message to Slack
export async function sendSlackMessage(
  message: string,
  channel: SlackChannel = 'general'
): Promise<boolean> {
  return sendSlackNotification({ text: message }, channel);
}

// Send notification to a Slack channel
export async function sendSlackNotification(
  message: SlackMessage,
  channel: SlackChannel = 'general'
): Promise<boolean> {
  const webhookUrl = SLACK_WEBHOOKS[channel] || SLACK_WEBHOOKS.general;

  if (!webhookUrl) {
    console.warn(`Slack webhook not configured for channel: ${channel}`);
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`Slack webhook failed: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Slack webhook error:', error);
    return false;
  }
}

// Stream started notification
export async function notifyStreamStarted(stream: {
  title: string;
  djName: string;
  genre?: string;
  streamUrl: string;
}): Promise<boolean> {
  return sendSlackNotification(
    {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔴 Stream Started!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Show:*\n${stream.title}`,
            },
            {
              type: 'mrkdwn',
              text: `*DJ:*\n${stream.djName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Genre:*\n${stream.genre || 'Various'}`,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🎧 Listen Live',
                emoji: true,
              },
              url: stream.streamUrl,
              style: 'primary',
            },
          ],
        },
      ],
    },
    'streams'
  );
}

// Stream ended notification
export async function notifyStreamEnded(stream: {
  title: string;
  djName: string;
  duration: string;
  peakListeners?: number;
}): Promise<boolean> {
  return sendSlackNotification(
    {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⏹️ Stream Ended',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Show:*\n${stream.title}`,
            },
            {
              type: 'mrkdwn',
              text: `*DJ:*\n${stream.djName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${stream.duration}`,
            },
            ...(stream.peakListeners
              ? [
                  {
                    type: 'mrkdwn',
                    text: `*Peak Listeners:*\n${stream.peakListeners}`,
                  },
                ]
              : []),
          ],
        },
      ],
    },
    'streams'
  );
}

// Listener milestone notification
export async function notifyListenerMilestone(stream: {
  title: string;
  djName: string;
  listenerCount: number;
  streamUrl: string;
}): Promise<boolean> {
  return sendSlackNotification(
    {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🎉 ${stream.listenerCount} Listeners!`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${stream.djName}* just hit *${stream.listenerCount} listeners* on "${stream.title}"!`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🎧 Join the Stream',
                emoji: true,
              },
              url: stream.streamUrl,
            },
          ],
        },
      ],
    },
    'streams'
  );
}

// New DJ signup notification
export async function notifyNewDJ(dj: {
  name: string;
  walletAddress: string;
  profileUrl: string;
}): Promise<boolean> {
  return sendSlackNotification(
    {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎧 New DJ Joined!',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${dj.name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Wallet:*\n\`${dj.walletAddress.slice(0, 6)}...${dj.walletAddress.slice(-4)}\``,
            },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Profile',
                emoji: true,
              },
              url: dj.profileUrl,
            },
          ],
        },
      ],
    },
    'alerts'
  );
}

// System alert notification
export async function notifySystemAlert(alert: {
  level: 'info' | 'warning' | 'error';
  title: string;
  message: string;
}): Promise<boolean> {
  const emoji = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '🚨',
  }[alert.level];

  return sendSlackNotification(
    {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} ${alert.title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: alert.message,
          },
        },
      ],
    },
    'alerts'
  );
}
