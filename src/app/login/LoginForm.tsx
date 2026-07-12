'use client';
//Components
import { Box, TextField, Button } from '@mui/material';
import Link from 'next/link';
//Hooks
import { useState } from 'react';
import { useRouter } from 'next/navigation';
//Libs
import { signInAuthUserWithEmailAndPassword } from '@/api/firebase-users';
import { createSession } from '@/server/auth/session';
//Icons
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
//Styling
import '../../styles/globalStyles.css';

export default function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isInvalidLogin, setIsInvalidLogin] = useState<boolean>(false);
    const router = useRouter();

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        try {
            const user = await signInAuthUserWithEmailAndPassword(email, password);
            if (!user) {
                setIsInvalidLogin(true);
                return;
            }
            await createSession(await user.getIdToken());
            router.push(redirectTo);
            router.refresh(); // re-render server components with the new cookie
        } catch (error) {
            setIsInvalidLogin(true);
        }
    };

    return (
        <>
            <div className="page--header">
                <h1>Login</h1>
                {/* <h4>[Page Summary]</h4> */}
            </div>
            <div className="content--container">
                <Box component="form" gap={3} display={'flex'} flexDirection={'column'} onSubmit={handleLogin}>
                    <TextField
                        type="text"
                        name="email"
                        id="email"
                        label="Email"
                        placeholder="Input Email"
                        autoComplete="email"
                        value={email}
                        error={isInvalidLogin}
                        required
                        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                            setEmail(event.target.value);
                        }}
                    />
                    <TextField
                        type="password"
                        name="password"
                        id="password"
                        label="Password"
                        placeholder="Input Password"
                        autoComplete="current-password"
                        value={password}
                        error={isInvalidLogin}
                        helperText={isInvalidLogin && 'The credentials provided were invalid, please try again'}
                        required
                        onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
                            setPassword(event.target.value);
                        }}
                    />
                    <Button variant="contained" type="submit" endIcon={<VpnKeyOutlinedIcon />}>
                        Login
                    </Button>
                </Box>
                <hr />
                <Link id="reset-password" href="./reset-password">
                    Forgot password?
                </Link>
            </div>
            <hr />
            <h4>
                Don&apos;t have an account?{' '}
                <Link id="join" href="./join">
                    Join here
                </Link>
            </h4>
        </>
    );
}
