import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { FileUp, Trash2, Link as LinkIcon, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const getBadgeVariant = (status) => {
  if (status === 'APPROVED') return 'success';
  if (status === 'REJECTED') return 'danger';
  return 'neutral';
};

const getCategoryBadgeColor = (category) => {
  if (category === 'ROADMAP') return 'accent';
  if (category === 'PAPER') return 'neutral';
  return 'success';
};

const AdminStudy = () => {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);
  const [tab, setTab] = useState('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: ''
  });

  const { data: allRes, isLoading: allLoading } = useQuery({
    queryKey: ['admin-study-all'],
    queryFn: () => api.get('/study/all').then(res => res.data)
  });

  const { data: pendingRes, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-study-pending'],
    queryFn: () => api.get('/study/pending').then(res => res.data)
  });

  const allMaterials = allRes?.data ?? allRes ?? [];
  const pendingMaterials = pendingRes?.data ?? pendingRes ?? [];

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/study/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-study-all']);
      queryClient.invalidateQueries(['admin-study-pending']);
      toast.success('Resource approved and published!');
    },
    onError: (err) => toast.error(err.message || 'Failed to approve')
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => api.patch(`/study/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-study-all']);
      queryClient.invalidateQueries(['admin-study-pending']);
      toast.success('Resource rejected.');
    },
    onError: (err) => toast.error(err.message || 'Failed to reject')
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/study', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-study-all']);
      toast.success('Resource published successfully.');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: '' });
    },
    onError: (err) => toast.error(err.message || 'Failed to upload material')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/study/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-study-all']);
      queryClient.invalidateQueries(['admin-study-pending']);
      toast.success('Resource removed.');
    },
    onError: (err) => toast.error(err.message || 'Failed to remove')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return toast.error('Title is required');
    if (!formData.externalUrl && !formData.fileUrl) {
      return toast.error('Provide at least one URL (External or File)');
    }
    createMutation.mutate(formData);
  };

  const tabStyle = (active) => ({
    padding: '8px 16px',
    borderRadius: 'var(--r-md)',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--c-bg)' : 'var(--c-text-muted)',
    backgroundColor: active ? 'var(--c-text)' : 'transparent',
    border: '1px solid var(--c-border)',
    cursor: 'pointer',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Study Wing</h1>
          <p style={{ color: 'var(--c-text-muted)' }}>
            Review member submissions and upload resources.
            {pendingMaterials.length > 0 && (
              <span style={{ color: '#f0883e', marginLeft: '8px', fontWeight: 600 }}>
                {pendingMaterials.length} pending approval ⚠
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={tabStyle(tab === 'pending')} onClick={() => setTab('pending')}>
            Pending {pendingMaterials.length > 0 && `(${pendingMaterials.length})`}
          </button>
          <button style={tabStyle(tab === 'all')} onClick={() => setTab('all')}>
            All Resources
          </button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <FileUp size={18} /> Upload Resource
          </Button>
        </div>
      </div>

      {tab === 'pending' && (
        <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface-2)', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 140px', fontSize: '0.8rem', color: 'var(--c-text-muted)', textTransform: 'uppercase' }}>
            <div>Resource</div><div>Category</div><div>Submitted By</div><div style={{ textAlign: 'center' }}>Actions</div>
          </div>
          {pendingLoading && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>Loading...</div>}
          {!pendingLoading && pendingMaterials.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
              <Clock size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
              No pending submissions. All clear!
            </div>
          )}
          {pendingMaterials.map((mat) => (
            <div key={mat.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 120px 140px', padding: '16px 24px', borderBottom: '1px solid var(--c-border)', alignItems: 'center', borderLeft: '3px solid #f0883e' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '2px' }}>{mat.title}</div>
                <div style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                  {mat.description}
                </div>
                <div style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
                  {mat.externalUrl && <a href={mat.externalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)', fontSize: '0.75rem' }}>External Link ↗</a>}
                  {mat.fileUrl && <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)', fontSize: '0.75rem' }}>File Link ↗</a>}
                </div>
              </div>
              <div><Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge></div>
              <div style={{ fontSize: '0.875rem', color: 'var(--c-text-muted)' }}>
                {mat.uploadedBy?.displayName ?? 'Unknown'}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => approveMutation.mutate(mat.id)}
                  disabled={approveMutation.isPending}
                  title="Approve"
                >
                  <CheckCircle2 size={15} /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => rejectMutation.mutate(mat.id)}
                  disabled={rejectMutation.isPending}
                  style={{ borderColor: '#f85149', color: '#f85149' }}
                  title="Reject"
                >
                  <XCircle size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface-2)', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 100px 80px 80px', fontSize: '0.8rem', color: 'var(--c-text-muted)', textTransform: 'uppercase' }}>
            <div>Resource Title</div><div>Category</div><div>Status</div><div style={{ textAlign: 'center' }}>Link</div><div style={{ textAlign: 'center' }}>Delete</div>
          </div>
          {allLoading && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>Loading...</div>}
          {allMaterials.map((mat) => (
            <div key={mat.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 120px 100px 80px 80px', padding: '16px 24px', borderBottom: '1px solid var(--c-border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{mat.title}</div>
                <div style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem' }}>{mat.uploadedBy?.displayName}</div>
              </div>
              <div><Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge></div>
              <div><Badge variant={getBadgeVariant(mat.status)}>{mat.status}</Badge></div>
              <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {mat.externalUrl && <a href={mat.externalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)' }}><LinkIcon size={16} /></a>}
                {mat.fileUrl && <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)' }}><Download size={16} /></a>}
              </div>
              <div style={{ textAlign: 'center' }}>
                {currentUser?.role === 'ADMIN' && (
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { if (window.confirm('Delete this resource?')) deleteMutation.mutate(mat.id); }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} color="#f85149" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!allLoading && allMaterials.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>No study materials found.</div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Resource (Auto-Approved)">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={mStyles.label}>Title <span style={{ color: '#f85149' }}>*</span></label>
            <input type="text" value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Attention Is All You Need" style={mStyles.input} />
          </div>
          <div>
            <label style={mStyles.label}>Category</label>
            <select value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })} style={mStyles.input}>
              <option value="ROADMAP">Roadmap</option>
              <option value="PAPER">Research Paper</option>
              <option value="TUTORIAL">Tutorial</option>
              <option value="RESOURCE">General Resource</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label style={mStyles.label}>External URL (YouTube, Docs, etc)</label>
            <input type="text" value={formData.externalUrl}
              onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
              placeholder="https://..." style={mStyles.input} />
          </div>
          <div>
            <label style={mStyles.label}>File Access URL (Drive, Cloudinary)</label>
            <input type="text" value={formData.fileUrl}
              onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="https://..." style={mStyles.input} />
            <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>Link to Google Drive / Notion / GitHub — we don't host large files directly.</p>
          </div>
          <div>
            <label style={mStyles.label}>Description</label>
            <textarea value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              style={{ ...mStyles.input, minHeight: '60px', resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
            <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%' }}>
              {createMutation.isPending ? 'Publishing...' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const mStyles = {
  label: { display: 'block', marginBottom: '8px', fontSize: '0.875rem' },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
    backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)',
    border: '1px solid var(--c-border)', fontFamily: 'var(--font-body)', outline: 'none'
  }
};

export default AdminStudy;
