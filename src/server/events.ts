import 'server-only';

import { db } from './firebase-admin';
import { convertToString } from '@/utils/utils';

// L8 note: firestore.rules guards 'Events' (plural) but the app has always
// written to 'Event' (singular) — the rule protects nothing. We keep writing
// to 'Event' (no rules/schema changes in this experiment).
export const EVENTS_COLLECTION = 'Event';

// Mirrors _addEvent in src/api/firebaseAdmin.ts (same doc shape). No guard:
// error logging must work for anonymous flows too.
export async function logErrorEvent(location: string, error: unknown): Promise<void> {
    try {
        const currentTimeString = new Date().toDateString();
        await db.collection(EVENTS_COLLECTION).add({
            type: '',
            note: JSON.stringify({ location, error: convertToString(error) }),
            createdBy: 'system',
            createdAt: currentTimeString,
            modifiedAt: currentTimeString
        });
    } catch (err) {
        console.error('logErrorEvent failed', err);
    }
}
