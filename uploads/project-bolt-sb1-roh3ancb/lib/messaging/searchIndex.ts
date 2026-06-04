/**
 * EarthOS Messaging — Local-First Search Index (IndexedDB)
 *
 * Indexes messages and contacts entirely in-browser using IndexedDB.
 * No data ever leaves the device for search purposes.
 *
 * DB name: earthos.search
 * Stores:
 *   - messages: indexed by conversationId, senderId, body
 *   - contacts: indexed by earthId, displayName, handle
 */

import type { Message, EarthID } from './types';

const DB_NAME = 'earthos.search';
const DB_VERSION = 1;

export interface IndexedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderDisplayName: string;
  senderHandle: string;
  conversationTitle: string;
  body: string;
  type: string;
  createdAt: string;
  storageMode: string;
}

export interface IndexedContact {
  earthId: string;
  displayName: string;
  handle: string;
  trustLevel: string;
}

export type SearchFilter = 'all' | 'messages' | 'contacts';

export interface SearchResult {
  type: 'message' | 'contact';
  score: number;
  message?: IndexedMessage;
  contact?: IndexedContact;
  matchedField: string;
  highlightRanges: Array<[number, number]>; // [start, end] in the matched field string
}

// ─── DB open ──────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('messages')) {
        const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
        msgStore.createIndex('by_conversation', 'conversationId', { unique: false });
        msgStore.createIndex('by_sender', 'senderId', { unique: false });
        msgStore.createIndex('by_body', 'body', { unique: false });
      }

      if (!db.objectStoreNames.contains('contacts')) {
        const ctStore = db.createObjectStore('contacts', { keyPath: 'earthId' });
        ctStore.createIndex('by_display_name', 'displayName', { unique: false });
        ctStore.createIndex('by_handle', 'handle', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── Indexing ─────────────────────────────────────────────────────────────────

export async function indexMessages(
  messages: Message[],
  resolveIdentityFn: (id: string) => { displayName: string; handle: string } | undefined,
  getConvTitleFn: (id: string) => string
): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await openDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');

  for (const msg of messages) {
    if (msg.isDeleted || !msg.body) continue;
    const sender = resolveIdentityFn(msg.senderId);
    const record: IndexedMessage = {
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderDisplayName: sender?.displayName ?? msg.senderId.slice(0, 8),
      senderHandle: sender?.handle ?? '',
      conversationTitle: getConvTitleFn(msg.conversationId),
      body: msg.body,
      type: msg.type,
      createdAt: msg.createdAt,
      storageMode: msg.storageMode,
    };
    store.put(record);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function indexContacts(contacts: IndexedContact[]): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await openDB();
  const tx = db.transaction('contacts', 'readwrite');
  const store = tx.objectStore('contacts');

  for (const contact of contacts) {
    store.put(contact);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ─── Remove stale records ─────────────────────────────────────────────────────

export async function removeIndexedMessages(ids: string[]): Promise<void> {
  if (typeof window === 'undefined' || ids.length === 0) return;
  const db = await openDB();
  const tx = db.transaction('messages', 'readwrite');
  const store = tx.objectStore('messages');
  for (const id of ids) store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ─── Search helpers ───────────────────────────────────────────────────────────

function findHighlightRanges(text: string, query: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const lower = text.toLowerCase();
  const lowerQ = query.toLowerCase();
  let idx = 0;
  while (idx < lower.length) {
    const found = lower.indexOf(lowerQ, idx);
    if (found === -1) break;
    ranges.push([found, found + lowerQ.length]);
    idx = found + lowerQ.length;
  }
  return ranges;
}

function scoreMessage(msg: IndexedMessage, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (msg.body.toLowerCase().includes(q)) score += 10;
  if (msg.senderDisplayName.toLowerCase().includes(q)) score += 5;
  if (msg.senderHandle.toLowerCase().includes(q)) score += 4;
  if (msg.conversationTitle.toLowerCase().includes(q)) score += 3;
  return score;
}

function scoreContact(contact: IndexedContact, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (contact.displayName.toLowerCase().includes(q)) score += 10;
  if (contact.handle.toLowerCase().includes(q)) score += 8;
  return score;
}

// ─── Search ───────────────────────────────────────────────────────────────────

async function getAllMessages(db: IDBDatabase): Promise<IndexedMessage[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('messages', 'readonly');
    const req = tx.objectStore('messages').getAll();
    req.onsuccess = () => resolve(req.result as IndexedMessage[]);
    req.onerror = () => reject(req.error);
  });
}

async function getAllContacts(db: IDBDatabase): Promise<IndexedContact[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('contacts', 'readonly');
    const req = tx.objectStore('contacts').getAll();
    req.onsuccess = () => resolve(req.result as IndexedContact[]);
    req.onerror = () => reject(req.error);
  });
}

export async function search(
  query: string,
  filter: SearchFilter = 'all',
  limit = 30
): Promise<SearchResult[]> {
  if (typeof window === 'undefined' || !query.trim()) return [];
  const q = query.trim();

  const db = await openDB();
  const results: SearchResult[] = [];

  try {
    if (filter === 'all' || filter === 'messages') {
      const messages = await getAllMessages(db);
      for (const msg of messages) {
        const score = scoreMessage(msg, q);
        if (score === 0) continue;

        // Determine primary matched field for highlight
        let matchedField = msg.body;
        let fieldKey = 'body';
        if (!msg.body.toLowerCase().includes(q.toLowerCase()) && msg.senderDisplayName.toLowerCase().includes(q.toLowerCase())) {
          matchedField = msg.senderDisplayName;
          fieldKey = 'senderDisplayName';
        }

        results.push({
          type: 'message',
          score,
          message: msg,
          matchedField: fieldKey,
          highlightRanges: findHighlightRanges(matchedField, q),
        });
      }
    }

    if (filter === 'all' || filter === 'contacts') {
      const contacts = await getAllContacts(db);
      for (const contact of contacts) {
        const score = scoreContact(contact, q);
        if (score === 0) continue;

        const matchedField = contact.displayName.toLowerCase().includes(q.toLowerCase())
          ? contact.displayName
          : contact.handle;

        results.push({
          type: 'contact',
          score,
          contact,
          matchedField: contact.displayName.toLowerCase().includes(q.toLowerCase()) ? 'displayName' : 'handle',
          highlightRanges: findHighlightRanges(matchedField, q),
        });
      }
    }
  } finally {
    db.close();
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Contact-specific search (for ContactsTab) ────────────────────────────────

export async function searchContacts(query: string): Promise<IndexedContact[]> {
  if (typeof window === 'undefined' || !query.trim()) return [];
  const db = await openDB();
  try {
    const contacts = await getAllContacts(db);
    const q = query.trim().toLowerCase();
    return contacts.filter(
      (c) => c.displayName.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    );
  } finally {
    db.close();
  }
}

// ─── Highlight renderer ───────────────────────────────────────────────────────

/**
 * Returns an array of segments: { text, highlight }.
 * Callers render highlighted segments however they need.
 */
export function splitHighlights(
  text: string,
  ranges: Array<[number, number]>
): Array<{ text: string; highlight: boolean }> {
  if (ranges.length === 0) return [{ text, highlight: false }];

  const segments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlight: false });
    }
    segments.push({ text: text.slice(start, end), highlight: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }
  return segments;
}

// ─── Index rebuild ────────────────────────────────────────────────────────────

export async function clearIndex(): Promise<void> {
  if (typeof window === 'undefined') return;
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
