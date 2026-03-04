import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Trophy, Users, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ModUtilityCard = ({ icon: Icon, title, description, to, color }) => (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        <motion.div
            whileHover={{ y: -5, borderColor: color }}
            style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'border-color 0.2s',
            }}
        >
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                <Icon size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
                {description}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: color }}>
                Launch Tool <ArrowRight size={14} />
            </div>
        </motion.div>
    </Link>
);

const ModeratorHome = () => {
    const { user } = useAuthStore();

    const tools = [
        {
            icon: ShieldAlert,
            title: 'Approval Queue',
            description: 'Review and approve project submissions from members.',
            to: '/moderator',
            color: '#3fb950'
        },
        {
            icon: Trophy,
            title: 'Manage Leaderboard',
            description: 'Award or deduct points based on member contributions.',
            to: '/moderator/leaderboard',
            color: 'var(--c-accent)'
        },
        {
            icon: Users,
            title: 'Manage Members',
            description: 'Toggle membership status and reset passwords.',
            to: '/moderator/members',
            color: '#2f81f7'
        },
        {
            icon: BookOpen,
            title: 'Study Resources',
            description: 'Upload and moderate learning materials.',
            to: '/moderator/study',
            color: '#a371f7'
        },
        {
            icon: Calendar,
            title: 'Manage Events',
            description: 'Schedule and coordinate society workshops.',
            to: '/moderator/events',
            color: '#f0883e'
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Moderator Portal</h1>
                <p style={{ color: 'var(--c-text-muted)', fontSize: '1.1rem' }}>
                    Welcome back, {user?.displayName}. You have elevated permissions to keep VISTA running smoothly.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
            }}>
                {tools.map((tool, idx) => (
                    <ModUtilityCard key={idx} {...tool} />
                ))}
            </div>

            <div style={{
                padding: 'var(--space-lg)',
                backgroundColor: 'rgba(63, 185, 80, 0.05)',
                border: '1px solid rgba(63, 185, 80, 0.2)',
                borderRadius: 'var(--r-md)',
                color: 'var(--c-text-muted)',
                fontSize: '0.875rem'
            }}>
                <h4 style={{ color: '#3fb950', marginTop: 0, marginBottom: '8px' }}>Security Notice</h4>
                <p style={{ margin: 0 }}>
                    As a Moderator, actions you take are logged. You can manage Members, but you do not have permission to delete content or manage fellow Moderators/Admins.
                </p>
            </div>
        </div>
    );
};

export default ModeratorHome;
