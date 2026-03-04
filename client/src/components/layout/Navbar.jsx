import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = () => {
    const { theme, toggleTheme } = useThemeStore();
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                /* Responsive padding: 16px on mobile, up to 40px on desktop */
                padding: '0 clamp(1rem, 5vw, 2.5rem)',
                zIndex: 50,
                backgroundColor: isHome ? 'transparent' : 'var(--c-bg)',
                borderBottom: isHome ? 'none' : '1px solid var(--c-border)',
                backdropFilter: isHome ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: isHome ? 'blur(10px)' : 'none',
            }}
        >
            <Link
                to="/"
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: 'var(--touch-target)',
                }}
            >
                <span style={{ color: 'var(--c-accent)' }}>VISTA</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    style={{
                        color: 'var(--c-text-muted)',
                        minWidth: 'var(--touch-target)',
                        minHeight: 'var(--touch-target)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--r-md)',
                    }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Link to="/login">
                    <Button variant="primary" size="sm">Member Login</Button>
                </Link>
            </div>
        </motion.nav>
    );
};

export default Navbar;
