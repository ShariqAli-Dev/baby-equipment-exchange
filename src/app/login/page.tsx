import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth/get-session';
import LoginForm from './LoginForm';

export default async function LoginPage({ searchParams }: { searchParams: { from?: string } }) {
    const session = await getSession();
    if (session) redirect('/');
    // Only same-site paths — guards against open-redirect via ?from=https://evil
    const from = searchParams.from?.startsWith('/') ? searchParams.from : undefined;
    return <LoginForm redirectTo={from ?? '/'} />;
}
