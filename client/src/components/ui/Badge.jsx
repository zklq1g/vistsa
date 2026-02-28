import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 'var(--r-full)',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const variants = {
        neutral: {
            backgroundColor: 'var(--c-surface-2)',
            color: 'var(--c-text-muted)',
            border: '1px solid var(--c-border)'
        },
        success: {
            backgroundColor: 'rgba(46, 160, 67, 0.1)',
            color: '#3fb950',
            border: '1px solid rgba(46, 160, 67, 0.2)'
        },
        accent: {
            backgroundColor: 'var(--c-glow)',
            color: 'var(--c-accent)',
            border: '1px solid rgba(212, 197, 169, 0.2)'
        },
        danger: {
            backgroundColor: 'rgba(248, 81, 73, 0.1)',
            color: '#f85149',
            border: '1px solid rgba(248, 81, 73, 0.2)'
        }
    };

    return (
        <span
            className={className}
            style={{ ...baseStyles, ...variants[variant] }}
        >
            {children}
        </span>
    );
};

export default Badge;
