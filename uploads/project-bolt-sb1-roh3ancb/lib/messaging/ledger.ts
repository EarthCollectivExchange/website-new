import { supabase } from '../supabase';
import type { LedgerEvent, LedgerEventType } from './types';

export interface WriteLedgerInput {
  earthId: string;
  relatedEarthId?: string;
  conversationId?: string;
  messageId?: string;
  eventType: LedgerEventType;
  passed: boolean;
  detail?: string;
}

export async function writeLedgerEvent(input: WriteLedgerInput): Promise<LedgerEvent> {
  const event: Omit<LedgerEvent, 'id'> = {
    ...input,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('ledger_events')
    .insert(event)
    .select()
    .single();

  if (error) {
    // Ledger write failure is non-blocking — log but do not halt message flow
    console.error('[Ledger] Failed to write event:', error.message);
    return { id: crypto.randomUUID(), ...event };
  }

  return data as LedgerEvent;
}

export function buildLedgerDetail(passed: boolean, reason?: string): string {
  return passed
    ? reason ?? 'Validation passed.'
    : reason ?? 'Validation failed.';
}
