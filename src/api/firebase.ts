import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { User, getAuth } from 'firebase/auth';

import { firebaseConfig } from './config';
import { logClientErrorAction } from '@/server/actions/events';

import { getFunctions, httpsCallable } from 'firebase/functions';

import { NewUserAccountInfo } from '@/types/UserTypes';
import { convertToString } from '@/utils/utils';
import { UserRecord } from 'firebase-admin/auth';

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Cloud functions
// Signup happens pre-auth, so it can't go through the session-cookie server
// channel — this is the only Cloud Function the app still calls. The other
// eight handles (enableuser/deleteuser/updateauthuser/listallusers/
// setcustomclaims/isemailinuse/getorganizationnames/aredonationsavailable)
// were replaced by src/server/ equivalents in the refactor.
const functions = getFunctions(app);
const createNewUser = httpsCallable(functions, 'createnewuser');

// Cloud function calls
export async function callCreateUser(accountInfo: NewUserAccountInfo): Promise<UserRecord> {
    try {
        const result = await createNewUser(accountInfo);
        return result.data as UserRecord;
    } catch (error) {
        addErrorEvent('Create user', error);
    }
    return Promise.reject();
}

// Role based claims.
export async function checkIsAdmin(user: User): Promise<boolean> {
    try {
        const result = await user.getIdTokenResult();
        return result.claims.admin === true;
    } catch (error) {
        addErrorEvent('Check is admin', error);
    }
    return Promise.reject();
}

export async function checkIsAidWorker(user: User): Promise<boolean> {
    try {
        const result = await user.getIdTokenResult();
        return result.claims['aid-worker'] === true;
    } catch (error) {
        addErrorEvent('Check is aid worker', error);
    }
    return Promise.reject();
}

// Utilitarian — routes through a server action instead of importing the old
// 'use server' firebaseAdmin module into client code (L9).
export async function addErrorEvent(location: string, error: any): Promise<void> {
    try {
        await logClientErrorAction(location, convertToString(error));
    } catch (error) {
        console.log(error);
    }
}
