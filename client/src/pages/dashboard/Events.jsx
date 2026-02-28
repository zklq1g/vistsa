import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Calendar as CalIcon, MapPin, Users } from 'lucide-react';

const Events = () => {
    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () => api.get('/events').then(res => res.data)
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Society Events</h1>
                <p style={{ color: 'var(--c-text-muted)' }}>Workshops, hackathons, and guest lectures.</p>
            </div>

            {isLoading ? (
                <div style={{ color: 'var(--c-text-muted)' }}>Loading events...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {events?.map((event) => {
                        const isUpcoming = new Date(event.eventDate) > new Date();

                        return (
                            <Card key={event.id} className="gsap-fade-up" hover={false}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{event.title}</h3>
                                        <div style={{ display: 'flex', gap: '16px', color: 'var(--c-text-muted)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <CalIcon size={16} /> {formatDate(event.eventDate)}
                                            </span>
                                            {event.location && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <MapPin size={16} /> {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Badge variant={isUpcoming ? 'accent' : 'neutral'}>
                                        {isUpcoming ? 'Upcoming' : 'Past Event'}
                                    </Badge>
                                </div>

                                <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
                                    {event.description}
                                </p>

                                <div style={{
                                    marginTop: 'var(--space-md)',
                                    paddingTop: 'var(--space-md)',
                                    borderTop: '1px solid var(--c-border)',
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    color: 'var(--c-text-muted)',
                                    fontSize: '0.875rem',
                                    gap: '8px'
                                }}>
                                    <Users size={16} /> Society Members Only
                                </div>
                            </Card>
                        );
                    })}

                    {events?.length === 0 && (
                        <div style={{ color: 'var(--c-text-muted)', padding: 'var(--space-xl) 0' }}>
                            No upcoming events scheduled.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Events;
