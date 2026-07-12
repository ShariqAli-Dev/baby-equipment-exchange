import { redirect } from 'next/navigation';
import { getSession } from '@/server/auth/get-session';
import LoginForm from './LoginForm';

export default async function LoginPage() {
    const session = await getSession();
    if (session) redirect('/');
    return <LoginForm />;
}
