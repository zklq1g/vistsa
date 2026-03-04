import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { BookOpen, Video, FileText, Download, Link as LinkIcon, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';

const getCategoryIcon = (category) => {
    switch (category) {
        case 'ROADMAP': return <BookOpen size={24} color="var(--c-accent)" />;
        case 'TUTORIAL': return <Video size={24} color="var(--c-accent)" />;
        case 'PAPER': return <FileText size={24} color="var(--c-accent)" />;
        default: return <BookOpen size={24} color="var(--c-accent)" />;
    }
};

const getCategoryBadgeColor = (category) => {
    if (category === 'ROADMAP') return 'accent';
    if (category === 'PAPER') return 'neutral';
    return 'success';
};

const getStatusIcon = (status) => {
    if (status === 'APPROVED') return <CheckCircle2 size={14} color="#3fb950" />;
    if (status === 'REJECTED') return <XCircle size={14} color="#f85149" />;
    return <Clock size={14} color="#f0883e" />;
};

const getStatusColor = (status) => {
    if (status === 'APPROVED') return '#3fb950';
    if (status === 'REJECTED') return '#f85149';
    return '#f0883e';
};

const StudyWing = () => {
    const queryClient = useQueryClient();
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: ''
    });

    // Approved resources (all members see)
    const { data: materialsRes, isLoading } = useQuery({
        queryKey: ['study'],
        queryFn: () => api.get('/study').then(res => res.data)
    });

    // Member's own submissions with status
    const { data: myRes } = useQuery({
        queryKey: ['study-my'],
        queryFn: () => api.get('/study/my-submissions').then(res => res.data)
    });

    const materials = materialsRes?.data ?? materialsRes ?? [];
    const mySubmissions = myRes?.data ?? myRes ?? [];

    const submitMutation = useMutation({
        mutationFn: (data) => api.post('/study/submit', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['study-my']);
            toast.success('Resource submitted for review! Admin will approve it shortly.');
            setIsSubmitOpen(false);
            setFormData({ title: '', description: '', category: 'RESOURCE', externalUrl: '', fileUrl: '' });
        },
        onError: (err) => toast.error(err.message || 'Failed to submit resource')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return toast.error('Title is required');
        if (!formData.externalUrl && !formData.fileUrl) {
            return toast.error('Provide at least one link (External URL or File URL)');
        }
        submitMutation.mutate(formData);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Study Wing</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>
                        Curated roadmaps and resources for VISTA members. Complete these to level up.
                    </p>
                </div>
                <Button variant="primary" onClick={() => setIsSubmitOpen(true)}>
                    <Send size={16} /> Submit Resource
                </Button>
            </div>

            {/* ── APPROVED RESOURCES ───────────────────────────────── */}
            {isLoading ? (
                <div style={{ color: 'var(--c-text-muted)' }}>Loading study materials...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
                    {materials.map((mat) => (
                        <Card key={mat.id} hover={true}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                                <div style={{ padding: '12px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {getCategoryIcon(mat.category)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', lineHeight: 1.3 }}>{mat.title}</h3>
                                    <Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge>
                                </div>
                            </div>
                            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)', lineHeight: 1.6, flexGrow: 1 }}>
                                {mat.description}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--c-border)' }}>
                                {mat.externalUrl && (
                                    <a href={mat.externalUrl} target="_blank" rel="noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--c-text)', fontWeight: 500, textDecoration: 'none' }}>
                                        <LinkIcon size={16} /> Open Link
                                    </a>
                                )}
                                {mat.fileUrl && (
                                    <a href={mat.fileUrl} target="_blank" rel="noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--c-accent)', fontWeight: 500, textDecoration: 'none' }}>
                                        <Download size={16} /> Access File
                                    </a>
                                )}
                            </div>
                        </Card>
                    ))}

                    {materials.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text-muted)', backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', gridColumn: '1 / -1' }}>
                            No study resources have been published yet. Check back later!
                        </div>
                    )}
                </div>
            )}

            {/* ── MY SUBMISSIONS ──────────────────────────────────── */}
            {mySubmissions.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)', color: 'var(--c-text-muted)' }}>My Submissions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {mySubmissions.map((mat) => (
                            <div key={mat.id} style={{
                                display: 'flex', alignItems: 'center', gap: '16px',
                                padding: '14px 20px',
                                backgroundColor: 'var(--c-surface)',
                                border: '1px solid var(--c-border)',
                                borderRadius: 'var(--r-md)',
                                borderLeft: `3px solid ${getStatusColor(mat.status)}`,
                            }}>
                                {getStatusIcon(mat.status)}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>{mat.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>{mat.category}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: getStatusColor(mat.status), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {mat.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SUBMIT RESOURCE MODAL ─────────────────────────── */}
            <Modal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} title="Submit a Study Resource">
                <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                    Share a useful resource with the team. Admins will review and publish it.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={styles.label}>Title <span style={{ color: '#f85149' }}>*</span></label>
                        <input type="text" value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. CS231n: Deep Learning for Computer Vision" style={styles.input} />
                    </div>
                    <div>
                        <label style={styles.label}>Category</label>
                        <select value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })} style={styles.input}>
                            <option value="ROADMAP">Roadmap</option>
                            <option value="PAPER">Research Paper</option>
                            <option value="TUTORIAL">Tutorial</option>
                            <option value="RESOURCE">General Resource</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={styles.label}>External URL (YouTube, docs, article, etc)</label>
                        <input type="text" value={formData.externalUrl}
                            onChange={e => setFormData({ ...formData, externalUrl: e.target.value })}
                            placeholder="https://..." style={styles.input} />
                    </div>
                    <div>
                        <label style={styles.label}>File Link (Drive, PDF link, GitHub, etc)</label>
                        <input type="text" value={formData.fileUrl}
                            onChange={e => setFormData({ ...formData, fileUrl: e.target.value })}
                            placeholder="https://drive.google.com/..." style={styles.input} />
                    </div>
                    <div>
                        <label style={styles.label}>Description (Optional)</label>
                        <textarea value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What makes this resource useful?"
                            style={{ ...styles.input, minHeight: '72px', resize: 'vertical' }} />
                    </div>
                    <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={submitMutation.isPending} style={{ width: '100%' }}>
                            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
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
        width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
        backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text)',
        border: '1px solid var(--c-border)', fontFamily: 'var(--font-body)', outline: 'none'
    }
};

export default StudyWing;
