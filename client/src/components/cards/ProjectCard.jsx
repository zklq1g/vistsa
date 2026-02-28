import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem } from '../../motion/variants';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ExternalLink, Github } from 'lucide-react';

const ProjectCard = ({ project, onClick }) => {
    return (
        <Card
            className="gsap-fade-up"
            onClick={() => onClick(project)}
        >
            <motion.div variants={staggerItem} style={{ width: '100%' }}>

                {/* Thumbnail Placeholder (if no image) */}
                <div style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: 'var(--c-surface-2)',
                    borderRadius: 'var(--r-sm)',
                    marginBottom: 'var(--space-md)',
                    backgroundImage: project.thumbnailUrl ? `url(${project.thumbnailUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--c-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {!project.thumbnailUrl && <span style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>No Image</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{project.title}</h3>
                    <Badge variant={
                        project.status === 'COMPLETED' ? 'success' :
                            project.status === 'ONGOING' ? 'accent' : 'neutral'
                    }>
                        {project.status}
                    </Badge>
                </div>

                <p style={{
                    color: 'var(--c-text-muted)',
                    fontSize: '0.875rem',
                    marginBottom: 'var(--space-md)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {project.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-md)' }}>
                    {project.techStack?.split(',').map((tech, i) => (
                        <span key={i} style={{
                            fontSize: '0.75rem',
                            color: 'var(--c-accent)',
                            backgroundColor: 'var(--c-glow)',
                            padding: '2px 8px',
                            borderRadius: '4px'
                        }}>
                            {tech.trim()}
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--c-text-muted)' }}>
                            <Github size={18} />
                        </a>
                    )}
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--c-text-muted)' }}>
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>

            </motion.div>
        </Card >
    );
};

export default ProjectCard;
