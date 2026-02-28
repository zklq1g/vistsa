import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const AdminLeaderboard = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [points, setPoints] = useState(10);
    const [isDeduct, setIsDeduct] = useState(false); // true = deduct mode
    const [reason, setReason] = useState('');

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    const { data: usersRes, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(res => res.data)
    });

    const { data: leaderboardRes, isLoading: lbLoading } = useQuery({
        queryKey: ['admin-leaderboard'],
        queryFn: () => api.get('/leaderboard').then(res => res.data)
    });

    // Normalise response shapes — API wraps data in .data sometimes
    const users = usersRes?.data ?? usersRes ?? [];
    const leaderboard = leaderboardRes?.data ?? leaderboardRes ?? [];

    const addPointsMutation = useMutation({
        mutationFn: (data) => api.patch(`/leaderboard/${data.userId}/points`, { delta: data.delta }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-leaderboard']);
            toast.success(isDeduct ? 'Points deducted successfully.' : 'Points awarded successfully.');
            setIsModalOpen(false);
            setPoints(10);
            setReason('');
            setIsDeduct(false);
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to update points')
    });

    const resetMutation = useMutation({
        mutationFn: (data) => api.delete('/leaderboard/reset', { data: { confirmPassword: data.adminPassword } }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-leaderboard']);
            toast.success('Leaderboard has been completely reset.');
            setIsResetModalOpen(false);
            setAdminPassword('');
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to reset leaderboard')
    });

    const openModal = (deduct = false) => {
        setIsDeduct(deduct);
        setPoints(10);
        setSelectedUserId('');
        setReason('');
        setIsModalOpen(true);
    };

    const handleUpdatePoints = (e) => {
        e.preventDefault();
        if (!selectedUserId) return toast.error('Select a user first');
        const delta = isDeduct ? -Math.abs(Number(points)) : Math.abs(Number(points));
        addPointsMutation.mutate({ userId: selectedUserId, delta });
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (!adminPassword) return toast.error('Admin password is required');
        if (window.confirm('CRITICAL WARNING: This will permanently delete ALL leaderboard points. Are you absolutely certain?')) {
            resetMutation.mutate({ adminPassword });
        }
    };

    if (usersLoading || lbLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Leaderboard</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Award or deduct points per member for hackathons, papers, and contributions.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="ghost" onClick={() => setIsResetModalOpen(true)}>
                        <RotateCcw size={16} color="#f85149" /> <span style={{ color: '#f85149' }}>Reset Season</span>
                    </Button>
                    <Button variant="ghost" onClick={() => openModal(true)} style={{ borderColor: '#f85149', color: '#f85149' }}>
                        <Minus size={18} /> Deduct
                    </Button>
                    <Button variant="primary" onClick={() => openModal(false)}>
                        <Plus size={18} /> Award Points
                    </Button>
                </div>
            </div>

            <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 120px 100px',
                    padding: '14px 24px',
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface-2)',
                    fontSize: '0.8rem',
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                }}>
                    <div>#</div>
                    <div>Member</div>
                    <div style={{ textAlign: 'center' }}>Score</div>
                    <div style={{ textAlign: 'center' }}>Projects</div>
                </div>

                {leaderboard.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                        Leaderboard is currently empty.
                    </div>
                )}

                {leaderboard.map((entry, idx) => (
                    <div key={entry.id ?? entry.userId ?? idx} style={{
                        display: 'grid',
                        gridTemplateColumns: '48px 1fr 120px 100px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        alignItems: 'center',
                        backgroundColor: idx === 0 ? 'rgba(212,197,169,0.04)' : 'transparent',
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: idx === 0 ? 'var(--c-accent)' : 'var(--c-text-muted)', fontWeight: idx === 0 ? 700 : 400 }}>
                            {idx + 1}
                        </div>
                        <div>
                            <span style={{ fontWeight: 500 }}>{entry.user?.displayName ?? 'Unknown'}</span>
                            {entry.user?.username && (
                                <span style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>@{entry.user.username}</span>
                            )}
                        </div>
                        <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--c-accent)', fontFamily: 'var(--font-mono)' }}>
                            {(entry.points ?? 0).toLocaleString()}
                        </div>
                        <div style={{ textAlign: 'center', color: 'var(--c-text-muted)' }}>{entry.projectCount ?? 0}</div>
                    </div>
                ))}
            </div>

            {/* ADD / DEDUCT POINTS MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isDeduct ? 'Deduct Points' : 'Award Points'}>
                <form onSubmit={handleUpdatePoints} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {isDeduct && (
                        <div style={{ backgroundColor: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 'var(--r-md)', padding: 'var(--space-md)' }}>
                            <p style={{ color: '#f85149', margin: 0, fontSize: '0.875rem' }}>
                                You are about to <strong>deduct</strong> points from a member. This will reduce their ranking.
                            </p>
                        </div>
                    )}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Select Member</label>
                        <select
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'pointer' }}
                        >
                            <option value="">-- Choose Member --</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName} ({u.username})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>
                            Points to {isDeduct ? 'Deduct' : 'Add'}
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={points}
                            onChange={e => setPoints(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'text' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Reason (Optional)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder={isDeduct ? "e.g. Penalty for violation" : "e.g. Won 1st place at Hackathon"}
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'text' }}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant={isDeduct ? 'ghost' : 'primary'}
                        disabled={addPointsMutation.isPending}
                        style={isDeduct ? { marginTop: 'var(--space-sm)', borderColor: '#f85149', color: '#f85149' } : { marginTop: 'var(--space-sm)' }}
                    >
                        {addPointsMutation.isPending ? 'Processing...' : (isDeduct ? 'Deduct Points' : 'Award Points')}
                    </Button>
                </form>
            </Modal>

            {/* RESET MODAL */}
            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Leaderboard Season">
                <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.2)', padding: 'var(--space-md)', borderRadius: 'var(--r-md)', marginBottom: 'var(--space-lg)' }}>
                    <p style={{ color: '#f85149', margin: 0, fontSize: '0.875rem' }}>
                        <strong>WARNING:</strong> This action will permanently delete all points for all users. This is typically done at the end of an academic year.
                    </p>
                </div>
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Confirm Admin Password</label>
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={e => setAdminPassword(e.target.value)}
                            placeholder="Enter your password to confirm"
                            style={{ width: '100%', padding: '10px', borderRadius: 'var(--r-md)', backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)', border: '1px solid var(--c-border)', cursor: 'text' }}
                        />
                    </div>
                    <Button type="submit" variant="secondary" disabled={resetMutation.isPending} style={{ marginTop: 'var(--space-sm)', borderColor: '#f85149', color: '#f85149' }}>
                        {resetMutation.isPending ? 'Resetting...' : 'Permanently Reset Leaderboard'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default AdminLeaderboard;
