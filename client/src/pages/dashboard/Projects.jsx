import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import ProjectCard from '../../components/cards/ProjectCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import { ExternalLink, Github, Upload, X as XIcon } from 'lucide-react';

const DashboardHome = () => {
    const queryClient = useQueryClient();

    // ── Project list ────────────────────────────────────────────────────
    const [selectedProject, setSelectedProject] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects?approvedOnly=true').then(res => res.data)
    });
    const projects = response?.data ?? response ?? [];

    // ── Submit form state ────────────────────────────────────────────────
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        githubUrl: '',
        thumbnailUrl: '',
    });

    const resetForm = () => {
        setFormData({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '', thumbnailUrl: '' });
    };

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            return api.post('/projects', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['projects']);
            toast.success('Project submitted! Awaiting admin approval.', { duration: 4000 });
            setIsSubmitModalOpen(false);
            resetForm();
        },
        onError: (err) => toast.error(err.response?.data?.message || err.message || 'Failed to submit project')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.techStack) {
            return toast.error('Title, description, and tech stack are required.');
        }
        submitMutation.mutate({
            ...formData,
            techStack: formData.techStack.split(',').map(s => s.trim()),
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Projects</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Explore AI models and systems built by society members.</p>
                </div>
                <Button variant="accent" onClick={() => setIsSubmitModalOpen(true)}>
                    Submit Project
                </Button>
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--c-text-muted)' }}>Loading projects...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
                    ))}
                    {projects.length === 0 && (
                        <p style={{ color: 'var(--c-text-muted)', gridColumn: '1 / -1' }}>No approved projects yet.</p>
                    )}
                </div>
            )}

            {/* ── PROJECT DETAIL MODAL ─────────────────────────────── */}
            <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title ?? ''}>
                {selectedProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {selectedProject.thumbnailUrl && (
                            <img src={selectedProject.thumbnailUrl} alt="Project" style={{ width: '100%', maxHeight: '380px', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                        )}

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Badge variant={selectedProject.status === 'COMPLETED' ? 'success' : 'accent'}>{selectedProject.status}</Badge>
                            {selectedProject.isPinned && <Badge variant="neutral">⭐ Pinned</Badge>}
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Description</h4>
                            <p style={{ lineHeight: 1.7 }}>{selectedProject.description}</p>
                        </div>

                        {selectedProject.techStack && (
                            <div>
                                <h4 style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Tech Stack</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {selectedProject.techStack.split(',').map((t, i) => (
                                        <span key={i} style={{ padding: '4px 12px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-full)', fontSize: '0.875rem' }}>{t.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            {selectedProject.githubUrl ? (
                                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                                    <Button variant="secondary" style={{ cursor: 'pointer' }}><Github size={15} /> Source Code</Button>
                                </a>
                            ) : <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>GitHub link not provided.</span>}

                            {selectedProject.demoUrl ? (
                                <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer">
                                    <Button variant="primary" style={{ cursor: 'pointer' }}><ExternalLink size={15} /> Live Demo</Button>
                                </a>
                            ) : <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>Demo link not provided.</span>}
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── SUBMIT PROJECT MODAL ─────────────────────────────── */}
            <Modal isOpen={isSubmitModalOpen} onClose={() => { setIsSubmitModalOpen(false); resetForm(); }} title="Submit New Project">
                <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>
                    Share your work with VISTA. All submissions are reviewed by admins before appearing publicly.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={styles.label}>Project Title <span style={{ color: '#f85149' }}>*</span></label>
                        <input type="text" value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. YOLOv8 Custom Object Detector" style={styles.input} />
                    </div>

                    <div>
                        <label style={styles.label}>Description <span style={{ color: '#f85149' }}>*</span></label>
                        <textarea value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What does it do? How was it built?" rows={4}
                            style={{ ...styles.input, resize: 'vertical' }} />
                    </div>

                    <div>
                        <label style={styles.label}>Tech Stack <span style={{ color: '#f85149' }}>*</span></label>
                        <input type="text" value={formData.techStack}
                            onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                            placeholder="Python, PyTorch, FastAPI (comma-separated)" style={styles.input} />
                    </div>

                    {/* ── IMAGE URL ─── */}
                    <div>
                        <label style={styles.label}>Project Image URL (Optional)</label>
                        <input
                            type="text"
                            value={formData.thumbnailUrl}
                            onChange={e => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            placeholder="https://i.imgur.com/..."
                            style={styles.input}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '6px' }}>
                            We do not host files directly. Please upload your image to <a href="https://imgbb.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)' }}>ImgBB</a> or <a href="https://imgur.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--c-accent)' }}>Imgur</a> and paste the direct image link here.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>GitHub URL (Optional)</label>
                            <input type="url" value={formData.githubUrl}
                                onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                                placeholder="https://github.com/..." style={styles.input} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Live Demo URL (Optional)</label>
                            <input type="url" value={formData.demoUrl}
                                onChange={e => setFormData({ ...formData, demoUrl: e.target.value })}
                                placeholder="https://..." style={styles.input} />
                        </div>
                    </div>

                    <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="accent" disabled={submitMutation.isPending} style={{ width: '100%', cursor: 'pointer' }}>
                            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const styles = {
    label: { display: 'block', marginBottom: '6px', fontSize: '0.875rem' },
    input: {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 'var(--r-md)',
        backgroundColor: 'var(--c-surface-2)',
        color: 'var(--c-text)',
        border: '1px solid var(--c-border)',
        fontFamily: 'var(--font-body)',
        outline: 'none',
        cursor: 'text',
    }
};

export default DashboardHome;
