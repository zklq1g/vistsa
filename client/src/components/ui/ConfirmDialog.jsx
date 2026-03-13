import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalExpand, modalBackdrop } from '../../motion/variants';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

/**
 * ConfirmDialog — accessible confirmation dialog for destructive actions.
 * Uses role="alertdialog" with aria-labelledby and aria-describedby.
 * Focus is trapped inside and returned to the trigger on close.
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger', // 'danger' | 'warning'
}) => {
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);
    const triggerRef = useRef(null);

    // Save the trigger element when opening
    useEffect(() => {
        if (isOpen) {
            triggerRef.current = document.activeElement;
        }
    }, [isOpen]);

    // Focus the cancel button when opening, return focus on close
    useEffect(() => {
        if (isOpen) {
            // Small delay to let animation start
            const timer = setTimeout(() => {
                cancelRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        } else if (triggerRef.current) {
            triggerRef.current.focus();
            triggerRef.current = null;
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Focus trap
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

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const accentColor = variant === 'danger' ? '#f85149' : '#d29922';

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
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="confirm-dialog-title"
                            aria-describedby="confirm-dialog-desc"
                            variants={modalExpand}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={styles.dialog}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div style={{
                                ...styles.iconCircle,
                                backgroundColor: `${accentColor}15`,
                                border: `1px solid ${accentColor}30`,
                            }}>
                                <AlertTriangle size={24} color={accentColor} />
                            </div>

                            {/* Title */}
                            <h3
                                id="confirm-dialog-title"
                                style={{ ...styles.title, color: 'var(--c-text)' }}
                            >
                                {title}
                            </h3>

                            {/* Message */}
                            <p id="confirm-dialog-desc" style={styles.message}>
                                {message}
                            </p>

                            {/* Actions */}
                            <div style={styles.actions}>
                                <Button
                                    ref={cancelRef}
                                    variant="secondary"
                                    onClick={onClose}
                                    style={{ flex: 1 }}
                                >
                                    {cancelLabel}
                                </Button>
                                <button
                                    onClick={handleConfirm}
                                    style={{
                                        ...styles.confirmBtn,
                                        backgroundColor: accentColor,
                                        borderColor: accentColor,
                                    }}
                                >
                                    {confirmLabel}
                                </button>
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
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
        maxWidth: '400px',
        backgroundColor: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
        textAlign: 'center',
    },
    iconCircle: {
        width: '56px',
        height: '56px',
        borderRadius: 'var(--r-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        margin: 0,
        fontSize: '1.15rem',
        fontWeight: 600,
    },
    message: {
        margin: 0,
        fontSize: '0.875rem',
        color: 'var(--c-text-muted)',
        lineHeight: 1.5,
    },
    actions: {
        display: 'flex',
        gap: 'var(--space-sm)',
        width: '100%',
        marginTop: 'var(--space-sm)',
    },
    confirmBtn: {
        flex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        borderRadius: 'var(--r-full)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 500,
        fontSize: '1rem',
        color: '#ffffff',
        border: '1px solid',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        minHeight: '44px',
    },
};

export default ConfirmDialog;
