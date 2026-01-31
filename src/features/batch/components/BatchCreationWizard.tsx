import React, { useState } from 'react';
import { Modal, EditableMarkdown } from '../../../core/components/Modal';
import { ICONS } from '../../../core/components/IconButton';
import type { Product, StylePreset, BatchJob, AspectRatio, ImageSize } from '../../../core/types';

interface BatchCreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Omit<BatchJob, 'id' | 'createdAt' | 'status' | 'completedImages'>) => void;
    products: Product[];
    stylePresets: StylePreset[];
    editingJob?: BatchJob;
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
                    type="button" // Prevent form submission
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

export const BatchCreationWizard: React.FC<BatchCreationWizardProps> = ({
    isOpen, onClose, onSave, products, stylePresets, editingJob
}) => {
    const [step, setStep] = useState<WizardStep>('products');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [jobName, setJobName] = useState('');
    const [customInstruction, setCustomInstruction] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [quality, setQuality] = useState<ImageSize>('4K');

    React.useEffect(() => {
        if (isOpen) {
            if (editingJob) {
                setSelectedProducts(editingJob.config.productIds);
                setSelectedStyles(editingJob.config.stylePresetIds);
                setJobName(editingJob.name.includes('(Copy)') ? editingJob.name : `${editingJob.name} (Copy)`);
                setCustomInstruction(editingJob.config.customInstruction || '');
                setAspectRatio(editingJob.config.aspectRatio || '1:1');
                setQuality(editingJob.config.quality || '4K');
            } else {
                setSelectedProducts([]);
                setSelectedStyles([]);
                setJobName('');
                setCustomInstruction('');
                setAspectRatio('1:1');
                setQuality('4K');
            }
            setStep('products');
        }
    }, [isOpen, editingJob]);

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
                quality: quality,
                aspectRatio: aspectRatio
            },
            totalImages,
            estimatedTime: totalImages * 20,
            estimatedCost: totalCost,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Batch Job" size="xlarge" bodyClassName="batch-wizard-body">
            <div className="batch-wizard-layout">
                {/* --- Sidebar --- */}
                <aside className="wizard-sidebar">
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
                    <div className="live-summary">
                        <h3>Live Summary</h3>
                        <div className="summary-item"><span>Products</span><strong>{selectedProducts.length}</strong></div>
                        <div className="summary-item"><span>Styles</span><strong>{selectedStyles.length}</strong></div>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--space-3) 0' }} />
                        <div className="summary-item total"><span>Total Images</span><strong>{totalImages}</strong></div>
                        <div className="summary-item cost"><span>Est. Cost</span><strong>{totalCost} Cr</strong></div>
                    </div>
                </aside>

                {/* --- Main Content --- */}
                <main className="wizard-main">
                    <div className="wizard-content-area">
                        {step === 'products' && (
                            <>
                                <div className="wizard-step-header">
                                    <div><h2>Select Products</h2><p>Choose the subjects for this photoshoot.</p></div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="button-secondary small" onClick={() => setSelectedProducts(products.map(p => p.id))}>Select All</button>
                                        <button className="button-secondary small" onClick={() => setSelectedProducts([])}>Clear</button>
                                    </div>
                                </div>
                                <div className="wizard-selection-grid">
                                    {products.map(p => (
                                        <div key={p.id} className={`wizard-selection-card ${selectedProducts.includes(p.id) ? 'selected' : ''}`} onClick={() => toggleProduct(p.id)}>
                                            <div className="card-checkbox"></div>
                                            <div className="image-wrapper">{p.sourceImages[0]?.data && <img src={p.sourceImages[0].data} alt={p.name} />}</div>
                                            <div className="label">{p.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {step === 'styles' && (
                            <>
                                <div className="wizard-step-header">
                                    <div><h2>Select Styles</h2><p>Choose visual styles to apply.</p></div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="button-secondary small" onClick={() => setSelectedStyles(stylePresets.map(s => s.id))}>Select All</button>
                                        <button className="button-secondary small" onClick={() => setSelectedStyles([])}>Clear</button>
                                    </div>
                                </div>
                                <div className="wizard-selection-grid">
                                    {stylePresets.map(s => (
                                        <div key={s.id} className={`wizard-selection-card ${selectedStyles.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleStyle(s.id)}>
                                            <div className="card-checkbox"></div>
                                            <div className="image-wrapper">{s.referenceImages?.[0] ? <img src={s.referenceImages[0]} alt={s.name} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ICONS.sparkles}</div>}</div>
                                            <div className="label">{s.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {step === 'config' && (
                            <>
                                <div className="wizard-step-header">
                                    <div><h2>Review & Confirm</h2><p>Finalize the details for your batch job.</p></div>
                                </div>
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
                                        <p className="field-helper">Add a specific direction for this entire batch (e.g., "Make sure the background is out of focus").</p>
                                        <EditableMarkdown value={customInstruction} onChange={setCustomInstruction} isTextarea rows={4} placeholder="Enter specific instructions..." />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="wizard-main-footer">
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
                </main>
            </div>
        </Modal>
    );
};