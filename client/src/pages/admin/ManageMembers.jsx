import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { UserPlus, Settings2, Trash2 } from 'lucide-react';

const AdminMembers = () => {
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

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-users']);
            toast.success('Member disabled successfully.');
        },
        onError: (err) => toast.error(err.message || 'Failed to disable member')
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

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading members database...</div>;

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
                    gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px 80px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface-2)',
                    fontSize: '0.875rem',
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase'
                }}>
                    <div>Member</div>
                    <div>Username</div>
                    <div>Role</div>
                    <div style={{ textAlign: 'center' }}>Actions</div>
                </div>

                {users?.map((user) => (
                    <div key={user.id} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(200px, 1fr) 150px 100px 80px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontWeight: 500 }}>{user.displayName}</div>
                        <div style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{user.username}</div>
                        <div>
                            <Badge variant={user.role === 'ADMIN' ? 'accent' : 'neutral'}>{user.role}</Badge>
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setEditingUser(user);
                                setIsEditModalOpen(true);
                            }}>
                                <Settings2 size={16} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to disable ${user.username}?`)) {
                                        deleteMutation.mutate(user.id);
                                    }
                                }}
                                disabled={deleteMutation.isPending || user.role === 'ADMIN'}
                            >
                                <Trash2 size={16} color={user.role === 'ADMIN' ? 'var(--c-text-muted)' : '#f85149'} />
                            </Button>
                        </div>
                    </div>
                ))}
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
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%' }}>
                            {createMutation.isPending ? 'Creating Account...' : 'Create Member Account'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* EDIT MODAL */}
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
