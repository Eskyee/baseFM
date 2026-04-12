'use client';

import { ProductLearningEventInput } from '@/lib/db/product-learning';

const reportedKeys = new Set<string>();

export async function reportProductLearningEvent(
  key: string,
  input: ProductLearningEventInput
) {
  if (reportedKeys.has(key)) return;
  reportedKeys.add(key);

  try {
    await fetch('/api/system/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    // Silent by design - feedback should never break the page.
  }
}
