// Crew Notification API
// Sends notifications to event crew via Push + Slack
import { NextRequest, NextResponse } from 'next/server';
import { getEventCrew, logCrewNotification, type CrewRole } from '@/lib/db/crew';
import { sendSlackMessage } from '@/lib/slack/webhook';

// Notification templates
const NOTIFICATION_TEMPLATES: Record<string, { title: string; body: string }> = {
  doors_open: {
    title: 'Doors Opening',
    body: 'Doors are now open! All crew to positions.',
  },
  doors_30min: {
    title: '30 Minutes to Doors',
    body: 'Doors open in 30 minutes. Final preparations.',
  },
  artist_arriving: {
    title: 'Artist Arriving',
    body: '{name} is arriving at the venue.',
  },
  set_starting: {
    title: 'Set Starting',
    body: '{name} is about to start their set.',
  },
  milestone_100: {
    title: 'Milestone: 100 Scans',
    body: '100 tickets scanned! Great turnout.',
  },
  milestone_500: {
    title: 'Milestone: 500 Scans',
    body: '500 people through the door!',
  },
  emergency: {
    title: 'URGENT',
    body: '{message}',
  },
  custom: {
    title: '{title}',
    body: '{message}',
  },
};

// POST /api/crew/notify - Send notification to crew
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      notificationType,
      roles, // Which roles to notify, empty = all
      sentBy,
      customTitle,
      customMessage,
      artistName,
    } = body;

    if (!eventId || !notificationType || !sentBy) {
      return NextResponse.json(
        { error: 'eventId, notificationType, and sentBy are required' },
        { status: 400 }
      );
    }

    // Get template
    const template = NOTIFICATION_TEMPLATES[notificationType];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Build message
    let title = template.title;
    let messageBody = template.body;

    // Replace placeholders
    if (artistName) {
      title = title.replace('{name}', artistName);
      messageBody = messageBody.replace('{name}', artistName);
    }
    if (customTitle) {
      title = title.replace('{title}', customTitle);
    }
    if (customMessage) {
      messageBody = messageBody.replace('{message}', customMessage);
    }

    // Get crew members to notify
    const allCrew = await getEventCrew(eventId);
    const targetRoles: CrewRole[] = roles && roles.length > 0
      ? roles
      : ['promoter', 'door', 'bar', 'security', 'artist', 'production', 'manager', 'media', 'vip'];

    const crewToNotify = allCrew.filter((c) => targetRoles.includes(c.role));

    const sentVia: string[] = [];

    // Send Slack notification (if webhook configured)
    try {
      const slackMessage = `*${title}*\n${messageBody}\n_Sent to ${crewToNotify.length} crew members_`;
      await sendSlackMessage(slackMessage);
      sentVia.push('slack');
    } catch {
      // Slack not configured or failed
    }

    // TODO: Send push notifications to crew wallets
    // This would require storing push subscriptions per wallet
    // For now, we log the notification and rely on Slack

    // Log the notification
    await logCrewNotification(
      eventId,
      notificationType,
      `${title}: ${messageBody}`,
      targetRoles,
      sentVia,
      sentBy
    );

    return NextResponse.json({
      success: true,
      notifiedCount: crewToNotify.length,
      sentVia,
      message: `${title}: ${messageBody}`,
    });
  } catch (error) {
    console.error('Error sending crew notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
