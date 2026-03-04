import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale } from '../../motion/variants';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    type = 'button',
    disabled = false,
    icon = null,
    style: styleProp = {}
}) => {

    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 'var(--r-full)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 500,
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s',
        outline: 'none',
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--c-text)',
            color: 'var(--c-bg)',
            border: '1px solid var(--c-text)'
        },
        secondary: {
            backgroundColor: 'transparent',
            color: 'var(--c-text)',
            border: '1px solid var(--c-border)'
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--c-text-muted)',
            border: '1px solid transparent'
        },
        accent: {
            backgroundColor: 'var(--c-accent)',
            color: 'var(--c-bg)',
            border: '1px solid var(--c-accent)'
        }
    };

    const sizes = {
        sm: { padding: '10px 16px', fontSize: '0.875rem', minHeight: '40px' },
        md: { padding: '12px 24px', fontSize: '1rem', minHeight: '44px' },
        lg: { padding: '14px 32px', fontSize: '1.125rem', minHeight: '48px' }
    };

    const getStyle = () => ({
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        ...styleProp,
    });

    return (
        <motion.button
            type={type}
            style={getStyle()}
            className={className}
            onClick={!disabled ? onClick : undefined}
            variants={hoverScale}
            initial="rest"
            whileHover={!disabled ? "hover" : "rest"}
            whileTap={!disabled ? "tap" : "rest"}
            disabled={disabled}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {children}
        </motion.button>
    );
};

export default Button;
