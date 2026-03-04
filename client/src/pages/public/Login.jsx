import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { pageTransition } from '../../motion/variants';
import Button from '../../components/ui/Button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            return toast.error('Please enter both username and password');
        }

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });

            if (response && response.success) {
                login(response.data.user, response.data.token);
                toast.success(`Welcome back, ${response.data.user.displayName}`);

                if (response.data.user.role === 'SYSTEM ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            toast.error(error.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                minHeight: '100svh', /* Use svh to avoid mobile browser chrome */
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)',
            }}
        >
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                    borderRadius: 'var(--r-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-lg)',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', color: 'var(--c-accent)', marginBottom: 'var(--space-sm)' }}>
                        VISTA Portal
                    </h1>
                    <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
                        Society Member Login
                    </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label
                            htmlFor="username"
                            style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Enter your username"
                            autoComplete="username"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            inputMode="text"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isLoading}
                        style={{ marginTop: 'var(--space-sm)', width: '100%' }}
                    >
                        {isLoading ? 'Authenticating...' : 'Secure Login'}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--c-text-muted)' }}>
                    To request an account, please contact the society administrators.
                </p>
            </div>
        </motion.div>
    );
};

const styles = {
    input: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--c-border)',
        backgroundColor: 'var(--c-surface-2)',
        color: 'var(--c-text)',
        fontFamily: 'var(--font-body)',
        /* 16px font is critical on iOS — below this size, iOS zooms on focus */
        fontSize: '16px',
        outline: 'none',
        transition: 'border-color 0.2s',
        /* Ensure 44px touch target height */
        minHeight: '48px',
        touchAction: 'manipulation',
    }
};

export default Login;
