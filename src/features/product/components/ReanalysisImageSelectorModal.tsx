import React, { useState, useEffect } from 'react';
import { Modal, EditableMarkdown } from '../../../core/components/Modal';
import type { Product } from '../../../core/types';

export const ReanalysisImageSelectorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSubmit: (payload: { selectedImages: string[]; direction: string }) => void;
    creditCost: number;
}> = ({ isOpen, onClose, product, onSubmit, creditCost }) => {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [direction, setDirection] = useState('');

    useEffect(() => {
        if (isOpen && product) {
            // Default to all images selected
            const allIndices = new Set(product.sourceImages.map((_, i) => i));
            setSelectedIndices(allIndices);
            setDirection('');
        }
    }, [isOpen, product]);

    const toggleSelection = (index: number) => {
        setSelectedIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (!product) return;
        const allIndices = new Set(product.sourceImages.map((_, i) => i));
        setSelectedIndices(allIndices);
    };

    const handleDeselectAll = () => {
        setSelectedIndices(new Set());
    };

    const handleSubmit = () => {
        if (!product || selectedIndices.size === 0) {
            alert("Please select at least one image to analyze.");
            return;
        }

        const selectedImages = product.sourceImages
            .filter((_, i) => selectedIndices.has(i))
            .map(si => si.data);

        onSubmit({ selectedImages, direction });
    };

    if (!product) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Split Content Area */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px', marginBottom: '24px' }}>

                {/* LEFT PANEL: Images */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-main)', fontWeight: 600 }}>1. Select Analysis Source</label>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>Select the images that best represent the product.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="button-secondary small" onClick={handleSelectAll}>All</button>
                            <button className="button-secondary small" onClick={handleDeselectAll}>None</button>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '16px',
                        marginTop: '8px'
                    }}>
                        {product.sourceImages.map((img, index) => {
                            const isSelected = selectedIndices.has(index);
                            return (
                                <div
                                    key={index}
                                    onClick={() => toggleSelection(index)}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        transition: 'all 0.2s ease',
                                        transform: isSelected ? 'scale(1.02)' : 'none',
                                        boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    <img
                                        src={img.data}
                                        alt={`Source ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.6 }}
                                    />
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute', top: '8px', right: '8px',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: 'var(--primary-color)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT PANEL: Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', height: 'fit-content' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ display: 'block', color: 'var(--text-main)', fontWeight: 600 }}>2. Guidance (Optional)</label>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>Specific instructions for the critique.</p>
                        <EditableMarkdown
                            value={direction}
                            onChange={setDirection}
                            isTextarea
                            rows={8}
                            placeholder="e.g., Focus on the texture and premium material finish. Ignore the background clutter."
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-main)', fontSize: '0.95rem',
                                minHeight: '150px'
                            }}
                        />
                    </div>

                    <div style={{
                        background: 'rgba(var(--primary-rgb), 0.05)',
                        border: '1px solid rgba(var(--primary-rgb), 0.1)',
                        borderRadius: '12px', padding: '16px',
                        display: 'flex', flexDirection: 'column', gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <span>Analysis Cost</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                            Re-analyzing will consume <strong>{creditCost > 0 ? `${creditCost} credit(s)` : 'Free'}</strong> and replace the current DNA.
                        </p>
                    </div>

                </div>
            </div>

            {/* Footer Actions */}
            <div className="modal-actions" style={{
                paddingTop: '20px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', justifyContent: 'flex-end', gap: '12px',
                background: 'transparent',
                marginTop: 'auto'
            }}>
                <button className="button-secondary" onClick={onClose}>Cancel</button>
                <button className="button-primary" onClick={handleSubmit} disabled={selectedIndices.size === 0}>
                    {`Run Analysis ${creditCost > 0 ? `(${creditCost} Cr)` : ''}`}
                </button>
            </div>
        </div>
    );
};