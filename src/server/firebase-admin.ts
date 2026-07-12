import 'server-only';

import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';

function initAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }
    if (process.env.NODE_ENV == 'production') {
        return initializeApp();
    } else {
        const credentials: ServiceAccount = {
            // Must match the service account's own project (the dev creds in
            // .env.local belong to baby-equipment-exchange-dev). Fall back to
            // NEXT_PUBLIC_FIREBASE_PROJECT_ID — the id the client SDK already
            // targets — so the Admin SDK can't drift to a different project.
            // (.env.local has no PROJECT_ID; the old prod-id fallback here made
            // every local Admin-SDK call fail PERMISSION_DENIED, cross-project.)
            projectId: process.env.PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'baby-equipment-exchange',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY
        };
        return initializeApp({
            credential: admin.credential.cert(credentials)
        });
    }
}

const app = initAdmin();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
