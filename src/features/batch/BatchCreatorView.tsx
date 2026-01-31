import React, { useState, useEffect } from 'react';
import { ICONS } from '../../core/components/IconButton';
import { EditableMarkdown } from '../../core/components/Modal';
import type { Product, StylePreset, BatchJob, AspectRatio, ImageSize } from '../../core/types';

interface BatchCreatorViewProps {
    products: Product[];
    stylePresets: StylePreset[];
    editingJob?: BatchJob | null;
    onSave: (job: Omit<BatchJob, 'id' | 'createdAt' | 'status' | 'completedImages'>) => void;
    onCancel: () => void;
}

type WizardStep = 'products' | 'styles' | 'config';
const steps: { id: WizardStep; title: string; description: string }[] = [
    { id: 'products', title: 'Select Products', description: 'Choose your subjects.' },
    { id: 'styles', title: 'Select Styles', description: 'Choose your aesthetics.' },
    { id: 'config', title: 'Review & Confirm', description: 'Finalize job details.' },
];

const AspectRatioSelector: React.FC<{
    value: AspectRatio;
    onChange: (ratio: AspectRatio) => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
    const ratios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

    return (
        <div className="aspect-ratio-selector">
            {ratios.map(ratio => (
                <button
                    key={ratio}
                    type="button"
                    className={`ratio-button ${value === ratio ? 'active' : ''}`}
                    onClick={() => onChange(ratio)}
                    disabled={disabled}
                >
                    {ratio}
                </button>
            ))}
        </div>
    );
};

const ResolutionSelector: React.FC<{
    value: ImageSize;
    onChange: (size: ImageSize) => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
    const sizes: ImageSize[] = ['1K', '2K', '4K'];

    return (
        <div className="aspect-ratio-selector">
            {sizes.map(size => (
                <button
                    key={size}
                    type="button"
                    className={`ratio-button ${value === size ? 'active' : ''}`}
                    onClick={() => onChange(size)}
                    disabled={disabled}
                >
                    {size}
                </button>
            ))}
        </div>
    );
};

export const BatchCreatorView: React.FC<BatchCreatorViewProps> = ({
    products, stylePresets, editingJob, onSave, onCancel
}) => {
    const [step, setStep] = useState<WizardStep>('products');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [jobName, setJobName] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [quality, setQuality] = useState<ImageSize>('4K');

    useEffect(() => {
        if (editingJob) {
            setSelectedProducts(editingJob.config.productIds);
            setSelectedStyles(editingJob.config.stylePresetIds);
            setJobName(editingJob.name.includes('(Copy)') ? editingJob.name : `${editingJob.name} (Copy)`);
            setCustomInstruction(editingJob.config.customInstruction || '');
            setAspectRatio(editingJob.config.aspectRatio || '1:1');
            setQuality(editingJob.config.quality || '4K');
        } else {
            // Default state for new job
            setSelectedProducts([]);
            setSelectedStyles([]);
            setJobName('');
            setCustomInstruction('');
            setAspectRatio('1:1');
            setQuality('4K');
        }
        setStep('products');
    }, [editingJob]); // Only reset when editingJob changes (e.g., initial load or switch)

    const totalImages = selectedProducts.length * selectedStyles.length;
    const costPerImage = quality === '4K' ? 4 : quality === '2K' ? 2 : 1;
    const totalCost = totalImages * costPerImage;

    const toggleProduct = (id: string) => setSelectedProducts(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
    const toggleStyle = (id: string) => setSelectedStyles(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

    const handleStepClick = (clickedStep: WizardStep) => {
        const currentIndex = steps.findIndex(s => s.id === step);
        const clickedIndex = steps.findIndex(s => s.id === clickedStep);
        if (clickedIndex < currentIndex) {
            setStep(clickedStep);
        }
    };

    const handleNext = () => {
        if (step === 'products') setStep('styles');
        else if (step === 'styles') setStep('config');
    };

    const handleBack = () => {
        if (step === 'styles') setStep('products');
        else if (step === 'config') setStep('styles');
    };

    const handleFinish = () => {
        if (!jobName.trim()) {
            alert('Please give your batch job a name.');
            return;
        }

        onSave({
            name: jobName,
            config: {
                productIds: selectedProducts,
                stylePresetIds: selectedStyles,
                customInstruction,
                quality,
                aspectRatio
            },
            totalImages,
            estimatedTime: totalImages * 20,
            estimatedCost: totalCost,
        });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            {/* Full Screen Glass Panel */}
            <div style={{
                background: 'rgba(10, 10, 10, 0.2)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                boxShadow: 'none',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%'
            }}>
                {/* Header */}
                <div style={{
                    height: '80px',
                    padding: '0 32px',
                    background: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                            {editingJob ? 'Duplicate Batch Job' : 'Create New Batch Job'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                            Define your products, styles, and configurations for bulk generation.
                        </p>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    {/* LEFT PANEL: Wizard Navigation & Summary */}
                    <div style={{
                        width: '320px',
                        overflowY: 'auto',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        padding: '32px',
                        display: 'flex', flexDirection: 'column',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        <div className="wizard-stepper">
                            {steps.map((s, index) => {
                                const currentIndex = steps.findIndex(cs => cs.id === step);
                                const isCompleted = index < currentIndex;
                                const isActive = s.id === step;
                                return (
                                    <div
                                        key={s.id}
                                        className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed clickable' : ''}`}
                                        onClick={() => isCompleted && handleStepClick(s.id)}
                                        style={{ marginBottom: '2px' }}
                                    >
                                        <div className="step-circle">{isCompleted ? '' : index + 1}</div>
                                        <div className="step-label">
                                            <h4>{s.title}</h4>
                                            <p>{s.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 'auto', padding: '24px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Live Summary</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Products</span>
                                <span>{selectedProducts.length}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Styles</span>
                                <span>{selectedStyles.length}</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '12px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 }}>
                                <span>Total Images</span>
                                <span style={{ color: 'var(--primary-color)' }}>{totalImages}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Est. Cost</span>
                                <span>{totalCost} Cr</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Dynamic Content */}
                    <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                        {step === 'products' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Select Products</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="button-secondary small" onClick={() => setSelectedProducts(products.map(p => p.id))}>Select All</button>
                                        <button className="button-secondary small" onClick={() => setSelectedProducts([])}>Clear</button>
                                    </div>
                                </div>
                                <div className="wizard-selection-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '16px',
                                    paddingBottom: '24px'
                                }}>
                                    {products.map(p => (
                                        <div
                                            key={p.id}
                                            className={`wizard-selection-card ${selectedProducts.includes(p.id) ? 'selected' : ''}`}
                                            onClick={() => toggleProduct(p.id)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '3/4',
                                                background: 'var(--bg-surface)',
                                                border: selectedProducts.includes(p.id) ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {selectedProducts.includes(p.id) && <div style={{
                                                position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px',
                                                background: 'var(--primary-color)', borderRadius: '50%', zIndex: 10,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>}

                                            <div className="image-wrapper" style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
                                                {p.sourceImages[0]?.data ? (
                                                    <img
                                                        src={p.sourceImages[0].data}
                                                        alt={p.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', background: '#222' }}></div>
                                                )}
                                            </div>
                                            <div className="label" style={{
                                                padding: '12px', fontSize: '0.85rem', fontWeight: 500,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                background: 'var(--bg-card)', borderTop: '1px solid rgba(255,255,255,0.05)'
                                            }}>{p.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {step === 'styles' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Select Styles</h2>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="button-secondary small" onClick={() => setSelectedStyles(stylePresets.map(s => s.id))}>Select All</button>
                                        <button className="button-secondary small" onClick={() => setSelectedStyles([])}>Clear</button>
                                    </div>
                                </div>
                                <div className="wizard-selection-grid" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    gap: '16px',
                                    paddingBottom: '24px'
                                }}>
                                    {stylePresets.map(s => (
                                        <div
                                            key={s.id}
                                            className={`wizard-selection-card ${selectedStyles.includes(s.id) ? 'selected' : ''}`}
                                            onClick={() => toggleStyle(s.id)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '3/4',
                                                background: 'var(--bg-surface)',
                                                border: selectedStyles.includes(s.id) ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            {selectedStyles.includes(s.id) && <div style={{
                                                position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px',
                                                background: 'var(--primary-color)', borderRadius: '50%', zIndex: 10,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>}

                                            <div className="image-wrapper" style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
                                                {s.referenceImages?.[0] ? (
                                                    <img
                                                        src={s.referenceImages[0]}
                                                        alt={s.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                                                        {ICONS.sparkles}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="label" style={{
                                                padding: '12px', fontSize: '0.85rem', fontWeight: 500,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                background: 'var(--bg-card)', borderTop: '1px solid rgba(255,255,255,0.05)'
                                            }}>{s.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {step === 'config' && (
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Review & Confirm</h2>
                                <div className="wizard-config-form">
                                    <div className="modal-form-group">
                                        <label>Batch Job Name</label>
                                        <input type="text" value={jobName} onChange={e => setJobName(e.target.value)} placeholder="e.g. Summer Campaign 2024 - Batch 1" />
                                    </div>
                                    <div className="modal-form-group">
                                        <label>Aspect Ratio</label>
                                        <p className="field-helper">Choose the output format for all generated images in this batch.</p>
                                        <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                                    </div>
                                    <div className="modal-form-group">
                                        <label>Output Resolution</label>
                                        <p className="field-helper">Select the quality for the generated images.</p>
                                        <ResolutionSelector value={quality} onChange={setQuality} />
                                    </div>
                                    <div className="modal-form-group">
                                        <label>Custom Instruction (Optional)</label>
                                        <p className="field-helper">Add a specific direction for this entire batch.</p>
                                        <EditableMarkdown value={customInstruction} onChange={setCustomInstruction} isTextarea rows={4} placeholder="Enter specific instructions..." />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{
                    height: '80px',
                    padding: '0 32px',
                    background: 'transparent',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    flexShrink: 0
                }}>
                    <button className="button-secondary" onClick={onCancel}>Cancel</button> {/* Cancel exits the view entirely */}
                    {step !== 'products' && <button className="button-secondary" onClick={handleBack}>Back</button>}
                    {step !== 'config' ? (
                        <button className="button-primary" onClick={handleNext} disabled={(step === 'products' && selectedProducts.length === 0) || (step === 'styles' && selectedStyles.length === 0)}>
                            Next Step
                        </button>
                    ) : (
                        <button className="button-primary large" onClick={handleFinish} disabled={!jobName.trim() || totalImages === 0}>
                            Create Batch Job
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
