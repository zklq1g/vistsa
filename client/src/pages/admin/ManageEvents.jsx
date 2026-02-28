import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { CalendarPlus, Trash2, MapPin } from 'lucide-react';

const AdminEvents = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventDate: '',
        location: '',
        isPublished: true
    });

    const { data: events, isLoading } = useQuery({
        queryKey: ['admin-events'],
        queryFn: () => api.get('/events').then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/events', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            toast.success('Event scheduled successfully.');
            setIsModalOpen(false);
            setFormData({ title: '', description: '', eventDate: '', location: '', isPublished: true });
        },
        onError: (err) => toast.error(err.message || 'Failed to schedule event')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/events/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            toast.success('Event cancelled.');
        },
        onError: (err) => toast.error(err.message || 'Failed to cancel event')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.eventDate) {
            return toast.error('Title and Date are required');
        }

        try {
            const payload = {
                ...formData,
                eventDate: new Date(formData.eventDate).toISOString()
            };
            createMutation.mutate(payload);
        } catch (err) {
            toast.error("Invalid date format detected.");
        }
    };

    if (isLoading) return <div style={{ color: 'var(--c-text-muted)' }}>Loading events...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Events</h1>
                    <p style={{ color: 'var(--c-text-muted)' }}>Schedule hackathons, workshops, and guest lectures.</p>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <CalendarPlus size={18} /> Schedule Event
                </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {events?.map((event) => (
                    <div key={event.id} style={{
                        backgroundColor: 'var(--c-surface)',
                        border: '1px solid var(--c-border)',
                        borderRadius: 'var(--r-md)',
                        padding: 'var(--space-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{event.title}</h3>
                                <Badge variant={new Date(event.eventDate) > new Date() ? 'accent' : 'neutral'}>
                                    {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past'}
                                </Badge>
                            </div>
                            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                {event.location && <span style={{ marginLeft: '12px' }}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {event.location}</span>}
                            </p>
                            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
                                {event.description}
                            </p>
                        </div>

                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('Delete this event?')) deleteMutation.mutate(event.id);
                                }}
                            >
                                <Trash2 size={16} color="#f85149" />
                            </Button>
                        </div>
                    </div>
                ))}

                {events?.length === 0 && (
                    <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                        No events found.
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule New Event">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div>
                        <label style={styles.label}>Event Title <span style={{ color: '#f85149' }}>*</span></label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Intro to Neural Networks Workshop"
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Date & Time <span style={{ color: '#f85149' }}>*</span></label>
                        <input
                            type="datetime-local"
                            value={formData.eventDate}
                            onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. LAB 305 or Zoom Link"
                            style={styles.input}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)' }}>
                        <Button type="submit" variant="primary" disabled={createMutation.isPending} style={{ width: '100%' }}>
                            {createMutation.isPending ? 'Scheduling...' : 'Publish Event'}
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

export default AdminEvents;
