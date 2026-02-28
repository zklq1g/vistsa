import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { FileUp, Trash2, Link as LinkIcon, Download } from 'lucide-react';

const AdminStudy = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'RESOURCE',
        externalUrl: '',
        fileUrl: ''
    });

    const { data: materials, isLoading } = useQuery({
        queryKey: ['admin-study'],
        queryFn: () => api.get('/study').then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/study', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Study material uploaded successfully.');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: '' });
        },
        onError: (err) => toast.error(err.message || 'Failed to upload material')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/study/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-study']);
            toast.success('Study material removed.');
        },
        onError: (err) => toast.error(err.message || 'Failed to remove material')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) {
            return toast.error('Title is required');
        }
        if (!formData.externalUrl && !formData.fileUrl) {
            return toast.error('You must provide either an External URL or a File URL');
        }
        createMutation.mutate(formData);
    };

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading materials...</div>;

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'ROADMAP': return 'accent';
            case 'PAPER': return 'neutral';
            default: return 'success';
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Study Wing</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Upload PDFs, research papers, and tutorial links.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <FileUp size={18} /> Upload Resource
                </Button>
            </div>

            <div style={{ backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(250px, 1fr) 120px 100px 80px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: 'var(--c-surface-2)',
                    fontSize: '0.875rem',
                    color: 'var(--c-text-muted)',
                    textTransform: 'uppercase'
                }}>
                    <div>Resource Title</div>
                    <div>Category</div>
                    <div style={{ textAlign: 'center' }}>Link</div>
                    <div style={{ textAlign: 'center' }}>Actions</div>
                </div>

                {materials?.map((mat) => (
                    <div key={mat.id} style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(250px, 1fr) 120px 100px 80px',
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--c-border)',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: '4px' }}>{mat.title}</div>
                            <div style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }} className="ellipsis">{mat.description}</div>
                        </div>
                        <div>
                            <Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge>
                        </div>
                        <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {mat.externalUrl && (
                                <a href={mat.externalUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)' }}>
                                    <LinkIcon size={16} />
                                </a>
                            )}
                            {mat.fileUrl && (
                                <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)' }}>
                                    <Download size={16} />
                                </a>
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this resource?')) {
                                        deleteMutation.mutate(mat.id);
                                    }
                                }}
                                disabled={deleteMutation.isPending}
                            >
                                <Trash2 size={16} color="#f85149" />
                            </Button>
                        </div>
                    </div>
                ))}

                {materials?.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--c-text-muted)' }}>No study materials found.</div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Resource">
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
                            type="url"
                            value={formData.externalUrl}
                            onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
                            placeholder="https://..."
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>File Access URL (Drive, Cloudinary)</label>
                        <input
                            type="url"
                            value={formData.fileUrl}
                            onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                            placeholder="https://..."
                            style={styles.input}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>We currently do not host large PDFs directly. Please link to Google Drive/etc.</p>
                    </div>

                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%' }}>
                            {createMutation.isPending ? 'Uploading...' : 'Publish Resource'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const styles = {
    label: { display: 'block', marginBottom: '8px', fontSize: '0.875rem' },
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

export default AdminStudy;
