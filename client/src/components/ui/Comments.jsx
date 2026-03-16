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
    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', projectId],
        queryFn: () => api.get(`/comments/project/${projectId}`).then(res => res.data),
    });

    // Add comment mutation
    const addMutation = useMutation({
        mutationFn: (newComment) => api.post(`/comments/project/${projectId}`, newComment),
        onSuccess: () => {
            setContent('');
            queryClient.invalidateQueries(['comments', projectId]);
            toast.success('Comment posted!');
        },
        onError: (err) => toast.error(err.message || 'Failed to post comment'),
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
        e.preventDefault();
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
            marginTop: 'var(--space-10)', 
            borderTop: '1px solid var(--c-border)', 
            paddingTop: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-2)' }}>
                <div style={{ 
                    padding: 8, 
                    borderRadius: 'var(--r-md)', 
                    backgroundColor: 'var(--c-accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <MessageSquare size={18} color="var(--c-accent)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em' }}>Discussion ({comments?.length || 0})</h3>
            </div>

            {/* Input Section */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit}>
                    <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-4)', 
                        backgroundColor: 'var(--c-surface-2)', 
                        padding: 'var(--space-4)', 
                        borderRadius: 'var(--r-xl)',
                        border: '1px solid var(--c-border)',
                        transition: 'border-color var(--t-base)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ 
                            width: 44, height: 44, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            border: '1px solid var(--c-border)'
                        }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : <UserIcon size={22} color="var(--c-text-dim)" />}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Add to the discussion..."
                                style={{ 
                                    width: '100%', background: 'transparent', border: 'none', outline: 'none', 
                                    color: 'var(--c-text)', resize: 'none', minHeight: 80, fontSize: '0.975rem',
                                    fontFamily: 'inherit', padding: '4px 0', lineHeight: 1.5
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-2)' }}>
                                <Button 
                                    size="sm" 
                                    variant="accent" 
                                    icon={<Send size={14} />} 
                                    loading={addMutation.isPending}
                                    disabled={!content.trim()}
                                    style={{ borderRadius: 'var(--r-lg)', padding: '8px 20px' }}
                                >
                                    Post Comment
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div style={{ 
                    padding: 'var(--space-8)', 
                    borderRadius: 'var(--r-xl)', 
                    backgroundColor: 'rgba(var(--c-accent-rgb), 0.03)', 
                    textAlign: 'center', 
                    border: '1px dashed var(--c-accent-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <LogIn size={24} color="var(--c-accent)" style={{ opacity: 0.6 }} />
                    <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9375rem' }}>
                        Please <Link to="/login" style={{ color: 'var(--c-accent)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>log in</Link> to join the discussion.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--c-text-dim)', padding: 'var(--space-10)' }}>
                        <div className="skeleton" style={{ width: 100, height: 20, margin: '0 auto 12px', borderRadius: 4 }} />
                        <p style={{ fontSize: '0.875rem' }}>Loading discussion...</p>
                    </div>
                ) : comments?.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        color: 'var(--c-text-muted)', 
                        padding: 'var(--space-12) var(--space-4)',
                        backgroundColor: 'var(--c-surface-1)',
                        borderRadius: 'var(--r-xl)',
                        border: '1px solid var(--c-border)'
                    }}>
                        <MessageSquare size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p style={{ fontWeight: 500 }}>No comments yet.</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment) => (
                            <motion.div 
                                key={comment.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                style={{ 
                                    display: 'flex', 
                                    gap: 'var(--space-5)', 
                                    padding: 'var(--space-5)', 
                                    borderRadius: 'var(--r-lg)',
                                    backgroundColor: 'var(--c-surface-1)',
                                    border: '1px solid var(--c-border)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    border: '1px solid var(--c-border)'
                                }}>
                                    {comment.user?.avatarUrl ? (
                                        <img src={comment.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <UserIcon size={20} color="var(--c-text-dim)" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--c-text)' }}>
                                                {comment.user?.displayName || 'Unknown Member'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                color: 'var(--c-text-dim)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 6,
                                                backgroundColor: 'var(--c-surface-2)',
                                                padding: '4px 10px',
                                                borderRadius: 'var(--r-full)',
                                                border: '1px solid var(--c-border)'
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
                                                        opacity: 0.6, 
                                                        cursor: 'pointer',
                                                        borderRadius: 'var(--r-md)',
                                                        backgroundColor: 'rgba(var(--c-danger-rgb), 0.05)',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                    className="delete-comment-btn"
                                                    title="Delete comment"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ 
                                        lineHeight: 1.6, 
                                        fontSize: '0.9375rem', 
                                        color: 'var(--c-text-muted)', 
                                        whiteSpace: 'pre-line',
                                        letterSpacing: '0.01em'
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
