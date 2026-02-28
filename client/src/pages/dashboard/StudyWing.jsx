import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { BookOpen, Video, FileText, Download, Link as LinkIcon } from 'lucide-react';

const StudyWing = () => {
    // Fetch actual study resources uploaded by admin
    const { data: response, isLoading } = useQuery({
        queryKey: ['study'],
        queryFn: () => api.get('/study').then(res => res.data)
    });

    const materials = response?.data ?? response ?? [];

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

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Study Wing</h1>
                <p style={{ color: 'var(--c-text-muted)' }}>
                    Curated roadmaps and resources for VISTA members. Complete these to level up.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
                {materials.map((mat) => (
                    <Card key={mat.id} hover={true} className="gsap-fade-up">
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
                                <Badge variant={getCategoryBadgeColor(mat.category)}>{mat.category}</Badge>
                            </div>
                        </div>

                        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--space-md)', lineHeight: 1.6, flexGrow: 1 }}>
                            {mat.description}
                        </p>

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
                ))}
            </div>

            {materials.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--c-text-muted)', backgroundColor: 'var(--c-surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)' }}>
                    No study resources have been published yet. Check back later!
                </div>
            )}
        </div>
    );
};

export default StudyWing;
