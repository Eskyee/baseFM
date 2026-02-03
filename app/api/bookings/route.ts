import { NextRequest, NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/slack/webhook';
import { supabase } from '@/lib/supabase/client';

interface BookingInquiry {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service: string;
  eventType: string;
  eventDate?: string;
  location?: string;
  budget?: string;
  attendees?: string;
  details?: string;
}

const serviceLabels: Record<string, string> = {
  'sound-system': 'Sound System Hire',
  'av-production': 'AV & Visual Production',
  'stage-production': 'Stage & Rigging',
  'dj-booking': 'DJ & Artist Booking',
  'event-management': 'Event Management',
  'livestream': 'Live Stream Production',
  'other': 'Other / Custom Package',
};

const budgetLabels: Record<string, string> = {
  'under-1k': 'Under £1,000',
  '1k-5k': '£1,000 - £5,000',
  '5k-10k': '£5,000 - £10,000',
  '10k-25k': '£10,000 - £25,000',
  '25k-50k': '£25,000 - £50,000',
  '50k+': '£50,000+',
};

export async function POST(request: NextRequest) {
  try {
    const data: BookingInquiry = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.service || !data.eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store in database
    const { error: dbError } = await supabase.from('booking_inquiries').insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service: data.service,
      event_type: data.eventType,
      event_date: data.eventDate || null,
      location: data.location || null,
      budget: data.budget || null,
      attendees: data.attendees || null,
      details: data.details || null,
      status: 'new',
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Failed to store booking inquiry:', dbError);
      // Continue anyway - Slack notification is more important
    }

    // Send Slack notification
    const slackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎫 New Booking Inquiry',
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${data.name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${data.email}`,
            },
            {
              type: 'mrkdwn',
              text: `*Phone:*\n${data.phone || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${data.company || 'Not provided'}`,
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Service:*\n${serviceLabels[data.service] || data.service}`,
            },
            {
              type: 'mrkdwn',
              text: `*Event Type:*\n${data.eventType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Event Date:*\n${data.eventDate || 'TBD'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Location:*\n${data.location || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Budget:*\n${budgetLabels[data.budget || ''] || data.budget || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Attendees:*\n${data.attendees || 'Not specified'}`,
            },
          ],
        },
        ...(data.details
          ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Additional Details:*\n${data.details}`,
                },
              },
            ]
          : []),
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '📧 Reply via Email',
                emoji: true,
              },
              url: `mailto:${data.email}?subject=Re: Your baseFM Booking Inquiry`,
              style: 'primary',
            },
          ],
        },
      ],
    };

    await sendSlackNotification(slackMessage, 'bookings');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
