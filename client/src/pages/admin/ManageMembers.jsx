import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuthStore } from '../../store/authStore';
import { UserPlus, Settings2, Trash2, Users } from 'lucide-react';

const AdminMembers = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);
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

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmLabel: 'Confirm',
    variant: 'danger'
  });

  const openConfirm = (config) => setConfirmState({ ...config, isOpen: true });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

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
    openConfirm({
      title: 'Reset Password',
      message: `Are you sure you want to reset the password for ${editingUser.username}?`,
      confirmLabel: 'Reset Password',
      variant: 'warning',
      onConfirm: () => {
        resetPasswordMutation.mutate({
          id: editingUser.id,
          newPassword: editFormData.newPassword
        });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.displayName) {
      return toast.error('Please fill all required fields');
    }
    createMutation.mutate(formData);
  };

  const handleToggleStatus = (user) => {
    const action = user.isActive ? 'disable' : 'enable';
    openConfirm({
      title: `${action === 'enable' ? 'Enable' : 'Disable'} User`,
      message: `Are you sure you want to ${action} the account for ${user.username}? ${action === 'disable' ? 'They will not be able to log in.' : ''}`,
      confirmLabel: `${action === 'enable' ? 'Enable' : 'Disable'} Account`,
      variant: action === 'enable' ? 'warning' : 'danger',
      onConfirm: () => toggleStatusMutation.mutate(user.id)
    });
  };

  const handleDelete = (user) => {
    openConfirm({
      title: 'Permanently Delete User',
      message: `PERMANENTLY DELETE ${user.username}? \nThis action cannot be undone and will remove all their data.`,
      confirmLabel: 'Delete Forever',
      variant: 'danger',
      onConfirm: () => hardDeleteMutation.mutate(user.id)
    });
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

      <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} aria-label="Members List">
          <thead style={{
            borderBottom: '1px solid var(--c-border)',
            backgroundColor: 'var(--c-surface-2)',
            fontSize: '0.875rem',
            color: 'var(--c-text-muted)',
            textTransform: 'uppercase'
          }}>
            <tr>
              <th scope="col" style={{ padding: '16px 24px', width: '35%' }}>Member</th>
              <th scope="col" style={{ padding: '16px 24px', width: '25%' }}>Username</th>
              <th scope="col" style={{ padding: '16px 24px', width: '15%' }}>Role</th>
              <th scope="col" style={{ padding: '16px 24px', width: '25%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const isHigherRank = user.role === 'ADMIN' || (currentUser?.role === 'MOD' && user.role !== 'MEMBER');
              const canModifyStatus = !isHigherRank && !isSelf;

              return (
                <tr key={user.id} style={{
                  borderBottom: '1px solid var(--c-border)',
                  opacity: user.isActive ? 1 : 0.6,
                  transition: 'background-color 0.2s',
                }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.displayName}
                      {!user.isActive && <Badge variant="neutral" size="sm">DISABLED</Badge>}
                    </div>
                  </td>

                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                      {user.username}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Badge variant={user.role === 'ADMIN' ? 'accent' : (user.role === 'MOD' ? 'accent' : 'neutral')}>
                      {user.role === 'MOD' ? 'MOD' : user.role}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditModalOpen(true);
                        }}
                        title="Reset Password / Edit"
                        aria-label={`Settings for ${user.displayName}`}
                      >
                        <Settings2 size={16} />
                      </Button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={toggleStatusMutation.isPending || !canModifyStatus}
                        aria-disabled={!canModifyStatus}
                        title={user.isActive ? 'Disable User' : 'Enable User'}
                        aria-label={user.isActive ? `Disable ${user.displayName}` : `Enable ${user.displayName}`}
                        style={{
                          width: '36px',
                          height: '20px',
                          borderRadius: '10px',
                          backgroundColor: user.isActive ? '#3fb950' : 'var(--c-surface-3)',
                          position: 'relative',
                          border: '1px solid var(--c-border)',
                          cursor: !canModifyStatus ? 'not-allowed' : 'pointer',
                          padding: 0,
                          transition: 'background-color 0.2s',
                          opacity: canModifyStatus ? 1 : 0.5
                        }}
                      >
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: '2px',
                          left: user.isActive ? '18px' : '2px',
                          transition: 'left 0.2s'
                        }} />
                      </button>
                      {currentUser?.role === 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          disabled={hardDeleteMutation.isPending || isSelf}
                          title={isSelf ? "Cannot delete yourself" : "Permanently Delete"}
                          aria-label={`Delete ${user.displayName}`}
                        >
                          <Trash2 size={16} color={isSelf ? 'var(--c-text-muted)' : '#f85149'} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
      />
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
