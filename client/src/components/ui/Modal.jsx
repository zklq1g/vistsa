import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalExpand, modalBackdrop } from '../../motion/variants';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title = '' }) => {

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={styles.portal} className="vista-modal">
                    <motion.div
                        variants={modalBackdrop}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={styles.backdrop}
                        onClick={onClose}
                    />
                    <div style={styles.container}>
                        <motion.div
                            variants={modalExpand}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={styles.dialog}
                            className="glass"
                            onClick={e => e.stopPropagation()} // Prevent click through to backdrop
                        >
                            <div style={styles.header}>
                                <h3 style={styles.title}>{title}</h3>
                                <button onClick={onClose} style={styles.closeBtn}>
                                    <X size={20} color="var(--c-text-muted)" />
                                </button>
                            </div>
                            <div style={styles.content}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

const styles = {
    portal: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,          // Above CursorFollower (9999)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'default',      // ← restore normal cursor inside modal overlay
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        cursor: 'default',
    },
    container: {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        padding: 'var(--space-md)',
        display: 'flex',
        justifyContent: 'center',
    },
    dialog: {
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        borderRadius: 'var(--r-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'default',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-lg)',
        borderBottom: '1px solid var(--c-border)',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
    },
    closeBtn: {
        padding: '8px',
        borderRadius: 'var(--r-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
        cursor: 'pointer',      // ← must be explicit since body has cursor:none
        pointerEvents: 'all',   // ← guarantee pointer events even inside animated layers
    },
    content: {
        padding: 'var(--space-lg)',
        overflowY: 'auto',
        cursor: 'default',
    },
};

export default Modal;
