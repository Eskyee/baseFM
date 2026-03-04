// Push notification utilities
import webpush from 'web-push';
import { createServerClient } from '@/lib/supabase/client';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.NEXT_PUBLIC_APP_URL || 'https://basefm.space';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

interface PushSubscriptionRow {
  id: string;
  wallet_address: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Send push notification to a single subscription
async function sendToSubscription(
  subscription: PushSubscriptionRow,
  payload: PushNotificationPayload
): Promise<{ success: boolean; walletAddress: string; error?: string }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return {
      success: false,
      walletAddress: subscription.wallet_address,
      error: 'VAPID keys not configured',
    };
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/icon-32.png',
        data: {
          url: payload.url || '/',
        },
        tag: payload.tag,
      })
    );
    return { success: true, walletAddress: subscription.wallet_address };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // If subscription expired or invalid, we should clean it up
    if (errorMessage.includes('410') || errorMessage.includes('404')) {
      const supabase = createServerClient();
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
    }

    return {
      success: false,
      walletAddress: subscription.wallet_address,
      error: errorMessage,
    };
  }
}

// Send push notification to multiple wallet addresses
export async function sendPushToWallets(
  walletAddresses: string[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; errors: string[] }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { sent: 0, failed: 0, errors: ['VAPID keys not configured'] };
  }

  const supabase = createServerClient();

  // Get subscriptions for the given wallet addresses
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('wallet_address', walletAddresses.map(w => w.toLowerCase()));

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, errors: error ? [error.message] : ['No subscriptions found'] };
  }

  // Send to all subscriptions in parallel
  const results = await Promise.all(
    subscriptions.map(sub => sendToSubscription(sub, payload))
  );

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const errors = results
    .filter(r => !r.success && r.error)
    .map(r => `${r.walletAddress}: ${r.error}`);

  return { sent, failed, errors };
}

// Send push notification to all subscriptions (broadcast)
export async function sendPushBroadcast(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return { sent: 0, failed: 0 };
  }

  const supabase = createServerClient();

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error || !subscriptions) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.all(
    subscriptions.map(sub => sendToSubscription(sub, payload))
  );

  return {
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
  };
}
