import 'server-only';

import { storage } from './firebase-admin';
import { logErrorEvent } from './events';

// Donation image fields store Firebase Storage download URLs
// (https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?...).
// The client SDK accepts those in ref(); the Admin SDK needs the object path.
export function storagePathFromDownloadUrl(url: string): string | null {
    try {
        const encodedPath = new URL(url).pathname.split('/o/')[1];
        return encodedPath ? decodeURIComponent(encodedPath) : null;
    } catch {
        return null;
    }
}

// Best-effort storage cleanup (mirrors deleteDonationById's per-image
// try/catch: a missing object never blocks the doc delete).
export async function deleteImagesByUrls(urls: string[]): Promise<void> {
    for (const url of urls) {
        try {
            const path = storagePathFromDownloadUrl(url);
            if (!path) continue;
            await storage.bucket().file(path).delete();
        } catch (error) {
            await logErrorEvent('Delete image in deleteImagesByUrls', error);
        }
    }
}
