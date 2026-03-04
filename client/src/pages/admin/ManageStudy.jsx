import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { FileUp, Trash2, Link as LinkIcon, Download, CheckCircle, XCircle } from 'lucide-react';

const AdminStudy = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'PENDING'
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedResourceId, setSelectedResourceId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'RESOURCE',
        externalUrl: '',
        fileUrl: ''
    });

    const { data: materialsRes, isLoading } = useQuery({
        queryKey: ['admin-study'],
        queryFn: () => api.get('/study').then(res => res.data)
    });

    // Handle nested data from standard response
    const materials = materialsRes?.data ?? materialsRes ?? [];

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/study', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Study material uploaded and published successfully.');
            setIsUploadModalOpen(false);
            setFormData({ title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: '' });
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to upload material')
    });

    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/study/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Resource approved and published!');
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to approve resource')
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }) => api.patch(`/study/${id}/reject`, { reason }),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Resource rejected.');
            setIsRejectModalOpen(false);
            setRejectReason('');
            setSelectedResourceId(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to reject resource')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/study/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Study material removed.');
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to remove material')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Title is required');
        if (!formData.externalUrl && !formData.fileUrl) return toast.error('You must provide at least one URL');
        createMutation.mutate(formData);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!selectedResourceId) return;
        rejectMutation.mutate({ id: selectedResourceId, reason: rejectReason });
    };

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading materials...</div>;

    const filteredMaterials = activeTab === 'PENDING'
        ? materials.filter(m => m.status === 'PENDING')
        : materials;

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'ROADMAP': return 'accent';
            case 'PAPER': return 'neutral';
            default: return 'success';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <Badge variant="warning">Pending</Badge>;
            case 'REJECTED': return <Badge variant="danger">Rejected</Badge>;
            default: return <Badge variant="success">Approved</Badge>;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Study Wing</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Review member submissions or upload official resources directly.</p>
                </div>
                <Button variant="primary" onClick={() => setIsUploadModalOpen(true)}>
                    <FileUp size={18} /> Direct Publish
                </Button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--c-border)', marginBottom: 'var(--space-lg)' }}>
                <button
                    onClick={() => setActiveTab('ALL')}
                    style={{
                        padding: '12px 16px', background: 'none', border: 'none',
                        borderBottom: activeTab === 'ALL' ? '2px solid var(--c-accent)' : '2px solid transparent',
                        color: activeTab === 'ALL' ? 'var(--c-text)' : 'var(--c-text-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '1rem',
                        transition: 'all 0.2s', touchAction: 'manipulation'
                    }}
                >
                    All Resources
                </button>
                <button
                    onClick={() => setActiveTab('PENDING')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 16px', background: 'none', border: 'none',
                        borderBottom: activeTab === 'PENDING' ? '2px solid var(--c-accent)' : '2px solid transparent',
                        color: activeTab === 'PENDING' ? 'var(--c-text)' : 'var(--c-text-muted)',
                        cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '1rem',
                        transition: 'all 0.2s', touchAction: 'manipulation'
                    }}
                >
                    Review Queue
                    {materials.filter(m => m.status === 'PENDING').length > 0 && (
                        <span style={{ backgroundColor: 'var(--c-accent)', color: 'var(--c-bg)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {materials.filter(m => m.status === 'PENDING').length}
                        </span>
                    )}
                </button>
            </div>

            <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflowX: 'auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px 90px 140px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface-2)',
                    fontSize: '0.875rem',
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase',
                    minWidth: '680px'
                }}>
                    <div>Resource Title & Submitter</div>
                    <div>Category</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'center' }}>Link</div>
                    <div style={{ textAlign: 'center' }}>Actions</div>
                </div>

                {filteredMaterials.map((mat) => (
                    <div key={mat.id} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(250px, 1fr) 100px 100px 90px 140px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        alignItems: 'center',
                        minWidth: '680px'
                    }}>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{mat.title}</div>
                            <div style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }} className="ellipsis">{mat.description}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                By: {mat.uploadedBy?.displayName || 'Admin'}
                            </div>
                        </div>
                        <div>
                            <Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge>
                        </div>
                        <div>
                            {getStatusBadge(mat.status)}
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {mat.externalUrl && (
                                <a href={mat.externalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)', padding: '4px' }}>
                                    <LinkIcon size={16} />
                                </a>
                            )}
                            {mat.fileUrl && (
                                <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)', padding: '4px' }}>
                                    <Download size={16} />
                                </a>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {mat.status === 'PENDING' && (
                                <>
                                    <Button
                                        variant="accent"
                                        size="sm"
                                        onClick={() => approveMutation.mutate(mat.id)}
                                        disabled={approveMutation.isPending}
                                        style={{ padding: '6px 8px' }}
                                    >
                                        <CheckCircle size={16} color="var(--c-bg)" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedResourceId(mat.id);
                                            setIsRejectModalOpen(true);
                                        }}
                                        style={{ borderColor: '#f85149', padding: '6px 8px' }}
                                    >
                                        <XCircle size={16} color="#f85149" />
                                    </Button>
                                </>
                            )}
                            {mat.status !== 'PENDING' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this resource entirely?')) {
                                            deleteMutation.mutate(mat.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                    style={{ padding: '6px 8px' }}
                                >
                                    <Trash2 size={16} color="#f85149" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredMaterials.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                        {activeTab === 'PENDING' ? 'No pending submissions.' : 'No materials found.'}
                    </div>
                )}
            </div>

            {/* Direct Upload Modal (Admin only) */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Official Resource">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={styles.label}>Title <span style={{ color: '#f85149' }}>*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Attention Is All You Need"
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Category</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            style={styles.input}
                        >
                            <option value="ROADMAP">Roadmap</option>
                            <option value="PAPER">Research Paper</option>
                            <option value="TUTORIAL">Tutorial</option>
                            <option value="RESOURCE">General Resource</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>External URL (YouTube, Medium, etc)</label>
                        <input
                            type="text"
                            value={formData.externalUrl}
                            onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
                            placeholder="https://..."
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>File Access URL (Drive, Dropbox)</label>
                        <input
                            type="text"
                            value={formData.fileUrl}
                            onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                            placeholder="https://..."
                            style={styles.input}
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                        />
                    </div>
                    <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                        {createMutation.isPending ? 'Uploading...' : 'Publish Immediately'}
                    </Button>
                </form>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={() => { setIsRejectModalOpen(false); setRejectReason(''); }} title="Reject Resource">
                <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={styles.label}>Reason for rejection (Optional)</label>
                        <input
                            type="text"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="e.g. Broken link, irrelevant topic..."
                            style={styles.input}
                        />
                    </div>
                    <Button type="submit" variant="secondary" disabled={rejectMutation.isPending} style={{ width: '100%', borderColor: '#f85149', color: '#f85149', marginTop: 'var(--space-md)' }}>
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject Submission'}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

const styles = {
    label: { display: 'block', marginBottom: '8px', fontSize: '0.875rem' },
    input: {
        width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
        backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)',
        border: '1px solid var(--c-border)', fontFamily: 'var(--font-body)', outline: 'none'
    }
};

export default AdminStudy;
