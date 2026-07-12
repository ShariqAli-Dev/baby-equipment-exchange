'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { destroySession } from '@/server/auth/session';
import { signOutUser } from '@/api/firebase-users';

export async function signOutEverywhere(router: AppRouterInstance): Promise<void> {
    await destroySession(); // server: delete cookie + revoke refresh tokens
    await signOutUser(); // client SDK — awaited (was fire-and-forget)
    localStorage.clear();
    router.push('/');
    router.refresh(); // re-render server components without the cookie
}
