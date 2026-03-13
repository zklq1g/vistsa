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
        if (index === 0) return <Trophy size={20} color="#FFD700" aria-label="Gold Trophy" />;
        if (index === 1) return <Medal size={20} color="#C0C0C0" aria-label="Silver Medal" />;
        if (index === 2) return <Award size={20} color="#CD7F32" aria-label="Bronze Award" />;
        return <span style={{ width: 20, textAlign: 'center', color: 'var(--c-text-muted)' }} aria-label={`Rank ${index + 1}`}>{index + 1}</span>;
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
                <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflowX: 'auto' }}>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} aria-label="Leaderboard">
                        <thead style={{ 
                            borderBottom: '1px solid var(--c-border)',
                            backgroundColor: 'var(--c-surface-2)',
                            fontSize: '0.875rem',
                            color: 'var(--c-text-muted)',
                            textTransform: 'uppercase'
                        }}>
                            <tr>
                                <th scope="col" style={{ padding: '16px 24px', width: '80px' }}>Rank</th>
                                <th scope="col" style={{ padding: '16px 24px' }}>Member</th>
                                <th scope="col" style={{ padding: '16px 24px', textAlign: 'center', width: '120px' }}>Projects</th>
                                <th scope="col" style={{ padding: '16px 24px', textAlign: 'right', width: '120px' }}>Points</th>
                            </tr>
                        </thead>

                        <motion.tbody
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {entries?.map((entry, index) => (
                                <motion.tr
                                    key={entry.user?.id || entry.userId || index}
                                    variants={leaderboardRow}
                                    style={{
                                        borderBottom: index === entries.length - 1 ? 'none' : '1px solid var(--c-border)',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--c-surface-2)'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        {getRankIcon(index)}
                                    </td>

                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: 32, height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--c-bg)',
                                                border: '1px solid var(--c-border)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '12px', color: 'var(--c-text-muted)'
                                            }} aria-hidden="true">
                                                {entry.user.displayName.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{entry.user.displayName}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: '16px 24px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                                        {entry.projectCount}
                                    </td>

                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, color: 'var(--c-accent)' }}>
                                        {entry.points}
                                    </td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>

                    {entries?.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                            No leaderboard entries yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
