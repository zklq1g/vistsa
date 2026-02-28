import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { Sun, Moon, Menu } from 'lucide-react';
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
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-xl)',
                zIndex: 50,
                backgroundColor: isHome ? 'transparent' : 'var(--c-bg)',
                borderBottom: isHome ? 'none' : '1px solid var(--c-border)',
                backdropFilter: isHome ? 'blur(10px)' : 'none'
            }}
        >
            <Link
                to="/"
                style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
            >
                <span style={{ color: 'var(--c-accent)' }}>VISTA</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                <button onClick={toggleTheme} style={{ color: 'var(--c-text-muted)' }}>
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
