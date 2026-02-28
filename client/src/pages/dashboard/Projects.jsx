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
    const fileInputRef = useRef(null);

    // ── Project list ────────────────────────────────────────────────────
    const [selectedProject, setSelectedProject] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => api.get('/projects?approvedOnly=true').then(res => res.data)
    });
    const projects = response?.data ?? response ?? [];

    // ── Submit form state ────────────────────────────────────────────────
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        githubUrl: '',
        demoUrl: '',
    });

    const resetForm = () => {
        setFormData({ title: '', description: '', techStack: '', githubUrl: '', demoUrl: '' });
        setImagePreview(null);
        setImageFile(null);
    };

    // Handle image selection, validate + generate preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Only JPG, PNG, or WEBP images are accepted.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be under 5 MB.');
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            // If an image file is selected, encode it as a base64 data URL
            // and store it as thumbnailUrl (simple localStorage-friendly approach
            // that avoids requiring a file-upload server)
            let thumbnailUrl = null;
            if (imageFile) {
                thumbnailUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = ev => resolve(ev.target.result);
                    reader.readAsDataURL(imageFile);
                });
            }
            return api.post('/projects', { ...data, thumbnailUrl });
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

                    {/* ── IMAGE UPLOAD ─── */}
                    <div>
                        <label style={styles.label}>Project Image (Optional — JPG, PNG, WEBP, max 5 MB)</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        {imagePreview ? (
                            <div style={{ position: 'relative' }}>
                                <img src={imagePreview} alt="preview"
                                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }} />
                                <button
                                    type="button"
                                    onClick={() => { setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <XIcon size={14} color="white" />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{ border: '2px dashed var(--c-border)', borderRadius: 'var(--r-md)', padding: '32px', textAlign: 'center', cursor: 'pointer', color: 'var(--c-text-muted)', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--c-accent)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--c-border)'}
                            >
                                <Upload size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>Click to upload project image</p>
                            </div>
                        )}
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
