import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, User as UserIcon, Clock } from 'lucide-react';
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
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={{ marginTop: 'var(--space-8)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-6)' }}>
                <MessageSquare size={20} color="var(--c-accent)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Discussion ({comments?.length || 0})</h3>
            </div>

            {/* Input Section */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--space-8)' }}>
                    <div style={{ 
                        display: 'flex', 
                        gap: 'var(--space-4)', 
                        backgroundColor: 'var(--c-surface-2)', 
                        padding: 'var(--space-4)', 
                        borderRadius: 'var(--r-lg)',
                        border: '1px solid var(--c-border)'
                    }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <UserIcon size={20} color="var(--c-text-dim)" />}
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Add to the discussion..."
                                style={{ 
                                    width: '100%', background: 'transparent', border: 'none', outline: 'none', 
                                    color: 'var(--c-text)', resize: 'none', minHeight: 80, fontSize: '0.9375rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    size="sm" 
                                    variant="accent" 
                                    icon={<Send size={14} />} 
                                    loading={addMutation.isPending}
                                    disabled={!content.trim()}
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div style={{ 
                    padding: 'var(--space-6)', borderRadius: 'var(--r-md)', backgroundColor: 'var(--c-surface-2)', 
                    textAlign: 'center', marginBottom: 'var(--space-8)', border: '1px dashed var(--c-border)'
                }}>
                    <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>Please log in to join the discussion.</p>
                </div>
            )}

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: 'var(--c-text-dim)', padding: 'var(--space-8)' }}>Loading comments...</div>
                ) : comments?.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--c-text-dim)', padding: 'var(--space-8)' }}>No comments yet. Be the first!</div>
                ) : (
                    <AnimatePresence initial={false}>
                        {comments.map((comment) => (
                            <motion.div 
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                style={{ 
                                    display: 'flex', gap: 'var(--space-4)', paddingBottom: 'var(--space-6)', 
                                    borderBottom: '1px solid var(--c-border)'
                                }}
                            >
                                <div style={{ 
                                    width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--c-surface-3)', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                                }}>
                                    {comment.user?.avatarUrl ? <img src={comment.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : <UserIcon size={18} color="var(--c-text-dim)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{comment.user?.displayName || 'Unknown Member'}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--c-text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={12} /> {formatDate(comment.createdAt)}
                                            </span>
                                            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                                                <button 
                                                    onClick={() => deleteMutation.mutate(comment.id)} 
                                                    disabled={deleteMutation.isPending}
                                                    style={{ color: 'var(--c-danger)', padding: 4, opacity: 0.6, cursor: 'pointer' }}
                                                    title="Delete comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p style={{ lineHeight: 1.6, fontSize: '0.9375rem', color: 'var(--c-text-muted)', whiteSpace: 'pre-line' }}>
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
