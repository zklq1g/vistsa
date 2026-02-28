import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const STAT_FIELDS = [
    { key: 'projectsCount', label: 'Projects Shipped', suffix: '+' },
    { key: 'bootcampsOrganized', label: 'Bootcamps Organized', suffix: 'x' },
    { key: 'activeMembers', label: 'Active Members', suffix: '+' },
    { key: 'societyMembers', label: 'Society Members', suffix: '' },
];

const AdminStats = () => {
    const queryClient = useQueryClient();

    const { data: rawStats, isLoading, isError } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.get('/stats');
            // Handle all response shapes: { data: { data: {...} } } or { data: {...} }
            const payload = res.data?.data ?? res.data;
            return payload;
        },
    });

    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        // If query finished (success or error) and formData is not set yet
        if (!isLoading && !formData) {
            setFormData({
                projectsCount: rawStats?.projectsCount ?? 0,
                bootcampsOrganized: rawStats?.bootcampsOrganized ?? 0,
                activeMembers: rawStats?.activeMembers ?? 0,
                societyMembers: rawStats?.societyMembers ?? 0,
            });
        }
    }, [isLoading, rawStats, formData]);

    const updateMutation = useMutation({
        mutationFn: (data) => api.patch('/stats', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-stats']);
            toast.success('Homepage stats updated!');
        },
        onError: (err) => toast.error(err.message || 'Failed to update stats'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate({
            projectsCount: Number(formData.projectsCount),
            bootcampsOrganized: Number(formData.bootcampsOrganized),
            activeMembers: Number(formData.activeMembers),
            societyMembers: Number(formData.societyMembers),
        });
    };

    if (isLoading || !formData) return <div style={{ color: 'var(--c-text-muted)' }}>Loading stats...</div>;

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Homepage Stats</h1>
                <p style={{ color: 'var(--c-text-muted)' }}>
                    Edit the counters that appear on the public homepage. Changes reflect immediately on save.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
                <div style={{
                    backgroundColor: 'var(--c-surface)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    marginBottom: 'var(--space-xl)',
                }}>
                    {STAT_FIELDS.map((field, i) => (
                        <div key={field.key} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 140px',
                            padding: '20px 24px',
                            borderBottom: i < STAT_FIELDS.length - 1 ? '1px solid var(--c-border)' : 'none',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '2px' }}>{field.label}</div>
                                <div style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                                    Displays as: <strong>{formData[field.key]}{field.suffix}</strong>
                                </div>
                            </div>
                            <input
                                type="number"
                                min="0"
                                value={formData[field.key]}
                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--r-md)',
                                    backgroundColor: 'var(--c-surface-2)',
                                    color: 'var(--c-text)',
                                    border: '1px solid var(--c-border)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    outline: 'none',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <Button type="submit" variant="primary" disabled={updateMutation.isPending} style={{ width: '100%' }}>
                    {updateMutation.isPending ? 'Saving...' : 'Save & Publish Changes'}
                </Button>
            </form>
        </div>
    );
};

export default AdminStats;
