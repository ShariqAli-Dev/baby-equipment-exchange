//Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
//Fonts
import { montserrat, garamond } from '../styles/fonts';
//Types
import type { Metadata } from 'next';

//Providers
import { UserProvider } from '@/contexts/UserContext';
import { RequestedInventoryProvider } from '@/contexts/RequestedInventoryContext';
import ThemeProviderWrapper from '@/components/ThemeProviderWrapper';
//Styles
import '../styles/globalStyles.css';

// src/app/favicon.ico is picked up by the App Router file convention — no manual <link> needed.
export const metadata: Metadata = {
    title: {
        default: 'Baby Equipment Exchange',
        template: '%s | Baby Equipment Exchange'
    },
    description: 'Donate and request gently used baby equipment in Vermont.'
};

const fontClassNames = [montserrat, garamond].map((font) => font.variable).join(' ');

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={fontClassNames}>
            <body className="body--wrapper">
                <ThemeProviderWrapper>
                    <UserProvider>
                        {/* RequestedInventoryProvider stays at root until Dashboard and admin-cart
                            (its non-aid-worker consumers) migrate in the V phases. */}
                        <RequestedInventoryProvider>
                            <Header />
                            <div className="page--wrapper">{children}</div>
                            <Footer />
                        </RequestedInventoryProvider>
                    </UserProvider>
                </ThemeProviderWrapper>
            </body>
        </html>
    );
}
