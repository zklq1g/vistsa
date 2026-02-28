import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Check, X, ExternalLink, Github, Pin, Eye, Calendar, User } from 'lucide-react';

const AdminApprovalQueue = () => {
    const queryClient = useQueryClient();
    const [selectedProject, setSelectedProject] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['admin-projects'],
        queryFn: () => api.get('/projects?approvedOnly=false').then(res => res.data)
    });

    const projects = response?.data ?? response ?? [];

    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/projects/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-projects']);
            toast.success('Project approved and is now public.');
            setSelectedProject(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/projects/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-projects']);
            toast.success('Project permanently deleted.');
            setSelectedProject(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
    });

    const pinMutation = useMutation({
        mutationFn: (id) => api.patch(`/projects/${id}/pin`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-projects']);
            toast.success('Pin status toggled.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to pin')
    });

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading projects...</div>;

    const pendingProjects = projects.filter(p => !p.isApproved);
    const approvedProjects = projects.filter(p => p.isApproved);

    const ProjectRow = ({ proj, isPending }) => (
        <div style={{
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            padding: 'var(--space-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-lg)',
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{proj.title}</h3>
                    {proj.isPinned && <Badge variant="accent"><Pin size={11} style={{ marginRight: 3 }} />Pinned</Badge>}
                    {!isPending && <Badge variant="neutral">{proj.status}</Badge>}
                </div>
                <p style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    By: {proj.submittedBy?.displayName ?? 'Unknown'} · {new Date(proj.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)', cursor: 'pointer' }}><Github size={15} /></a>}
                    {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--c-text-muted)', cursor: 'pointer' }}><ExternalLink size={15} /></a>}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                {/* View button always visible */}
                <Button variant="ghost" size="sm" onClick={() => setSelectedProject(proj)}>
                    <Eye size={15} /> View
                </Button>

                {isPending ? (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => {
                            if (window.confirm('Delete this submission permanently?')) deleteMutation.mutate(proj.id);
                        }} disabled={deleteMutation.isPending}>
                            <X size={16} color="#f85149" />
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => approveMutation.mutate(proj.id)} disabled={approveMutation.isPending}>
                            <Check size={16} /> Approve
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="secondary" size="sm" onClick={() => pinMutation.mutate(proj.id)} disabled={pinMutation.isPending}>
                            {proj.isPinned ? 'Unpin' : 'Pin'}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            if (window.confirm('Delete this project permanently?')) deleteMutation.mutate(proj.id);
                        }} disabled={deleteMutation.isPending}>
                            <X size={16} color="#f85149" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Approval Queue</h1>
            <p style={{ color: 'var(--c-text-muted)', marginBottom: 'var(--space-xl)' }}>
                Click <strong>View</strong> to inspect a project fully before deciding.
            </p>

            <section style={{ marginBottom: 'var(--space-2xl)' }}>
                <h2 style={{ fontSize: '1.15rem', color: 'var(--c-accent)', marginBottom: 'var(--space-md)', paddingBottom: '8px', borderBottom: '1px solid var(--c-border)' }}>
                    Pending Approval ({pendingProjects.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {pendingProjects.map(p => <ProjectRow key={p.id} proj={p} isPending />)}
                    {pendingProjects.length === 0 && <p style={{ color: 'var(--c-text-muted)' }}>No pending submissions.</p>}
                </div>
            </section>

            <section>
                <h2 style={{ fontSize: '1.15rem', color: 'var(--c-text-muted)', marginBottom: 'var(--space-md)', paddingBottom: '8px', borderBottom: '1px solid var(--c-border)' }}>
                    Manage Approved ({approvedProjects.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {approvedProjects.map(p => <ProjectRow key={p.id} proj={p} isPending={false} />)}
                    {approvedProjects.length === 0 && <p style={{ color: 'var(--c-text-muted)' }}>No approved projects yet.</p>}
                </div>
            </section>

            {/* PROJECT DETAIL MODAL */}
            <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title ?? ''}>
                {selectedProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                        {selectedProject.thumbnailUrl && (
                            <img src={selectedProject.thumbnailUrl} alt="thumbnail"
                                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                        )}

                        {/* Meta info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
                                <User size={14} />
                                <span>{selectedProject.submittedBy?.displayName ?? 'Unknown'} (@{selectedProject.submittedBy?.username})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
                                <Calendar size={14} />
                                <span>{new Date(selectedProject.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', marginBottom: '8px' }}>Description</h4>
                            <p style={{ lineHeight: 1.7 }}>{selectedProject.description}</p>
                        </div>

                        {selectedProject.techStack && (
                            <div>
                                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-text-muted)', marginBottom: '8px' }}>Tech Stack</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {selectedProject.techStack.split(',').map((t, i) => (
                                        <span key={i} style={{ padding: '4px 12px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-full)', fontSize: '0.875rem' }}>{t.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            {selectedProject.githubUrl ? (
                                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                                    <Button variant="secondary" style={{ cursor: 'pointer' }}><Github size={15} /> Source Code</Button>
                                </a>
                            ) : <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>No GitHub link provided.</span>}
                            {selectedProject.demoUrl ? (
                                <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer">
                                    <Button variant="secondary" style={{ cursor: 'pointer' }}><ExternalLink size={15} /> Live Demo</Button>
                                </a>
                            ) : <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem' }}>No demo link provided.</span>}
                        </div>

                        {/* Action buttons in modal */}
                        {!selectedProject.isApproved && (
                            <div style={{ display: 'flex', gap: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                                <Button
                                    variant="ghost"
                                    onClick={() => { if (window.confirm('Delete permanently?')) deleteMutation.mutate(selectedProject.id); }}
                                    disabled={deleteMutation.isPending}
                                    style={{ borderColor: '#f85149', color: '#f85149', cursor: 'pointer' }}
                                >
                                    <X size={16} /> Reject & Delete
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => approveMutation.mutate(selectedProject.id)}
                                    disabled={approveMutation.isPending}
                                    style={{ flex: 1, cursor: 'pointer' }}
                                >
                                    <Check size={16} /> {approveMutation.isPending ? 'Approving...' : 'Approve & Publish'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminApprovalQueue;
