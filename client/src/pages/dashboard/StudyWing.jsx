import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { BookOpen, Video, FileText, Download, Link as LinkIcon, Plus, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const StudyWing = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'RESOURCE',
        externalUrl: '',
        fileUrl: ''
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ['study'],
        queryFn: () => api.get('/study').then(res => res.data)
    });

    const materials = response?.data ?? response ?? [];

    const submitMutation = useMutation({
        mutationFn: (data) => api.post('/study/submit', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['study']);
            toast.success('Resource submitted successfully! An admin will review it.');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: '' });
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to submit resource')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Title is required');
        if (!formData.externalUrl && !formData.fileUrl) return toast.error('You must provide at least one URL');
        submitMutation.mutate(formData);
    };

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading study materials...</div>;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'ROADMAP': return <BookOpen size={24} color="var(--c-accent)" />;
            case 'TUTORIAL': return <Video size={24} color="var(--c-accent)" />;
            case 'PAPER': return <FileText size={24} color="var(--c-accent)" />;
            default: return <BookOpen size={24} color="var(--c-accent)" />;
        }
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'ROADMAP': return 'accent';
            case 'PAPER': return 'neutral';
            default: return 'success';
        }
    };

    const getStatusBadge = (status) => {
        if (!status || status === 'APPROVED') return null; // Approved doesn't need a loud badge
        if (status === 'PENDING') return <Badge variant="warning">Under Review</Badge>;
        if (status === 'REJECTED') return <Badge variant="danger">Rejected</Badge>;
        return null;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Study Wing</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>
                        Curated roadmaps and resources for VISTA members. Contribute to earn points!
                    </p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Submit Resource
                </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
                {materials.map((mat) => {
                    const isOwnSubmission = mat.uploadedById === user?.id;
                    const opacity = mat.status === 'REJECTED' ? 0.6 : 1;

                    return (
                        <Card key={mat.id} hover={mat.status === 'APPROVED'} className="gsap-fade-up" style={{ opacity }}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: 'var(--c-surface-2)',
                                    borderRadius: 'var(--r-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {getCategoryIcon(mat.category)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', lineHeight: 1.3 }}>{mat.title}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        <Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge>
                                        {isOwnSubmission && getStatusBadge(mat.status)}
                                    </div>
                                </div>
                            </div>

                            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)', lineHeight: 1.6, flexGrow: 1 }}>
                                {mat.description}
                            </p>

                            {mat.status === 'REJECTED' && mat.rejectionReason && (
                                <div style={{ backgroundColor: 'rgba(248,81,73,0.1)', padding: '8px 12px', borderRadius: 'var(--r-md)', marginBottom: 'var(--space-md)', fontSize: '0.8rem', color: '#f85149', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <Info size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span><strong>Admin note:</strong> {mat.rejectionReason}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--c-border)' }}>
                                {mat.externalUrl && (
                                    <a href={mat.externalUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--c-text)', fontWeight: 500, textDecoration: 'none' }}>
                                        <LinkIcon size={16} /> Open Link
                                    </a>
                                )}
                                {mat.fileUrl && (
                                    <a href={mat.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--c-accent)', fontWeight: 500, textDecoration: 'none' }}>
                                        <Download size={16} /> Access File
                                    </a>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {materials.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text-muted)', backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
                    No study resources have been published yet. Be the first to contribute!
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Resource for Review">
                <div style={{ backgroundColor: 'rgba(212,197,169,0.06)', padding: 'var(--space-md)', borderRadius: 'var(--r-md)', marginBottom: 'var(--space-md)', border: '1px solid rgba(212,197,169,0.1)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--c-text-muted)' }}>
                        Submitted resources will be reviewed by an admin. If approved, you will earn points on the leaderboard!
                    </p>
                </div>

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
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '4px' }}>We do not host files directly. Paste a viewable link to Google Drive, Dropbox, etc.</p>
                    </div>
                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                        />
                    </div>
                    <Button type="submit" variant="primary" disabled={submitMutation.isPending} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                        {submitMutation.isPending ? 'Submitting...' : 'Submit Resource'}
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

export default StudyWing;
