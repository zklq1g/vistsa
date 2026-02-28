import React from 'react';
import { motion } from 'framer-motion';
import { hoverScale } from '../../motion/variants';

const Card = ({ children, className = '', hover = true, onClick }) => {
    const baseStyles = {
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-md)',
        padding: 'var(--space-md)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--transition-base)'
    };

    const Component = hover || onClick ? motion.div : 'div';
    const motionProps = (hover || onClick) ? {
        variants: hoverScale,
        initial: "rest",
        whileHover: "hover",
        whileTap: onClick ? "tap" : undefined,
        onClick: onClick,
        style: { ...baseStyles, cursor: onClick ? 'pointer' : 'default' }
    } : {
        style: baseStyles
    };

    return (
        <Component className={className} {...motionProps}>
            {/* Subtle glow effect on top edge */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--c-glow), transparent)',
                opacity: 0.5
            }} />

            {children}
        </Component>
    );
};

export default Card;
