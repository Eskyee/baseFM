// Shopify Order Processor
// Handles order processing, wallet resolution, and onchain entitlements

import type { OnchainPerk } from './config';
import { mintPerk, type MintResult } from '@/lib/onchain/minter';
import { supabase } from '@/lib/supabase/client';

export interface OrderData {
  orderId: string;
  orderNumber: string;
  customerId?: string;
  customerEmail: string;
  walletAddress?: string;
  items: {
    productId: string;
    variantId: string;
    title: string;
    quantity: number;
    perks: OnchainPerk[];
  }[];
  totalPrice: string;
  currency: string;
  createdAt: string;
}

export interface ProcessedOrder {
  orderId: string;
  status: 'completed' | 'pending_wallet' | 'failed';
  entitlements: {
    perkType: string;
    contractAddress: string;
    status: 'minted' | 'pending' | 'failed';
    txHash?: string;
    error?: string;
  }[];
}

// Process an order and mint perks if wallet is available
export async function processOrder(orderData: OrderData): Promise<ProcessedOrder> {
  console.log(`Processing order ${orderData.orderNumber}...`);

  // Check for idempotency - has this order been processed?
  const { data: existingOrder } = await supabase
    .from('shop_orders')
    .select('id, status')
    .eq('shopify_order_id', orderData.orderId)
    .single();

  if (existingOrder?.status === 'completed') {
    console.log(`Order ${orderData.orderNumber} already processed`);
    return {
      orderId: orderData.orderId,
      status: 'completed',
      entitlements: [],
    };
  }

  // Store/update order record
  const { error: orderError } = await supabase
    .from('shop_orders')
    .upsert({
      shopify_order_id: orderData.orderId,
      order_number: orderData.orderNumber,
      customer_id: orderData.customerId,
      customer_email: orderData.customerEmail,
      wallet_address: orderData.walletAddress,
      total_price: orderData.totalPrice,
      currency: orderData.currency,
      status: 'processing',
      created_at: orderData.createdAt,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'shopify_order_id',
    });

  if (orderError) {
    console.error('Failed to store order:', orderError);
    throw new Error('Failed to store order');
  }

  // If no wallet, store pending claims
  if (!orderData.walletAddress) {
    console.log(`Order ${orderData.orderNumber} has no wallet, storing pending claims`);
    await storePendingClaims(orderData);
    return {
      orderId: orderData.orderId,
      status: 'pending_wallet',
      entitlements: orderData.items.flatMap((item) =>
        item.perks.map((perk) => ({
          perkType: perk.type,
          contractAddress: perk.contractAddress,
          status: 'pending' as const,
        }))
      ),
    };
  }

  // Link wallet to customer if we have both
  if (orderData.customerId) {
    await linkWalletToCustomer(orderData.customerId, orderData.customerEmail, orderData.walletAddress);
  }

  // Mint perks
  const entitlements: ProcessedOrder['entitlements'] = [];

  for (const item of orderData.items) {
    for (let i = 0; i < item.quantity; i++) {
      for (const perk of item.perks) {
        try {
          // Check if already minted (idempotency)
          const { data: existingEntitlement } = await supabase
            .from('onchain_entitlements')
            .select('id, tx_hash')
            .eq('order_id', orderData.orderId)
            .eq('contract_address', perk.contractAddress)
            .eq('wallet_address', orderData.walletAddress)
            .single();

          if (existingEntitlement?.tx_hash) {
            console.log(`Perk already minted for order ${orderData.orderNumber}`);
            entitlements.push({
              perkType: perk.type,
              contractAddress: perk.contractAddress,
              status: 'minted',
              txHash: existingEntitlement.tx_hash,
            });
            continue;
          }

          // Mint the perk
          const result = await mintPerk(orderData.walletAddress as `0x${string}`, perk);

          // Store entitlement
          await supabase.from('onchain_entitlements').upsert({
            order_id: orderData.orderId,
            wallet_address: orderData.walletAddress,
            contract_address: perk.contractAddress,
            perk_type: perk.type,
            token_id: perk.tokenId?.toString(),
            amount: perk.amount?.toString(),
            tx_hash: result.txHash,
            status: result.success ? 'minted' : 'failed',
            error: result.error,
            minted_at: result.success ? new Date().toISOString() : null,
          }, {
            onConflict: 'order_id,contract_address,wallet_address',
          });

          entitlements.push({
            perkType: perk.type,
            contractAddress: perk.contractAddress,
            status: result.success ? 'minted' : 'failed',
            txHash: result.txHash,
            error: result.error,
          });
        } catch (error) {
          console.error(`Failed to mint perk:`, error);
          entitlements.push({
            perkType: perk.type,
            contractAddress: perk.contractAddress,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }
  }

  // Update order status
  const allMinted = entitlements.every((e) => e.status === 'minted');
  await supabase
    .from('shop_orders')
    .update({
      status: allMinted ? 'completed' : 'partial',
      updated_at: new Date().toISOString(),
    })
    .eq('shopify_order_id', orderData.orderId);

  return {
    orderId: orderData.orderId,
    status: allMinted ? 'completed' : 'failed',
    entitlements,
  };
}

// Store pending claims for orders without wallets
async function storePendingClaims(orderData: OrderData) {
  const claims = orderData.items.flatMap((item) =>
    item.perks.map((perk) => ({
      order_id: orderData.orderId,
      customer_id: orderData.customerId,
      customer_email: orderData.customerEmail,
      contract_address: perk.contractAddress,
      perk_type: perk.type,
      token_id: perk.tokenId?.toString(),
      amount: perk.amount?.toString(),
      quantity: item.quantity,
      status: 'pending',
      created_at: new Date().toISOString(),
    }))
  );

  if (claims.length > 0) {
    const { error } = await supabase.from('pending_claims').insert(claims);
    if (error) {
      console.error('Failed to store pending claims:', error);
    }
  }
}

// Link wallet to Shopify customer
async function linkWalletToCustomer(customerId: string, email: string, walletAddress: string) {
  const { error } = await supabase.from('shop_customers').upsert({
    shopify_customer_id: customerId,
    email,
    wallet_address: walletAddress,
    linked_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'shopify_customer_id',
  });

  if (error) {
    console.error('Failed to link wallet:', error);
  }
}

// Claim pending perks when wallet is linked
export async function claimPendingPerks(
  customerEmail: string,
  walletAddress: `0x${string}`
): Promise<MintResult[]> {
  // Find pending claims
  const { data: claims } = await supabase
    .from('pending_claims')
    .select('*')
    .eq('customer_email', customerEmail)
    .eq('status', 'pending');

  if (!claims || claims.length === 0) {
    return [];
  }

  const results: MintResult[] = [];

  for (const claim of claims) {
    try {
      const perk: OnchainPerk = {
        type: claim.perk_type,
        contractAddress: claim.contract_address as `0x${string}`,
        tokenId: claim.token_id ? BigInt(claim.token_id) : undefined,
        amount: claim.amount ? BigInt(claim.amount) : undefined,
      };

      const result = await mintPerk(walletAddress, perk);
      results.push(result);

      // Update claim status
      await supabase
        .from('pending_claims')
        .update({
          status: result.success ? 'claimed' : 'failed',
          wallet_address: walletAddress,
          tx_hash: result.txHash,
          claimed_at: result.success ? new Date().toISOString() : null,
        })
        .eq('id', claim.id);

      // Store entitlement
      if (result.success) {
        await supabase.from('onchain_entitlements').insert({
          order_id: claim.order_id,
          wallet_address: walletAddress,
          contract_address: claim.contract_address,
          perk_type: claim.perk_type,
          token_id: claim.token_id,
          amount: claim.amount,
          tx_hash: result.txHash,
          status: 'minted',
          minted_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Failed to claim perk:`, error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
