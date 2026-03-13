import React, { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalExpand, modalBackdrop } from '../../motion/variants';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title = '' }) => {
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);
    const titleId = useId();

    // Save trigger element when opening
    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement;
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll and Handle Focus Trap
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Initial focus inside modal (small delay for animation)
            const timer = setTimeout(() => {
                if (!dialogRef.current) return;
                const focusable = dialogRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusable.length > 0) {
                    focusable[0].focus();
                } else {
                    dialogRef.current.focus();
                }
            }, 50);

            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
            
            // Return focus to trigger
            if (triggerRef.current) {
                triggerRef.current.focus();
                triggerRef.current = null;
            }
        }
    }, [isOpen]);

    // Tab key focus trap listener
    useEffect(() => {
        if (!isOpen || !dialogRef.current) return;
        const dialog = dialogRef.current;

        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            const focusable = dialog.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        dialog.addEventListener('keydown', handleTab);
        return () => dialog.removeEventListener('keydown', handleTab);
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
                            ref={dialogRef}
                            tabIndex="-1"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={title ? titleId : undefined}
                            variants={modalExpand}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={styles.dialog}
                            className="glass"
                            onClick={e => e.stopPropagation()} // Prevent click through to backdrop
                        >
                            <div style={styles.header}>
                                {title && <h3 id={titleId} style={styles.title}>{title}</h3>}
                                <button 
                                    onClick={onClose} 
                                    style={styles.closeBtn}
                                    aria-label="Close dialog"
                                >
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
