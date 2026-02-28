import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { ArrowLeft, ExternalLink, Github, Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const PublicProjects = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [search, setSearch] = useState('');

    const { data: response, isLoading } = useQuery({
        queryKey: ['public-projects'],
        queryFn: () => api.get('/projects').then(res => res.data),
    });

    const projects = response?.data ?? response ?? [];

    const filtered = projects.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.techStack?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--c-bg)',
            padding: 'var(--space-xl)',
        }}>
            {/* Header */}
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <Link to="/">
                        <Button variant="ghost" size="sm"><ArrowLeft size={16} /> Home</Button>
                    </Link>
                </div>

                <div style={{ marginBottom: 'var(--space-2xl)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', marginBottom: 'var(--space-md)' }}>
                        VISTA / PROJECTS
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: 'var(--space-md)' }}>
                        Our Work
                    </h1>
                    <p style={{ color: 'var(--c-text-muted)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.7 }}>
                        Real AI systems and research built by VISTA members. Approved and curated by our technical team.
                    </p>
                </div>

                {/* Search */}
                <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '440px' }}>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search projects or tech stack..."
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 'var(--r-md)',
                            backgroundColor: 'var(--c-surface)',
                            color: 'var(--c-text)',
                            border: '1px solid var(--c-border)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.95rem',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div style={{ color: 'var(--c-text-muted)', padding: 'var(--space-xl) 0' }}>Loading projects...</div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        padding: 'var(--space-2xl)',
                        textAlign: 'center',
                        border: '1px dashed var(--c-border)',
                        borderRadius: 'var(--r-lg)',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🔭</div>
                        <h3 style={{ marginBottom: '8px' }}>
                            {search ? 'No projects match your search' : 'No approved projects yet'}
                        </h3>
                        <p style={{ color: 'var(--c-text-muted)' }}>
                            {search ? 'Try a different keyword.' : 'Check back soon — our members are building.'}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: 'var(--space-md)',
                        }}
                    >
                        {filtered.map(project => (
                            <motion.div
                                key={project.id}
                                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
                                onClick={() => setSelectedProject(project)}
                                style={{
                                    backgroundColor: 'var(--c-surface)',
                                    border: '1px solid var(--c-border)',
                                    borderRadius: 'var(--r-lg)',
                                    padding: 'var(--space-lg)',
                                    cursor: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--space-sm)',
                                    transition: 'border-color 0.3s, transform 0.3s',
                                }}
                                whileHover={{ borderColor: 'var(--c-accent)', y: -4 }}
                            >
                                {project.thumbnailUrl && (
                                    <img
                                        src={project.thumbnailUrl}
                                        alt={project.title}
                                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: '4px' }}
                                    />
                                )}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                    <h3 style={{ fontSize: '1.15rem', lineHeight: 1.3 }}>{project.title}</h3>
                                    <Badge variant={project.status === 'COMPLETED' ? 'success' : 'neutral'} style={{ flexShrink: 0 }}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {project.description}
                                </p>
                                {project.techStack && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                                        {project.techStack.split(',').slice(0, 4).map((t, i) => (
                                            <span key={i} style={{ padding: '3px 10px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-full)', fontSize: '0.78rem', color: 'var(--c-text-muted)' }}>
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--c-text-muted)', fontSize: '0.8rem' }}>
                                    <Calendar size={12} />
                                    {project.submittedBy?.displayName || 'VISTA Member'}
                                    <span>·</span>
                                    {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Bottom CTA */}
                {!isLoading && (
                    <div style={{ marginTop: 'var(--space-2xl)', textAlign: 'center', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--space-xl)' }}>
                        <p style={{ color: 'var(--c-text-muted)', marginBottom: 'var(--space-md)' }}>
                            Are you a VISTA member? Submit your work for review.
                        </p>
                        <Link to="/login">
                            <Button variant="primary">Member Login & Submit</Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Project Detail Modal */}
            <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.title}>
                {selectedProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {selectedProject.thumbnailUrl && (
                            <img src={selectedProject.thumbnailUrl} alt="thumbnail" style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: 'var(--r-md)' }} />
                        )}
                        <div>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Description</h4>
                            <p style={{ lineHeight: 1.7 }}>{selectedProject.description}</p>
                        </div>
                        {selectedProject.techStack && (
                            <div>
                                <h4 style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Tech Stack</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {selectedProject.techStack.split(',').map((t, i) => (
                                        <span key={i} style={{ padding: '4px 12px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-full)', fontSize: '0.875rem' }}>{t.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            {selectedProject.githubUrl && (
                                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer">
                                    <Button variant="secondary"><Github size={16} /> Source Code</Button>
                                </a>
                            )}
                            {selectedProject.demoUrl && (
                                <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer">
                                    <Button variant="primary"><ExternalLink size={16} /> Live Demo</Button>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PublicProjects;
