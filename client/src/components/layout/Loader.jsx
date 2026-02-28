import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading internal assets (AI weights metaphor)
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 400); // Small buffer at 100%
                    return 100;
                }
                return p + Math.floor(Math.random() * 15) + 5;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <AnimatePresence>
            <motion.div
                exit={{ opacity: 0, y: -20, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'var(--c-bg)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '3rem',
                            letterSpacing: '0.1em',
                            color: 'var(--c-accent)',
                            marginBottom: 'var(--space-sm)'
                        }}
                    >
                        VISTA
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.2 } }}
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.875rem',
                            color: 'var(--c-text-muted)',
                            textTransform: 'uppercase'
                        }}
                    >
                        Initializing Vision Matrix // {progress}%
                    </motion.p>
                </div>

                <div style={{
                    width: '200px',
                    height: '2px',
                    backgroundColor: 'var(--c-surface-2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.15 }}
                        style={{
                            height: '100%',
                            backgroundColor: 'var(--c-accent)',
                            boxShadow: '0 0 10px var(--c-glow)'
                        }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Loader;
