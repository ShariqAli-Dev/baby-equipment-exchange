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
            projectId: 'baby-equipment-exchange',
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
