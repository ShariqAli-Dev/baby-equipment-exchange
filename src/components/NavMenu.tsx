'use client';

//Components
import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
//Hooks
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
//Libs
import { signOutEverywhere } from '@/lib/sign-out';
//styles
import styles from './NavMenu.module.css';

interface Props {
    isOpen: boolean;
    handleIsOpen: () => void;
    closeMenu: () => void;
}

// Canonical routes surfaced per role (Dashboard's tab lattice is gone — the
// drawer is now the admin/aid-worker nav).
const ADMIN_LINKS = [
    { href: '/notifications', label: 'Notifications' },
    { href: '/donations', label: 'Donations' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/users', label: 'Users' },
    { href: '/organizations', label: 'Organizations' },
    { href: '/categories', label: 'Categories' }
];
const AID_WORKER_LINKS = [
    { href: '/inventory', label: 'Inventory' },
    { href: '/inventory-cart', label: 'Cart' }
];

export default function NavMenu({ isOpen, handleIsOpen, closeMenu }: Props) {
    const { currentUser, isAdmin, isAidWorker } = useUserContext();
    const router = useRouter();

    // Admins hold the aid-worker superset but get the full admin nav.
    const roleLinks = isAdmin ? ADMIN_LINKS : isAidWorker ? AID_WORKER_LINKS : [];

    const handleSignOut = async () => {
        // Draft cleanup: signOutEverywhere clears localStorage, and the (donate)-scoped
        // PendingDonations provider unmounts on navigation — no context call needed here.
        await signOutEverywhere(router);
    };

    return (
        <>
            <button className={styles['menu__bars']} aria-label="open nav menu" onClick={handleIsOpen}>
                <MenuIcon />
            </button>
            <Drawer anchor="right" variant="temporary" open={isOpen} onClose={closeMenu}>
                <button className={styles['close__btn']} aria-label="close nav menu" onClick={closeMenu}>
                    <CloseIcon />
                </button>
                <div className={styles['nav__menu']}>
                    <Link className={styles['menu__link']} id="home" href="/" onClick={closeMenu}>
                        <span>Home</span>
                    </Link>
                    {roleLinks.map((link) => (
                        <Link key={link.href} className={styles['menu__link']} href={link.href} onClick={closeMenu}>
                            <span>{link.label}</span>
                        </Link>
                    ))}
                    {currentUser && (
                        <>
                            <Link className={styles['menu__link']} id="donate" href="/donate" onClick={closeMenu}>
                                <span>Donate</span>
                            </Link>
                        </>
                    )}
                    <Link className={styles['menu__link']} id="about" href="/about" onClick={closeMenu}>
                        <span>About</span>
                    </Link>
                    <Link className={styles['menu__link']} id="contact" href="https://www.vermontconnector.org/contact" target="_blank">
                        <span>Contact</span>
                    </Link>
                    {!currentUser && (
                        <Link className={styles['menu__link']} id="join" href="/join">
                            Join
                        </Link>
                    )}
                    <Link
                        className={styles['menu__link']}
                        id="signout"
                        href={currentUser ? '/' : '/login'}
                        onClick={(event) => {
                            closeMenu();
                            if (currentUser) {
                                event.preventDefault(); // signOutEverywhere owns navigation
                                void handleSignOut();
                            }
                        }}
                    >
                        {currentUser ? <span>Log Out</span> : <span>Login</span>}
                    </Link>
                </div>
            </Drawer>
        </>
    );
}
