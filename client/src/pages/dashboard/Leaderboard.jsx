import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { leaderboardRow, staggerContainer } from '../../motion/variants';
import api from '../../services/api';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
    const { data: entries, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: () => api.get('/leaderboard').then(res => res.data)
    });

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy size={20} color="#FFD700" />; // Gold
        if (index === 1) return <Medal size={20} color="#C0C0C0" />;  // Silver
        if (index === 2) return <Award size={20} color="#CD7F32" />;  // Bronze
        return <span style={{ width: 20, textAlign: 'center', color: 'var(--c-text-muted)' }}>{index + 1}</span>;
    };

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Society Leaderboard</h1>
                <p style={{ color: 'var(--c-text-muted)' }}>Points are awarded by admins for hackathons, papers, and contributions.</p>
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--c-text-muted)' }}>Loading rankings...</div>
            ) : (
                <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>

                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 100px 100px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        backgroundColor: 'var(--c-surface-2)',
                        fontSize: '0.875rem',
                        color: 'var(--c-text-muted)',
                        fontWeight: 500,
                        textTransform: 'uppercase'
                    }}>
                        <div>Rank</div>
                        <div>Member</div>
                        <div style={{ textAlign: 'center' }}>Projects</div>
                        <div style={{ textAlign: 'right' }}>Points</div>
                    </div>

                    {/* Table Body (Animated) */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {entries?.map((entry, index) => (
                            <motion.div
                                key={entry.user.id}
                                variants={{
                                    initial: { opacity: 0, x: -20 },
                                    animate: { opacity: 1, x: 0 }
                                }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '60px 1fr 100px 100px',
                                    alignItems: 'center',
                                    padding: '16px 24px',
                                    borderBottom: index === entries.length - 1 ? 'none' : '1px solid var(--c-border)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--c-surface-2)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div>{getRankIcon(index)}</div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: 32, height: 32,
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--c-bg)',
                                        border: '1px solid var(--c-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '12px', color: 'var(--c-text-muted)'
                                    }}>
                                        {entry.user.displayName.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{entry.user.displayName}</span>
                                </div>

                                <div style={{ textAlign: 'center', color: 'var(--c-text-muted)' }}>
                                    {entry.projectCount}
                                </div>

                                <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--c-accent)' }}>
                                    {entry.points}
                                </div>
                            </motion.div>
                        ))}

                        {entries?.length === 0 && (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                                No leaderboard entries yet.
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
