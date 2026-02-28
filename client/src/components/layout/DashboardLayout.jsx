import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
    FolderGit2,
    Trophy,
    BookOpen,
    Calendar,
    ShieldAlert,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    Users,
    BarChart2
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, isCollapsed }) => (
    <NavLink
        to={to}
        end={to === '/dashboard' || to === '/admin'}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            color: isActive ? 'var(--c-bg)' : 'var(--c-text-muted)',
            backgroundColor: isActive ? 'var(--c-text)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.2s',
            marginBottom: '4px',
            fontWeight: isActive ? 600 : 400
        })}
    >
        <Icon size={20} />
        {!isCollapsed && <span>{label}</span>}
    </NavLink>
);

const DashboardLayout = ({ requireAdmin = false }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = requireAdmin ? [
        { icon: ShieldAlert, label: 'Approval Queue', to: '/admin' },
        { icon: Trophy, label: 'Manage Leaderboard', to: '/admin/leaderboard' },
        { icon: Users, label: 'Manage Members', to: '/admin/members' },
        { icon: Calendar, label: 'Manage Events', to: '/admin/events' },
        { icon: BookOpen, label: 'Study Resources', to: '/admin/study' },
        { icon: BarChart2, label: 'Homepage Stats', to: '/admin/stats' },
    ] : [
        { icon: FolderGit2, label: 'Projects', to: '/dashboard' },
        { icon: Trophy, label: 'Leaderboard', to: '/dashboard/leaderboard' },
        { icon: BookOpen, label: 'Study Wing', to: '/dashboard/study' },
        { icon: Calendar, label: 'Events', to: '/dashboard/events' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--c-bg)' }}>
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                style={{
                    borderRight: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    zIndex: 40
                }}
            >
                <div style={{ padding: '24px 16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                    {!isCollapsed && (
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-accent)' }}>
                            VISTA
                        </span>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ color: 'var(--c-text-muted)' }}>
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '0 12px', marginTop: '16px' }}>
                    {requireAdmin && !isCollapsed && (
                        <div style={{ padding: '0 16px 8px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--c-accent)', letterSpacing: '0.05em' }}>
                            Admin Panel
                        </div>
                    )}
                    {menuItems.map(item => (
                        <SidebarItem key={item.to} icon={item.icon} label={item.label} to={item.to} isCollapsed={isCollapsed} />
                    ))}
                </nav>

                <div style={{ padding: '16px 12px', borderTop: '1px solid var(--c-border)' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: 'var(--c-text-muted)',
                        marginBottom: '8px'
                    }}>
                        <User size={20} />
                        {!isCollapsed && (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--c-text)', fontSize: '0.875rem', fontWeight: 500 }}>{user?.displayName || 'User'}</span>
                                <span style={{ fontSize: '0.75rem' }}>{user?.role}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: 'var(--r-md)',
                            color: '#f85149',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 'var(--space-xl)', flex: 1 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
