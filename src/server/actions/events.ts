'use server';

import 'server-only';

import { logErrorEvent } from '../events';

// Thin wrapper so CLIENT code can log error events without importing the old
// 'use server' src/api/firebaseAdmin.ts (L9). No guard: anonymous flows
// (donate, join) log errors too — same exposure as today.
export async function logClientErrorAction(location: string, message: string): Promise<void> {
    await logErrorEvent(location, message);
}
