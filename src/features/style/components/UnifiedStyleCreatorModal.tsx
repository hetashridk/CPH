import React, { useState, useEffect, useRef } from 'react';
import { generateStylePresetsFromDirection, generateStyleFromBatch } from '../styleGeneration.service';
import { fileToDataUri } from '../../../core/utils/imageUtils';
import { generateId } from '../../../core/utils/misc';
import { ICONS } from '../../../core/components/IconButton';
import { Modal, EditableMarkdown } from '../../../core/components/Modal';
import { Select } from '../../../core/components/Select';
import type { Product, StylePreset } from '../../../core/types';

export type StyleCreationMode = 'text' | 'image';

const countOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
}));

export const UnifiedStyleCreatorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    initialMode: StyleCreationMode;
    onSave: (presets: Omit<StylePreset, 'id'>[], contextSubject?: string) => void;
    products: Product[];
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PROMPT_IDEAS: number; STYLE_FROM_IMAGE: number };
}> = ({ isOpen, onClose, initialMode, onSave, products, deductCredits, CREDIT_COSTS }) => {
    
    // Common state
    const [mode, setMode] = useState<StyleCreationMode>(initialMode);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [styleName, setStyleName] = useState('');
    const [styleNameError, setStyleNameError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

    // Text mode state
    const [direction, setDirection] = useState('');
    const [presetCount, setPresetCount] = useState(3);

    // Image mode state
    const [uploadedImages, setUploadedImages] = useState<{ file: File; data: string }[]>([]);
    const uploadInputRef = useRef<HTMLInputElement>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setDirection('');
            setPresetCount(3);
            setUploadedImages([]);
            setSelectedProductId(null);
            setStyleName('');
            setStyleNameError('');
            setIsGenerating(false);
            setGenerationProgress({ current: 0, total: 0 });
        }
    }, [isOpen, initialMode]);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const validateName = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed) return "Style Name is required.";
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > 40) return "Name max 40 characters.";
        return "";
    };

    const isSubmitDisabled = isGenerating || !selectedProductId || (mode === 'text' && !direction.trim()) || (mode === 'image' && uploadedImages.length === 0) || !styleName.trim() || !!styleNameError;
    
    const cost = mode === 'text' ? presetCount * CREDIT_COSTS.PROMPT_IDEAS : uploadedImages.length * CREDIT_COSTS.STYLE_FROM_IMAGE;
    const costLabel = cost > 0 ? `(${cost} Cr)` : '(Free)';
    const buttonText = mode === 'text' 
        ? `Generate ${presetCount} Style(s) ${costLabel}` 
        : `Generate ${uploadedImages.length} Style(s) ${costLabel}`;

    // Image upload handlers
    const handleFileChange = async (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);
        const imagePromises = fileArray.map(async file => ({ file, data: await fileToDataUri(file) }));
        const newImages = await Promise.all(imagePromises);
        setUploadedImages(prev => [...prev, ...newImages]);
        if(uploadInputRef.current) uploadInputRef.current.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        handleFileChange(e.dataTransfer.files);
    };

    const removeImage = (indexToRemove: number) => {
        setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStyleName(val);
        if (styleNameError) setStyleNameError('');
    };

    const handleNameBlur = () => {
        setStyleNameError(validateName(styleName));
    };

    // Main generation handler
    const handleGenerate = async () => {
        const nameError = validateName(styleName);
        if (nameError) {
            setStyleNameError(nameError);
            return;
        }

        if (!selectedProduct || isSubmitDisabled) return;
        if (!deductCredits(cost)) return;

        setIsGenerating(true);
        const total = mode === 'text' ? presetCount : uploadedImages.length;
        setGenerationProgress({ current: 0, total });
        const jobId = generateId();

        try {
            let newPresets: Omit<StylePreset, 'id'>[] = [];
            const baseName = styleName.trim();
            
            if (mode === 'text') {
                // TEXT TO STYLE MODE
                const generatedProps = await generateStylePresetsFromDirection(
                    [selectedProduct], direction, presetCount
                );
                
                newPresets = generatedProps.map((p, i) => ({
                    ...p,
                    name: presetCount > 1 ? `${baseName} ${i + 1}` : baseName,
                    referenceImages: [],
                    status: 'complete' as const, // NO AUTO GENERATION - Save costs
                    jobId: jobId,
                    statusLastUpdatedAt: new Date().toISOString()
                }));

            } else { 
                // IMAGE TO STYLE MODE
                const generated: Omit<StylePreset, 'id'>[] = [];
                let completedCount = 0;

                for (const [index, image] of uploadedImages.entries()) {
                    try {
                        const prompt = await generateStyleFromBatch(selectedProduct, image.data);
                        // Using user input name
                        const presetName = uploadedImages.length > 1 
                            ? `${baseName} ${index + 1}` 
                            : baseName;

                        generated.push({ 
                            name: presetName, 
                            prompt, 
                            referenceImages: [image.data], 
                            status: 'complete' as const,
                            jobId: jobId,
                            statusLastUpdatedAt: new Date().toISOString()
                        });
                    } finally {
                        completedCount++;
                        setGenerationProgress({ current: completedCount, total: uploadedImages.length });
                    }
                }
                newPresets = generated;
            }
            
            if (newPresets.length > 0) {
                onSave(newPresets, selectedProduct.name);
                onClose();
            } else {
                 throw new Error("AI failed to generate any presets.");
            }
        } catch (error) {
            console.error("Failed to generate styles:", error);
            alert("Failed to generate style presets. The AI may have encountered an issue. Please try again or adjust your input.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Styles" size="xlarge">
        <div className="unified-style-creator-layout">
            <div className="modal-form-group">
                <label>1. Contextual Product (Required)</label>
                <p className="field-helper">Select a product to help the AI understand what kind of items these styles are for.</p>
                <Select
                    value={selectedProductId || ''}
                    onChange={setSelectedProductId}
                    options={products.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="Select Product..."
                    disabled={isGenerating}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: mode === 'text' ? '1fr 1fr' : '1fr', gap: 'var(--space-5)' }}>
                <div className="modal-form-group">
                    <label>2. Style Name (Required)</label>
                    <p className="field-helper">Give your style a name. Variations will be numbered.</p>
                    <input 
                        type="text" 
                        value={styleName} 
                        onChange={handleNameChange} 
                        onBlur={handleNameBlur}
                        placeholder="e.g. Neon Cyberpunk" 
                        disabled={isGenerating} 
                        style={styleNameError ? { borderColor: 'var(--danger)' } : {}}
                    />
                    {styleNameError && <span style={{color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px'}}>{styleNameError}</span>}
                </div>

                {mode === 'text' && (
                    <div className="modal-form-group">
                        <label>Variation Count</label>
                        <p className="field-helper">How many styles to generate?</p>
                        <Select 
                            value={String(presetCount)} 
                            onChange={(val) => setPresetCount(parseInt(val, 10))} 
                            options={countOptions}
                            disabled={isGenerating}
                        />
                    </div>
                )}
            </div>

            <div className="creator-tabs">
                <button className={`creator-tab-button ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
                    {ICONS.sparkles} From Creative Idea
                </button>
                <button className={`creator-tab-button ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
                    {ICONS.images} From Image(s)
                </button>
            </div>

            <div className="creator-content">
                {mode === 'text' ? (
                    <div className="text-creator-content">
                         <div className="modal-form-group">
                            <label>3. Creative Direction</label>
                            <p className="field-helper">Describe the visual styles you want. Be descriptive!</p>
                            <EditableMarkdown 
                                value={direction} 
                                onChange={setDirection} 
                                isTextarea 
                                rows={6} 
                                placeholder="e.g., A set of styles for a summer campaign. One bright and airy, one with golden hour beach lighting, and one with a cool, refreshing poolside vibe."
                                disabled={isGenerating}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="image-creator-content">
                        <div className="modal-form-group">
                             <label>3. Upload Style Images</label>
                             <input type="file" ref={uploadInputRef} multiple accept="image/*" style={{display: 'none'}} onChange={(e) => handleFileChange(e.target.files)} />
                             <div className="batch-create-gallery-wrapper">
                                {uploadedImages.length === 0 ? (
                                    <div className="batch-style-upload-area" onClick={() => uploadInputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                                        {ICONS.upload}
                                        <p>Drag & drop images here, or click to browse.</p>
                                    </div>
                                ) : (
                                    <div className="uploaded-image-grid" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
                                        {uploadedImages.map((img, index) => (
                                            <div key={index} className="uploaded-image-card">
                                                <img src={img.data} alt={img.file.name} />
                                                <button onClick={() => removeImage(index)} className="remove-image-btn">&times;</button>
                                                <div className="image-card-name">{img.file.name}</div>
                                            </div>
                                        ))}
                                         <div className="uploaded-image-card add-more" onClick={() => uploadInputRef.current?.click()}>
                                            {ICONS.plus}
                                            <span>Add More</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

             {isGenerating && (
                <div className="batch-job-progress">
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{width: `${generationProgress.total > 0 ? (generationProgress.current / generationProgress.total) * 100 : 0}%`}}></div>
                    </div>
                    <div className="progress-text">Generating... {generationProgress.current} / {generationProgress.total} completed</div>
                </div>
            )}
        </div>
        <div className="modal-actions">
            <button className="button-secondary" onClick={onClose} disabled={isGenerating}>Cancel</button>
            <button className="button-primary" onClick={handleGenerate} disabled={isSubmitDisabled}>
                {isGenerating ? <span className="spinner" /> : buttonText}
            </button>
        </div>
      </Modal>
    );
}