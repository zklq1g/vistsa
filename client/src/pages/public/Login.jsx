import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { pageTransition } from '../../motion/variants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Eye, EyeOff, Info } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();
    const formId = useId();

    const isFormValid = username.trim().length > 0 && password.length > 0;

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });

            if (response && response.success) {
                login(response.data.user, response.data.token);
                toast.success(`Welcome back, ${response.data.user.displayName}`);

                if (response.data.user.role === 'ADMIN') {
                    navigate('/admin');
                } else if (response.data.user.role === 'MOD') {
                    navigate('/moderator');
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

    const handleSocialClick = (provider) => {
        toast(`${provider} login coming soon!`, { icon: '🚧' });
    };

    return (
        <motion.div
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            style={styles.page}
        >
            <div style={styles.card}>
                {/* Logo / Branding */}
                <div style={{ textAlign: 'center' }}>
                    <h1
                        id={`${formId}-title`}
                        style={styles.logo}
                    >
                        VISTA
                    </h1>
                    <p style={styles.subtitle}>
                        Society Member Portal
                    </p>
                </div>

                {/* Login Form */}
                <form
                    onSubmit={handleLogin}
                    role="form"
                    aria-labelledby={`${formId}-title`}
                    style={styles.form}
                >
                    {/* Username Field */}
                    <div>
                        <label htmlFor={`${formId}-username`} style={styles.label}>
                            Username
                        </label>
                        <input
                            id={`${formId}-username`}
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
                            required
                        />
                    </div>

                    {/* Password Field with Show/Hide Toggle */}
                    <div>
                        <label htmlFor={`${formId}-password`} style={styles.label}>
                            Password
                        </label>
                        <div style={styles.passwordWrapper}>
                            <input
                                id={`${formId}-password`}
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ ...styles.input, paddingRight: '48px' }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={styles.eyeBtn}
                            >
                                {showPassword
                                    ? <EyeOff size={18} color="var(--c-text-muted)" />
                                    : <Eye size={18} color="var(--c-text-muted)" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password row */}
                    <div style={styles.optionsRow}>
                        <label htmlFor={`${formId}-remember`} style={styles.checkLabel}>
                            <input
                                id={`${formId}-remember`}
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <span>Remember me</span>
                            <span
                                title="Keep me signed in on this device"
                                style={styles.tooltip}
                                aria-label="Keep me signed in on this device"
                            >
                                <Info size={14} />
                            </span>
                        </label>
                        <button
                            type="button"
                            onClick={() => setForgotOpen(true)}
                            style={styles.forgotLink}
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Primary Login Button — disabled until form valid */}
                    <Button
                        type="submit"
                        variant={isFormValid ? 'primary' : 'secondary'}
                        size="lg"
                        disabled={isLoading || !isFormValid}
                        style={{
                            width: '100%',
                            marginTop: 'var(--space-xs)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {isLoading ? 'Authenticating…' : 'Log In'}
                    </Button>
                </form>

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerLine} />
                    <span style={styles.dividerText}>or continue with</span>
                    <span style={styles.dividerLine} />
                </div>

                {/* Social Login Buttons */}
                <div style={styles.socialRow}>
                    <button
                        type="button"
                        onClick={() => handleSocialClick('Google')}
                        style={styles.socialBtn}
                        aria-label="Sign in with Google"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialClick('Facebook')}
                        style={styles.socialBtn}
                        aria-label="Sign in with Facebook"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>Facebook</span>
                    </button>
                </div>

                {/* Footer text */}
                <p style={styles.footer}>
                    To request an account, please contact the society administrators.
                </p>
            </div>

            {/* Forgot Password Modal */}
            <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <p style={{ color: 'var(--c-text)', lineHeight: 1.6 }}>
                        Password resets are handled by VISTA administrators. Please contact your 
                        society admin or moderator to reset your password.
                    </p>
                    <div style={{
                        padding: 'var(--space-md)',
                        backgroundColor: 'var(--c-surface-2)',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--c-border)',
                    }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--c-text-muted)' }}>
                            📧 Reach out via your society's communication channel or email the admin directly.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setForgotOpen(false)}
                        style={{ alignSelf: 'flex-end' }}
                    >
                        Got it
                    </Button>
                </div>
            </Modal>
        </motion.div>
    );
};

const styles = {
    page: {
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)',
        backgroundColor: 'var(--c-bg)',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: 'clamp(1.5rem, 5vw, 2.5rem)',
        borderRadius: 'var(--r-lg)',
        backgroundColor: 'var(--c-surface)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
        border: '1px solid var(--c-border)',
    },
    logo: {
        fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        color: 'var(--c-text)',
        letterSpacing: '-0.02em',
        marginBottom: '4px',
    },
    subtitle: {
        color: 'var(--c-text-muted)',
        fontSize: '0.9rem',
        fontWeight: 400,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md)',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        fontSize: '0.85rem',
        fontWeight: 500,
        color: 'var(--c-text)',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--c-border)',
        backgroundColor: 'var(--c-surface-2)',
        color: 'var(--c-text)',
        fontFamily: 'var(--font-body)',
        fontSize: '16px', /* Critical for iOS — prevents zoom on focus */
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        minHeight: '48px',
        touchAction: 'manipulation',
    },
    passwordWrapper: {
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--r-full)',
        transition: 'background-color 0.2s',
    },
    optionsRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
    },
    checkLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.825rem',
        color: 'var(--c-text)',
        cursor: 'pointer',
        userSelect: 'none',
    },
    checkbox: {
        width: '16px',
        height: '16px',
        accentColor: 'var(--c-accent)',
        cursor: 'pointer',
    },
    tooltip: {
        display: 'inline-flex',
        alignItems: 'center',
        color: 'var(--c-text-muted)',
        cursor: 'help',
    },
    forgotLink: {
        fontSize: '0.825rem',
        color: 'var(--c-accent)',
        fontWeight: 500,
        cursor: 'pointer',
        textDecoration: 'none',
        background: 'none',
        border: 'none',
        padding: 0,
        transition: 'color 0.2s',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: 'var(--c-border)',
    },
    dividerText: {
        fontSize: '0.75rem',
        color: 'var(--c-text-muted)',
        whiteSpace: 'nowrap',
    },
    socialRow: {
        display: 'flex',
        gap: 'var(--space-sm)',
    },
    socialBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px 16px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--c-border)',
        backgroundColor: 'var(--c-surface-2)',
        color: 'var(--c-text)',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minHeight: '48px',
    },
    footer: {
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--c-text-muted)',
        margin: 0,
    },
};

export default Login;
