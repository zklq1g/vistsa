import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, User as UserIcon, Clock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';
import toast from 'react-hot-toast';


const Comments = ({ projectId }) => {
    const [content, setContent] = useState('');
    const { user, isLoggedIn } = useAuthStore();
    const queryClient = useQueryClient();

    // Fetch comments
    const { data: response, isLoading } = useQuery({
        queryKey: ['comments', projectId],
        queryFn: () => api.get(`/comments/project/${projectId}`),
        enabled: !!projectId
    });

    const comments = response?.data || [];

    // Add comment mutation
    const addMutation = useMutation({
        mutationFn: (newComment) => {
            return api.post(`/comments/project/${projectId}`, newComment);
        },
        onSuccess: (res) => {
            setContent('');
            queryClient.invalidateQueries(['comments', projectId]);
            toast.success('Comment posted!');
        },
    });

    // Delete comment mutation
    const deleteMutation = useMutation({
        mutationFn: (commentId) => api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', projectId]);
            toast.success('Comment deleted');
        },
    });

    const handleSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (!isLoggedIn) {
            toast.error('Please log in to comment');
            return;
        }

        if (!projectId) {
            toast.error('Project ID error. Try refreshing.');
            return;
        }

        if (!content.trim()) return;

        addMutation.mutate({ content });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffYears = now.getFullYear() - date.getFullYear();
        
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateOptions = { day: '2-digit', month: 'short' };
        if (diffYears >= 1) {
            dateOptions.year = 'numeric';
        }
        
        const datePart = date.toLocaleDateString(undefined, dateOptions);
        return `${datePart} • ${timeStr}`;
    };

    return (
        <div style={{ 
            marginTop: 'var(--space-12)', 
            paddingTop: 'var(--space-10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        padding: 10, 
                        borderRadius: 'var(--r-lg)', 
                        backgroundColor: 'rgba(var(--c-accent-rgb), 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MessageSquare size={20} color="var(--c-accent)" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Discussion</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', margin: 0 }}>{comments?.length || 0} thought{comments?.length !== 1 ? 's' : ''} shared</p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => queryClient.invalidateQueries(['comments', projectId])}
                    style={{ fontSize: '0.7rem', opacity: 0.5 }}
                >
                    Refresh
                </Button>
            </div>

            {/* Input Section */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                    <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-5)', 
                        backgroundColor: 'var(--c-surface)', 
                        padding: 'var(--space-5)', 
                        borderRadius: 'var(--r-2xl)',
                        border: '1px solid var(--c-border)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}>
                        <div style={{ 
                            width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            border: '2px solid var(--c-bg)',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserIcon size={24} color="var(--c-text-dim)" />}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your thoughts or questions..."
                                style={{ 
                                    width: '100%', background: 'transparent', border: 'none', outline: 'none', 
                                    color: 'var(--c-text)', resize: 'none', minHeight: 90, fontSize: '1rem',
                                    fontFamily: 'inherit', padding: '4px 0', lineHeight: 1.6
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--c-border-subtle)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--c-text-dim)' }}>
                                    Markdown supported • Be respectful
                                </span>
                                {addMutation.isPending ? (
                                    <div style={{ color: 'var(--c-accent)', fontSize: '0.9rem' }}>Posting...</div>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleSubmit}
                                        style={{ 
                                            borderRadius: 'var(--r-xl)', 
                                            padding: '10px 24px', 
                                            backgroundColor: 'var(--c-accent)', 
                                            color: 'white', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            zIndex: 10 // Ensure it's above any subtle overlays
                                        }}
                                        disabled={!content.trim() || addMutation.isPending}
                                    >
                                        <Send size={16} /> Post Comment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div style={{ 
                    padding: 'var(--space-10)', 
                    borderRadius: 'var(--r-2xl)', 
                    backgroundColor: 'rgba(var(--c-accent-rgb), 0.02)', 
                    textAlign: 'center', 
                    border: '1px dashed var(--c-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 16
                }}>
                    <div style={{ 
                        width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--c-surface-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8
                    }}>
                        <LogIn size={28} color="var(--c-accent)" />
                    </div>
                    <p style={{ color: 'var(--c-text)', fontSize: '1.05rem', fontWeight: 500, margin: 0 }}>Join the conversation</p>
                    <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>
                        You need to <Link to="/login" style={{ color: 'var(--c-accent)', fontWeight: 600, textDecoration: 'none' }}>log in</Link> to post a comment.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 'var(--space-8)' }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{ display: 'flex', gap: 16, opacity: 0.5 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--c-surface-2)' }} className="skeleton" />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ width: 140, height: 16, borderRadius: 4, backgroundColor: 'var(--c-surface-2)' }} className="skeleton" />
                                    <div style={{ width: '100%', height: 60, borderRadius: 8, backgroundColor: 'var(--c-surface-2)' }} className="skeleton" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments?.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: 'var(--c-text-muted)', 
                        padding: 'var(--space-16) var(--space-4)',
                        backgroundColor: 'var(--c-surface)',
                        borderRadius: 'var(--r-2xl)',
                        border: '1px solid var(--c-border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                    }}>
                        <MessageSquare size={40} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
                        <p style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '1.1rem', marginBottom: 4 }}>No comments yet</p>
                        <p style={{ fontSize: '0.9375rem', opacity: 0.6 }}>Be the first to share your perspective on this project.</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment) => (
                            <motion.div 
                                key={comment.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ 
                                    display: 'flex', 
                                    gap: 'var(--space-5)', 
                                    padding: 'var(--space-6)', 
                                    borderRadius: 'var(--r-2xl)',
                                    backgroundColor: 'var(--c-surface)',
                                    border: '1px solid var(--c-border)',
                                    position: 'relative',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                <div style={{ 
                                    width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    border: '1px solid var(--c-border)', overflow: 'hidden'
                                }}>
                                    {comment.user?.avatarUrl ? (
                                        <img src={comment.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <UserIcon size={22} color="var(--c-text-dim)" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--c-text)' }}>
                                                {comment.user?.displayName || 'Unknown Member'}
                                            </span>
                                            {((user?.role || '').toUpperCase() === 'ADMIN') && (
                                                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 'var(--r-full)', backgroundColor: 'rgba(var(--c-accent-rgb), 0.1)', color: 'var(--c-accent)', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ 
                                                fontSize: '0.725rem', 
                                                color: 'var(--c-text-dim)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 6,
                                                fontWeight: 500
                                            }}>
                                                <Clock size={12} /> {formatDate(comment.createdAt)}
                                            </span>
                                            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                                                <button 
                                                    onClick={() => { if(window.confirm('Delete this comment?')) deleteMutation.mutate(comment.id) }} 
                                                    disabled={deleteMutation.isPending}
                                                    style={{ 
                                                        color: 'var(--c-danger)', 
                                                        padding: 6, 
                                                        opacity: 0.4, 
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--r-md)',
                                                        backgroundColor: 'transparent',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        border: 'none',
                                                        outline: 'none'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                                                    title="Delete comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ 
                                        lineHeight: 1.6, 
                                        fontSize: '1rem', 
                                        color: 'var(--c-text)', 
                                        whiteSpace: 'pre-line',
                                        margin: 0
                                    }}>
                                        {comment.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Comments;
