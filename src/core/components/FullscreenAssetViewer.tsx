import React, { useState, useEffect } from 'react';
import { ICONS, IconButton } from './IconButton';
import { ImageMagnifier } from './ImageMagnifier';
import { emptyPrompt } from '../utils/prompts';
import { EnrichedImage } from '../types';

export const FullscreenAssetViewer: React.FC<{
    image: EnrichedImage | null;
    isOpen: boolean;
    onClose: () => void;
    // Navigation
    onNext?: () => void;
    onPrev?: () => void;
    currentIndex?: number;
    totalImages?: number;
    // Actions
    onApprove?: (approved: boolean) => void;
    onRefine?: (instruction: string) => Promise<void>;
    onReshoot?: () => Promise<void>;
    onDelete?: () => void;
}> = ({ 
    image, isOpen, onClose, onNext, onPrev, currentIndex, totalImages,
    onApprove, onRefine, onReshoot, onDelete 
}) => {
    const [refineInput, setRefineInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset inspector state when closed, but not on every image change.
            setIsInspectorOpen(false);
            setRefineInput('');
        }
    }, [isOpen]);

    // Keyboard support
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && onNext) onNext();
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
            if (e.key.toLowerCase() === 'i') setIsInspectorOpen(p => !p);
            if (e.key.toLowerCase() === 'a' && onApprove && image) onApprove(!image.approved);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, onNext, onPrev, onApprove, image]);

    const handleAction = async (action: () => Promise<void> | void) => {
        setIsProcessing(true);
        try {
            await action();
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDownload = () => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image.imageData;
        link.download = `${image.productName.replace(/\s+/g, '_')}_${image.id}.png`;
        link.click();
    };

    if (!isOpen || !image) return null;

    const hasNavigation = typeof currentIndex === 'number' && typeof totalImages === 'number' && onNext && onPrev && totalImages > 1;

    return (
        <div className={`zen-review-overlay ${isInspectorOpen ? 'inspector-is-open' : ''}`}>
            <div className="zen-review-top-controls">
                <IconButton icon="close" tooltip="Close (Esc)" onClick={onClose} />
            </div>

            <div className="zen-review-stage" onClick={() => isInspectorOpen && setIsInspectorOpen(false)}>
                 <ImageMagnifier src={image.imageData} alt={image.productName} />
            </div>

            <div className="zen-review-bottom-bar">
                <div className="zen-bar-section">
                    {hasNavigation && (
                        <>
                            <IconButton icon="<" tooltip="Previous (←)" onClick={onPrev} />
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', minWidth: '60px', textAlign: 'center' }}>
                                {currentIndex + 1} / {totalImages}
                            </span>
                            <IconButton icon=">" tooltip="Next (→)" onClick={onNext} />
                        </>
                    )}
                </div>
                <div className="zen-bar-section zen-bar-center-info">
                    <span className="title">{image.productName}</span>
                    <span className="subtitle">{image.styleName}</span>
                </div>
                <div className="zen-bar-section">
                     {onApprove && (
                        <button 
                            className={`zen-bar-approve-btn ${image.approved ? 'approved' : 'pending'}`}
                            onClick={() => onApprove(!image.approved)}
                            title="Toggle Approval (A)"
                        >
                            {image.approved ? '✓ Approved' : 'Approve'}
                        </button>
                     )}
                    <div className="zen-bar-separator" />
                    <IconButton icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} tooltip="Toggle Info (I)" onClick={() => setIsInspectorOpen(!isInspectorOpen)} className={isInspectorOpen ? 'active' : ''} />
                    <IconButton icon="download" tooltip="Download" onClick={handleDownload} />
                </div>
            </div>

            <aside className="zen-inspector-panel" onClick={e => e.stopPropagation()}>
                <div className="zen-inspector-header">
                    <div className="zen-title-group">
                        <h3>Asset Details</h3>
                    </div>
                </div>

                <div className="zen-inspector-body">
                    {onApprove && (
                        <div className="zen-section">
                            <span className="zen-label">Review Status</span>
                            <div className="zen-status-toggle">
                                <button className={`zen-status-option ${image.approved ? 'active approved' : ''}`} onClick={() => onApprove(true)}>Approved</button>
                                <button className={`zen-status-option ${!image.approved ? 'active pending' : ''}`} onClick={() => onApprove(false)}>Pending</button>
                            </div>
                        </div>
                    )}
                    <div className="zen-section">
                        <span className="zen-label">Metadata</span>
                        <div className="zen-metadata-grid">
                            <div className="zen-meta-item"><span className="zen-meta-label">Created</span><span className="zen-meta-value">{new Date(image.createdAt).toLocaleDateString()}</span></div>
                            <div className="zen-meta-item"><span className="zen-meta-label">Format</span><span className="zen-meta-value">{image.productAspectRatio}</span></div>
                            <div className="zen-meta-item"><span className="zen-meta-label">Source</span><span className="zen-meta-value" style={{textTransform: 'capitalize'}}>{image.source.replace('_', ' ')}</span></div>
                            <div className="zen-meta-item"><span className="zen-meta-label">Quality</span><span className="zen-meta-value">4K Studio</span></div>
                        </div>
                    </div>
                    {onRefine && (
                        <div className="zen-section">
                            <span className="zen-label">Magic Edit</span>
                            <div className="refine-input-wrapper">
                                <textarea placeholder="e.g. 'Make lighting warmer'..." value={refineInput} onChange={(e) => setRefineInput(e.target.value)} rows={3} disabled={isProcessing} />
                                <button className="button-primary small" onClick={() => handleAction(() => onRefine(refineInput))} disabled={isProcessing || !refineInput.trim()}>
                                    {isProcessing ? <span className="spinner small"/> : 'Apply Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                    {onReshoot && (
                        <div className="zen-section">
                            <span className="zen-label">Iteration</span>
                            <button className="button-secondary" onClick={() => handleAction(onReshoot)} disabled={isProcessing}>
                                {isProcessing ? <span className="spinner small"/> : ICONS.undo} {isProcessing ? 'Reshooting...' : 'Reshoot (Same Prompt)'}
                            </button>
                        </div>
                    )}
                    <div className="zen-section">
                        <span className="zen-label">Prompt DNA</span>
                        <div className="zen-prompt-box">
                            {Object.entries(image.prompt || emptyPrompt()).map(([k, v]) => {
                                if (!v || (Array.isArray(v) && v.length === 0)) return null;
                                return ( <div key={k} style={{ marginBottom: '6px' }}><span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{k}: </span><span>{Array.isArray(v) ? v.join(', ') : v}</span></div>);
                            })}
                        </div>
                    </div>
                </div>

                <div className="zen-inspector-footer">
                    <button className="button-secondary button-full-width" onClick={handleDownload}>Download</button>
                    {onDelete && <button className="button-danger icon-only" onClick={() => handleAction(onDelete)}>{ICONS.delete}</button>}
                </div>
            </aside>
        </div>
    );
};
