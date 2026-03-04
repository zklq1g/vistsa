import React, { useState } from 'react';
import { useErrorStore } from '../../store/errorStore';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const GlobalErrorModal = () => {
    const { isOpen, errorData, hideError } = useErrorStore();
    const [showDetails, setShowDetails] = useState(false);

    if (!isOpen || !errorData) return null;

    const handleClose = () => {
        hideError();
        setShowDetails(false); // Reset for next time
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f85149' }}><AlertCircle size={20} /> Error Processing Request</span>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Main Error Message */}
                <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.2)', padding: 'var(--space-md)', borderRadius: 'var(--r-md)' }}>
                    <p style={{ margin: 0, fontSize: '1rem', color: '#f85149', fontWeight: 500, lineHeight: 1.5 }}>
                        {errorData.message}
                    </p>
                </div>

                {/* Status Code & Endpoint */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {errorData.status && (
                        <div style={{ padding: '4px 10px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)', border: '1px solid var(--c-border)' }}>
                            Status: <strong>{errorData.status}</strong>
                        </div>
                    )}
                    {errorData.endpoint && (
                        <div style={{ padding: '4px 10px', backgroundColor: 'var(--c-surface-2)', borderRadius: 'var(--r-md)', fontSize: '0.85rem', color: 'var(--c-text-muted)', fontFamily: 'var(--font-mono)', border: '1px solid var(--c-border)' }}>
                            {errorData.method && <strong style={{ textTransform: 'uppercase', marginRight: '6px' }}>{errorData.method}</strong>}
                            {errorData.endpoint}
                        </div>
                    )}
                </div>

                {/* Collapsible Technical Details */}
                {errorData.raw && (
                    <div style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginTop: 'var(--space-sm)' }}>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            style={{
                                width: '100%', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                backgroundColor: 'var(--c-surface-2)', border: 'none', cursor: 'pointer', color: 'var(--c-text)', fontSize: '0.875rem'
                            }}
                        >
                            <span style={{ fontWeight: 500 }}>Technical Details</span>
                            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showDetails && (
                            <div style={{ padding: '16px', backgroundColor: '#161b22', borderTop: '1px solid var(--c-border)' }}>
                                <pre style={{
                                    margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#e6edf3',
                                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '250px', overflowY: 'auto'
                                }}>
                                    {typeof errorData.raw === 'object' ? JSON.stringify(errorData.raw, null, 2) : String(errorData.raw)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={handleClose}>Dismiss</Button>
                </div>
            </div>
        </Modal>
    );
};

export default GlobalErrorModal;
