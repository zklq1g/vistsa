import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    Menu,
    X,
    ShieldCheck,
    LayoutDashboard,
    BarChart2
} from 'lucide-react';


const SidebarItem = ({ icon: Icon, label, to, isCollapsed, onClick }) => (
    <NavLink
        to={to}
        end={to === '/dashboard' || to === '/admin'}
        onClick={onClick}
        aria-label={isCollapsed ? label : undefined}
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
            fontWeight: isActive ? 600 : 400,
            minHeight: 'var(--touch-target)',
        })}
    >
        <Icon size={20} style={{ flexShrink: 0 }} />
        {!isCollapsed && <span>{label}</span>}
    </NavLink>
);

const DashboardLayout = ({ requireAdmin = false }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile breakpoint
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const handler = (e) => {
            setIsMobile(e.matches);
            if (!e.matches) setIsMobileOpen(false);
        };
        setIsMobile(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isModeratorPanel = location.pathname.startsWith('/moderator') || (user?.role === 'MOD' && !location.pathname.startsWith('/dashboard'));

    const menuItems = isModeratorPanel ? [
        { icon: ShieldAlert, label: 'Approval Queue', to: '/moderator' },
        { icon: Trophy, label: 'Manage Leaderboard', to: '/moderator/leaderboard' },
        { icon: Users, label: 'Manage Members', to: '/moderator/members' },
        { icon: Calendar, label: 'Manage Events', to: '/moderator/events' },
        { icon: BookOpen, label: 'Study Resources', to: '/moderator/study' },
    ] : (requireAdmin ? [
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
    ]);

    // Determine page title for the panel
    const panelTitle = isModeratorPanel ? 'Moderator Panel' : (requireAdmin ? 'Admin Dashboard' : 'Dashboard');

    const sidebarContent = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div style={{
                padding: '20px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'space-between' : (isCollapsed ? 'center' : 'space-between'),
                borderBottom: '1px solid var(--c-border)',
            }}>
                {(!isCollapsed || isMobile) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: isModeratorPanel ? '#3fb950' : 'var(--c-accent)'
                        }}>
                            VISTA
                        </span>
                        {isModeratorPanel && <ShieldCheck size={18} color="#3fb950" />}
                    </div>
                )}
                {isMobile ? (
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close menu"
                        style={{
                            color: 'var(--c-text-muted)',
                            minWidth: 'var(--touch-target)',
                            minHeight: 'var(--touch-target)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={22} />
                    </button>
                ) : (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!isCollapsed}
                        style={{
                            color: 'var(--c-text-muted)',
                            minWidth: '36px',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                )}
            </div>

            {/* Nav items */}
            <nav
                role="navigation"
                aria-label="Main menu"
                style={{ flex: 1, padding: '12px', overflowY: 'auto' }}
            >
                {isModeratorPanel && !isCollapsed && (
                    <div style={{
                        padding: '0 16px 8px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        color: '#3fb950',
                        letterSpacing: '0.05em'
                    }}>
                        Moderator Portal
                    </div>
                )}
                {requireAdmin && !isCollapsed && (
                    <div style={{
                        padding: '0 16px 8px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        color: 'var(--c-accent)',
                        letterSpacing: '0.05em'
                    }}>
                        Admin Panel
                    </div>
                )}
                {menuItems.map(item => (
                    <SidebarItem
                        key={item.to}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                        isCollapsed={!isMobile && isCollapsed}
                        onClick={isMobile ? () => setIsMobileOpen(false) : undefined}
                    />
                ))}
            </nav>

            {/* User footer */}
            <div style={{ padding: '12px', borderTop: '1px solid var(--c-border)' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    color: 'var(--c-text-muted)',
                    marginBottom: '8px'
                }}>
                    <User size={20} style={{ flexShrink: 0 }} />
                    {(!isCollapsed || isMobile) && (
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{
                                color: 'var(--c-text)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user?.displayName || 'User'}
                            </span>
                            <span style={{ fontSize: '0.75rem' }}>{user?.role}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    aria-label="Sign out"
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: (!isCollapsed || isMobile) ? 'flex-start' : 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: 'var(--r-md)',
                        color: '#f85149',
                        transition: 'background-color 0.2s',
                        minHeight: 'var(--touch-target)',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 81, 73, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={20} />
                    {(!isCollapsed || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--c-bg)' }}>

            {/* ── Skip to main content link ── */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>

            {/* ── MOBILE: Top bar + overlay drawer ── */}
            {isMobile && (
                <>
                    {/* Top bar */}
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0,
                        height: '56px',
                        backgroundColor: 'var(--c-surface)',
                        borderBottom: '1px solid var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 16px',
                        gap: '12px',
                        zIndex: 50,
                    }}>
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            aria-label="Open menu"
                            aria-haspopup="true"
                            aria-expanded={isMobileOpen}
                            style={{
                                color: 'var(--c-text-muted)',
                                minWidth: 'var(--touch-target)',
                                minHeight: 'var(--touch-target)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Menu size={22} />
                            <span className="sr-only">Toggle menu</span>
                        </button>
                        <span style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'var(--c-accent)',
                        }}>
                            VISTA
                        </span>
                    </div>

                    {/* Backdrop */}
                    <AnimatePresence>
                        {isMobileOpen && (
                            <motion.div
                                key="backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setIsMobileOpen(false)}
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    zIndex: 55,
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Drawer */}
                    <AnimatePresence>
                        {isMobileOpen && (
                            <motion.aside
                                key="drawer"
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                                role="navigation"
                                aria-label="Mobile navigation"
                                style={{
                                    position: 'fixed',
                                    top: 0, left: 0, bottom: 0,
                                    width: '280px',
                                    backgroundColor: 'var(--c-surface)',
                                    borderRight: '1px solid var(--c-border)',
                                    zIndex: 60,
                                    overflowY: 'auto',
                                }}
                            >
                                {sidebarContent}
                            </motion.aside>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* ── DESKTOP: Sticky sidebar ── */}
            {!isMobile && (
                <motion.aside
                    initial={false}
                    animate={{ width: isCollapsed ? 72 : 260 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                    aria-label="Sidebar navigation"
                    style={{
                        borderRight: '1px solid var(--c-border)',
                        backgroundColor: 'var(--c-surface)',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        zIndex: 40,
                        flexShrink: 0,
                        overflow: 'hidden',
                    }}
                >
                    {sidebarContent}
                </motion.aside>
            )}

            {/* Main Content Area */}
            <main
                id="main-content"
                tabIndex="-1"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    /* Account for mobile top bar */
                    paddingTop: isMobile ? '56px' : 0,
                    minWidth: 0, /* prevent flex overflow */
                    outline: 'none', /* remove focus outline on skip-link target */
                }}
            >
                <div style={{
                    padding: isMobile ? 'var(--space-md)' : 'var(--space-xl)',
                    flex: 1,
                }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
