import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, Settings2, Trash2, Users } from 'lucide-react';

const AdminMembers = () => {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        displayName: '',
        role: 'MEMBER'
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({ newPassword: '' });

    const { data: users, isLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('Member account created successfully.');
            setIsModalOpen(false);
            setFormData({ username: '', password: '', displayName: '', role: 'MEMBER' });
        },
        onError: (err) => toast.error(err.message || 'Failed to create account')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-status`),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success(res.message || 'Status updated successfully');
        },
        onError: (err) => toast.error(err.message || 'Failed to update status')
    });

    const hardDeleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}/permanent`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('Member permanently removed.');
        },
        onError: (err) => toast.error(err.message || 'Failed to delete member')
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (data) => api.patch(`/admin/users/${data.id}/reset-password`, { newPassword: data.newPassword }),
        onSuccess: () => {
            toast.success('Password reset successfully.');
            setIsEditModalOpen(false);
            setEditFormData({ newPassword: '' });
        },
        onError: (err) => toast.error(err.message || 'Failed to reset password')
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editFormData.newPassword) return toast.error('New password is required');

        if (window.confirm(`Are you sure you want to reset the password for ${editingUser.username}?`)) {
            resetPasswordMutation.mutate({
                id: editingUser.id,
                newPassword: editFormData.newPassword
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.displayName) {
            return toast.error('Please fill all required fields');
        }
        createMutation.mutate(formData);
    };

    if (isLoading) return <div style={{ padding: '40px', color: 'var(--c-text-muted)' }}>Loading members database...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Members</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Create and manage VISTA member accounts.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={18} /> Add Member
                </Button>
            </div>

            <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 100px 140px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface-2)',
                    fontSize: '0.875rem',
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase'
                }}>
                    <div>Member</div>
                    <div>Username</div>
                    <div style={{ textAlign: 'left' }}>Role</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {users?.map((user) => (
                    <div key={user.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr 100px 140px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        alignItems: 'center',
                        opacity: user.isActive ? 1 : 0.6
                    }}>
                        <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.displayName}
                            {!user.isActive && <Badge variant="neutral" size="sm">DISABLED</Badge>}
                        </div>
                        <div style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                        <div style={{ textAlign: 'left' }}>
                            <Badge variant={user.role === 'ADMIN' ? 'accent' : (user.role === 'MOD' ? 'warning' : 'neutral')}>
                                {user.role === 'MOD' ? 'MOD' : user.role}
                            </Badge>
                        </div>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingUser(user);
                                    setIsEditModalOpen(true);
                                }}
                                title="Reset Password / Edit"
                            >
                                <Settings2 size={16} />
                            </Button>

                            <button
                                onClick={() => {
                                    const action = user.isActive ? 'disable' : 'enable';
                                    if (window.confirm(`Are you sure you want to ${action} ${user.username}?`)) {
                                        toggleStatusMutation.mutate(user.id);
                                    }
                                }}
                                disabled={toggleStatusMutation.isPending || (user.role === 'ADMIN') || (currentUser?.role === 'MOD' && user.role !== 'MEMBER')}
                                title={user.isActive ? 'Disable User' : 'Enable User'}
                                style={{
                                    width: '34px',
                                    height: '18px',
                                    borderRadius: '9px',
                                    backgroundColor: user.isActive ? '#3fb950' : 'var(--c-surface-3)',
                                    position: 'relative',
                                    border: '1px solid var(--c-border)',
                                    cursor: (user.role === 'ADMIN' || (currentUser?.role === 'MOD' && user.role !== 'MEMBER')) ? 'not-allowed' : 'pointer',
                                    padding: 0,
                                    margin: '0 4px',
                                    transition: 'background-color 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: '#fff',
                                    position: 'absolute',
                                    top: '2px',
                                    left: user.isActive ? '18px' : '2px',
                                    transition: 'left 0.2s'
                                }} />
                            </button>

                            {/* Delete strictly ADMIN only */}
                            {currentUser?.role === 'ADMIN' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm(`PERMANENTLY DELETE ${user.username}? This cannot be undone.`)) {
                                            hardDeleteMutation.mutate(user.id);
                                        }
                                    }}
                                    disabled={hardDeleteMutation.isPending || user.id === currentUser?.id}
                                    title="Permanently Delete"
                                >
                                    <Trash2 size={16} color={user.id === useAuthStore.getState().user?.id ? 'var(--c-text-muted)' : '#f85149'} />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {users?.length === 0 && (
                    <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                        <Users size={48} style={{ opacity: 0.15, margin: '0 auto 16px', display: 'block' }} />
                        <h3 style={{ color: 'var(--c-text)', marginBottom: '8px' }}>No Members Found</h3>
                        <p style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
                            {currentUser?.role === 'MOD'
                                ? "You only have permission to view and manage 'MEMBER' accounts."
                                : "Currently there are no other member accounts in the system."}
                        </p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Account">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Display Name</label>
                        <input
                            type="text"
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                            placeholder="e.g. John Doe"
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Username (Login ID)</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="e.g. john.doe"
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Initial Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Min 6 characters"
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Role</label>
                        <select
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                            style={styles.input}
                        >
                            <option value="MEMBER">Standard Member</option>
                            {currentUser?.role === 'ADMIN' && (
                                <option value="MOD">Moderator (MOD)</option>
                            )}
                        </select>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%' }}>
                            {createMutation.isPending ? 'Creating Account...' : 'Create Member Account'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit ${editingUser?.displayName}`}>
                <div style={{ marginBottom: 'var(--space-md)', padding: '12px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-md)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--c-text-muted)' }}>
                        <strong>Username:</strong> {editingUser?.username} <br />
                        <strong>Role:</strong> {editingUser?.role}
                    </p>
                </div>

                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Force Reset Password</label>
                        <input
                            type="text"
                            value={editFormData.newPassword}
                            onChange={e => setEditFormData({ newPassword: e.target.value })}
                            placeholder="Enter new password"
                            style={styles.input}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                            Currently, admins can only force-reset passwords. Profile editing is handled by the user.
                        </p>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={resetPasswordMutation.isPending} style={{ width: '100%' }}>
                            {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const styles = {
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--r-md)',
        backgroundColor: 'var(--c-surface-2)',
        color: 'var(--c-text)',
        border: '1px solid var(--c-border)',
        fontFamily: 'var(--font-body)',
        outline: 'none'
    }
};

export default AdminMembers;
