import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseOnchainTags } from '@/lib/shopify/config';
import { processOrder, OrderData } from '@/lib/shopify/order-processor';

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_API_SECRET || '';

// Verify Shopify webhook HMAC signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET) {
    console.error('SHOPIFY_API_SECRET is not configured');
    return false;
  }

  const hmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

// POST /api/webhooks/shopify
export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Shopify-Hmac-Sha256');
  const topic = request.headers.get('X-Shopify-Topic');
  const shopDomain = request.headers.get('X-Shopify-Shop-Domain');

  if (!signature) {
    console.error('Missing webhook signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get raw body for verification
  const rawBody = await request.text();

  // Verify signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('Invalid webhook signature');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let payload: ShopifyOrderWebhook;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  console.log(`Received Shopify webhook: ${topic} from ${shopDomain}`);

  // Handle orders/paid topic
  if (topic === 'orders/paid') {
    try {
      await handleOrderPaid(payload);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to process order:', error);
      // Return 200 to prevent retries for processing errors
      // Shopify will retry on 4xx/5xx responses
      return NextResponse.json({ success: false, error: 'Processing failed' });
    }
  }

  // Acknowledge other topics
  return NextResponse.json({ success: true, topic });
}

// Shopify order webhook payload (simplified)
interface ShopifyOrderWebhook {
  id: number;
  order_number: number;
  email: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  line_items: {
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    properties: { name: string; value: string }[];
  }[];
  total_price: string;
  currency: string;
  financial_status: string;
  created_at: string;
  note_attributes: { name: string; value: string }[];
}

async function handleOrderPaid(order: ShopifyOrderWebhook) {
  console.log(`Processing paid order #${order.order_number} (ID: ${order.id})`);

  // Extract onchain-tagged items
  const onchainItems: OrderData['items'] = [];

  for (const item of order.line_items) {
    // Fetch product tags from Admin API
    const productTags = await fetchProductTags(item.product_id);
    const perks = parseOnchainTags(productTags);

    if (perks.length > 0) {
      onchainItems.push({
        productId: item.product_id.toString(),
        variantId: item.variant_id.toString(),
        title: item.title,
        quantity: item.quantity,
        perks,
      });
    }
  }

  if (onchainItems.length === 0) {
    console.log(`Order #${order.order_number} has no onchain perks`);
    return;
  }

  // Extract wallet address from order note attributes or customer metafields
  let walletAddress: string | undefined;

  // Check note attributes for wallet
  const walletAttr = order.note_attributes.find(
    (attr) => attr.name.toLowerCase() === 'wallet' || attr.name.toLowerCase() === 'wallet_address'
  );
  if (walletAttr?.value) {
    walletAddress = walletAttr.value;
  }

  // Check line item properties for wallet
  for (const item of order.line_items) {
    const walletProp = item.properties.find(
      (p) => p.name.toLowerCase() === 'wallet' || p.name.toLowerCase() === 'wallet_address'
    );
    if (walletProp?.value) {
      walletAddress = walletProp.value;
      break;
    }
  }

  // Process the order
  const orderData: OrderData = {
    orderId: order.id.toString(),
    orderNumber: order.order_number.toString(),
    customerId: order.customer?.id.toString(),
    customerEmail: order.email || order.customer?.email || '',
    walletAddress,
    items: onchainItems,
    totalPrice: order.total_price,
    currency: order.currency,
    createdAt: order.created_at,
  };

  await processOrder(orderData);
}

// Fetch product tags from Shopify Admin API
async function fetchProductTags(productId: number): Promise<string[]> {
  const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
  const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    console.warn('Shopify Admin API not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/products/${productId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch product ${productId}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const tags = data.product?.tags || '';
    return tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return [];
  }
}
