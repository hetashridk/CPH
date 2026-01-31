import React from 'react';

interface DeleteConfirmationViewProps {
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    confirmText?: string;
    cancelText?: string;
}

export const DeleteConfirmationView: React.FC<DeleteConfirmationViewProps> = ({
    title,
    message,
    onCancel,
    onConfirm,
    isDeleting = false,
    confirmText = "Yes, Delete",
    cancelText = "Cancel"
}) => {
    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            position: 'relative' // Ensure it stacks correctly if needed
        }}>
            {/* Main Content Container - ensuring centered focus */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%',
                gap: '32px'
            }}>
                {/* Trash Icon Circle */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255, 59, 48, 0.1)', // Red tint
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF3B30', // Standard Danger Red
                    marginBottom: '8px'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>

                {/* Text Content */}
                <div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        margin: '0 0 16px 0'
                    }}>
                        {title}
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        {message}
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginTop: '16px',
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: '14px 40px',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: 500
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            padding: '14px 40px',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 59, 48, 0.15)', // Darker red bg for button
                            border: '1px solid rgba(255, 59, 48, 0.3)',
                            color: '#FF453A', // Lighter red for text on dark
                            cursor: 'pointer',
                            fontWeight: 600,
                            minWidth: '160px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            if (!isDeleting) {
                                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.25)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isDeleting) {
                                e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)';
                            }
                        }}
                    >
                        {isDeleting ? 'Deleting...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
