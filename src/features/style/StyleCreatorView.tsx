import React, { useState, useEffect, useRef } from 'react';
import { generateStylePresetsFromDirection, generateStyleFromBatch, generatePromptFromIdea, generateStylePresetName } from './styleGeneration.service';
import { fileToDataUri } from '../../core/utils/imageUtils';
import { generateId } from '../../core/utils/misc';
import { ICONS } from '../../core/components/IconButton';
import { EditableMarkdown } from '../../core/components/Modal';
import { Select } from '../../core/components/Select';
import { ChipInput } from '../../core/components/ChipInput';
import { emptyPrompt } from '../../core/utils/prompts';
import type { Product, StylePreset, ModularPrompt } from '../../core/types';

export type StyleCreatorMode = 'text' | 'image' | 'manual';

type DnaTab = 'scene' | 'subject' | 'camera' | 'aesthetics' | 'advanced';

const TAB_ICONS: Record<DnaTab, React.ReactNode> = {
    scene: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12.5c0-5.25-4.25-9.5-9.5-9.5S2.5 7.25 2.5 12.5" /><path d="M2.5 12.5h19" /><path d="M12.5 2.5c-2.48 0-4.5 2.02-4.5 4.5 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-2.48-2.02-4.5-4.5-4.5zM21.5 12.5c0 5.25-4.25 9.5-9.5 9.5S2.5 17.75 2.5 12.5" /></svg>,
    subject: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
    camera: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    aesthetics: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" /></svg>,
    advanced: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
};

const countOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
}));

export const StyleCreatorView: React.FC<{
    initialMode: StyleCreatorMode;
    products: Product[];
    presetToEdit?: StylePreset | null; // For manual edit mode
    onSave: (presets: Omit<StylePreset, 'id'>[], contextSubject?: string, originalId?: string) => void;
    onCancel: () => void;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PROMPT_IDEAS: number; STYLE_FROM_IMAGE: number, PROMPT_FROM_IDEA: number };
}> = ({ initialMode, products, presetToEdit, onSave, onCancel, deductCredits, CREDIT_COSTS }) => {

    // --- State ---
    const [mode, setMode] = useState<StyleCreatorMode>(initialMode);

    // Common Fields
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [styleName, setStyleName] = useState('');
    const [styleNameError, setStyleNameError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Generator Mode States (Text/Image)
    const [direction, setDirection] = useState('');
    const [presetCount, setPresetCount] = useState(3);
    const [uploadedImages, setUploadedImages] = useState<{ file: File; data: string }[]>([]);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
    const uploadInputRef = useRef<HTMLInputElement>(null);

    // Manual Mode States
    const [manualPrompt, setManualPrompt] = useState<ModularPrompt>(emptyPrompt());
    const [manualRefImage, setManualRefImage] = useState<string | null>(null);
    const [manualUserIdea, setManualUserIdea] = useState('');
    const [activeTab, setActiveTab] = useState<DnaTab>('scene');
    const [isNaming, setIsNaming] = useState(false);

    const glassInputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'var(--text-main)',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
    };

    // Initialization
    useEffect(() => {
        if (mode === 'manual' && presetToEdit) {
            setStyleName(presetToEdit.name);
            setManualPrompt({ ...emptyPrompt(), ...presetToEdit.prompt });
            setManualRefImage(presetToEdit.referenceImages[0] || null);
            // Attempt to infer product context if possible, otherwise user selects
            // Not critically important to infer perfectly
        } else {
            // Reset logic if needed when switching modes?
            // Actually, we might want to preserve some state if user switches tabs
            if (mode !== 'manual') {
                // If switching to generators, maybe clear manual specific stuff or keep it?
            }
        }
    }, [mode, presetToEdit]);


    // --- Helper Functions ---
    const selectedProduct = products.find(p => p.id === selectedProductId);

    const validateName = (val: string) => {
        const trimmed = val.trim();
        if (!trimmed) return "Style Name is required.";
        if (trimmed.length < 2) return "Name must be at least 2 characters.";
        if (trimmed.length > 40) return "Name max 40 characters.";
        return "";
    };

    const handlePromptChange = (field: keyof ModularPrompt, value: string | string[]) => {
        setManualPrompt(p => ({ ...p, [field]: value }));
    };

    // --- Generator Logic (Text/Image) ---
    const handleFileChange = async (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);
        const imagePromises = fileArray.map(async file => ({ file, data: await fileToDataUri(file) }));
        const newImages = await Promise.all(imagePromises);
        setUploadedImages(prev => [...prev, ...newImages]);
        if (uploadInputRef.current) uploadInputRef.current.value = '';
    };

    const handleGeneratePresets = async () => {
        const nameError = validateName(styleName);
        if (nameError) { setStyleNameError(nameError); return; }
        if (!selectedProduct) { alert("Please select a product."); return; }

        const cost = mode === 'text' ? presetCount * CREDIT_COSTS.PROMPT_IDEAS : uploadedImages.length * CREDIT_COSTS.STYLE_FROM_IMAGE;
        if (!deductCredits(cost)) return;

        setIsGenerating(true);
        const total = mode === 'text' ? presetCount : uploadedImages.length;
        setGenerationProgress({ current: 0, total });
        const jobId = generateId();

        try {
            let newPresets: Omit<StylePreset, 'id'>[] = [];
            const baseName = styleName.trim();

            if (mode === 'text') {
                const generatedProps = await generateStylePresetsFromDirection([selectedProduct], direction, presetCount);
                newPresets = generatedProps.map((p, i) => ({
                    ...p,
                    name: presetCount > 1 ? `${baseName} ${i + 1}` : baseName,
                    referenceImages: [],
                    status: 'complete' as const,
                    jobId,
                    statusLastUpdatedAt: new Date().toISOString()
                }));
            } else { // Image mode
                const generated: Omit<StylePreset, 'id'>[] = [];
                let completedCount = 0;
                for (const [index, image] of uploadedImages.entries()) {
                    try {
                        const prompt = await generateStyleFromBatch(selectedProduct, image.data);
                        const presetName = uploadedImages.length > 1 ? `${baseName} ${index + 1}` : baseName;
                        generated.push({
                            name: presetName,
                            prompt,
                            referenceImages: [image.data],
                            status: 'complete' as const,
                            jobId,
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
            } else {
                throw new Error("No presets generated.");
            }
        } catch (e) {
            console.error(e);
            alert("Generation failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Manual Logic (DNA Editor) ---
    const handleGenerateDNA = async () => {
        if (!selectedProduct) { alert("Select a product."); return; }
        if (!deductCredits(CREDIT_COSTS.PROMPT_FROM_IDEA)) return;

        setIsGenerating(true);
        setIsNaming(true);
        try {
            const newPrompt = await generatePromptFromIdea(selectedProduct, manualUserIdea, manualRefImage);
            setManualPrompt(newPrompt);
            const suggestedName = await generateStylePresetName(newPrompt);
            setStyleName(suggestedName);
        } catch (e) {
            console.error(e);
            alert("AI generation failed.");
        } finally {
            setIsGenerating(false);
            setIsNaming(false);
        }
    };

    const handleAutoName = async () => {
        setIsNaming(true);
        try {
            const suggestedName = await generateStylePresetName(manualPrompt);
            setStyleName(suggestedName);
        } catch (e) {
            console.error(e);
        } finally {
            setIsNaming(false);
        }
    };

    const handleSaveManual = () => {
        if (!styleName.trim()) { alert("Name required."); return; }

        const preset: Omit<StylePreset, 'id'> = {
            name: styleName,
            prompt: manualPrompt,
            referenceImages: manualRefImage ? [manualRefImage] : [],
            status: 'complete',
            statusLastUpdatedAt: new Date().toISOString()
        };

        // If editing, pass original ID. If new, original ID is undefined.
        onSave([preset], selectedProduct?.name, presetToEdit?.id);
    };

    // --- Layout ---
    // If in MANUAL mode, use the split-pane layout (Editor)
    // If in TEXT/IMAGE mode, use the wizard layout (Creator)

    const isManual = mode === 'manual';

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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                            {isManual ? (presetToEdit ? 'Edit Style DNA' : 'Design New Style') : 'AI Style Generator'}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                            {isManual ? 'Fine-tune the prompt DNA manually or use AI assistance.' : 'Generate multiple style variations from a concept or reference images.'}
                        </p>
                    </div>

                    {!presetToEdit && (
                        <div className="creator-tabs" style={{ margin: 0, scale: '0.9', display: 'flex', gap: '12px' }}>
                            <button className={`creator-tab-button ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
                                {ICONS.sparkles} From Text
                            </button>
                            <button className={`creator-tab-button ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
                                {ICONS.images} From Image
                            </button>
                            <button className={`creator-tab-button ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                                {ICONS.edit} Manual Editor
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

                    {/* LEFT PANEL: Inputs & Controls */}
                    <div style={{
                        width: '400px',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        padding: '32px',
                        overflowY: 'auto',
                        display: 'flex', flexDirection: 'column', gap: '24px'
                    }}>

                        <div className="modal-form-group">
                            <label>Contextual Product</label>
                            <p className="field-helper">Required for AI context.</p>
                            <Select
                                value={selectedProductId || ''}
                                onChange={setSelectedProductId}
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select Product..."
                                disabled={isGenerating}
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Style Name</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={styleName}
                                    onChange={e => setStyleName(e.target.value)}
                                    placeholder="e.g. Neon Cyberpunk"
                                    disabled={isGenerating || isNaming}
                                    style={glassInputStyle}
                                />
                                {isManual && (
                                    <button className="button-secondary small" onClick={handleAutoName} disabled={isNaming} title="Auto-name">
                                        {isNaming ? <span className="spinner small" /> : ICONS.sparkles}
                                    </button>
                                )}
                            </div>
                            {styleNameError && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{styleNameError}</span>}
                        </div>

                        {/* MODE SPECIFIC INPUTS */}
                        {mode === 'text' && (
                            <>
                                <div className="modal-form-group">
                                    <label>Creative Direction</label>
                                    <EditableMarkdown
                                        value={direction} onChange={setDirection} isTextarea rows={6}
                                        placeholder="Describe the mood, lighting, and aesthetic..."
                                        style={glassInputStyle}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Variation Count</label>
                                    <Select value={String(presetCount)} onChange={v => setPresetCount(parseInt(v))} options={countOptions} />
                                </div>
                            </>
                        )}

                        {mode === 'image' && (
                            <div className="modal-form-group">
                                <label>Reference Images</label>
                                <div className="batch-create-gallery-wrapper">
                                    {uploadedImages.length === 0 ? (
                                        <div className="batch-style-upload-area" onClick={() => uploadInputRef.current?.click()}>
                                            {ICONS.upload}
                                            <p>Click to upload images</p>
                                        </div>
                                    ) : (
                                        <div className="uploaded-image-grid">
                                            {uploadedImages.map((img, i) => (
                                                <div key={i} className="uploaded-image-card">
                                                    <img src={img.data} alt="" />
                                                    <button onClick={() => setUploadedImages(p => p.filter((_, idx) => idx !== i))} className="remove-image-btn">&times;</button>
                                                </div>
                                            ))}
                                            <div className="uploaded-image-card add-more" onClick={() => uploadInputRef.current?.click()}>
                                                {ICONS.plus}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={uploadInputRef} multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e.target.files)} />
                            </div>
                        )}

                        {mode === 'manual' && (
                            <div className="ai-assistant-card" style={{ marginTop: '0' }}>
                                <div className="ai-assistant-card-header">
                                    {ICONS.sparkles}
                                    <h4>AI Assistant</h4>
                                </div>
                                <div className="modal-form-group">
                                    <label>Effect / Idea</label>
                                    <textarea
                                        value={manualUserIdea}
                                        onChange={e => setManualUserIdea(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Cinematic lighting in a forest..."
                                        style={glassInputStyle}
                                    />
                                </div>
                                <div className="modal-form-group">
                                    <label>Reference Image</label>
                                    {manualRefImage ? (
                                        <div className="reference-image-preview-container">
                                            <img src={manualRefImage} alt="Ref" />
                                            <button className="remove-btn" onClick={() => setManualRefImage(null)}>&times;</button>
                                        </div>
                                    ) : (
                                        <div className="reference-image-placeholder" onClick={() => document.getElementById('manual-ref-upload')?.click()}>
                                            {ICONS.upload} <span>Upload</span>
                                        </div>
                                    )}
                                    <input id="manual-ref-upload" type="file" style={{ display: 'none' }} onChange={async (e) => {
                                        if (e.target.files?.[0]) setManualRefImage(await fileToDataUri(e.target.files[0]));
                                    }} />
                                </div>
                                <button className="button-primary button-full-width" onClick={handleGenerateDNA} disabled={isGenerating || !selectedProductId}>
                                    {isGenerating ? <span className="spinner" /> : 'Generate DNA'}
                                </button>
                            </div>
                        )}

                    </div>

                    {/* RIGHT PANEL: Preview / DNA Editor */}
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        {mode === 'manual' ? (
                            <div className="style-editor-dna">
                                <div className="prompt-dna-tabs">
                                    {(Object.keys(TAB_ICONS) as DnaTab[]).map(tab => (
                                        <button key={tab} className={`dna-tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                                            {TAB_ICONS[tab]}
                                            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="prompt-dna-tab-content">
                                    {/* Render Fields based on Tab - Reusing Logic from StyleEditorModal */}
                                    {activeTab === 'scene' && (
                                        <>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Goal</label><EditableMarkdown value={manualPrompt.goal} onChange={v => handlePromptChange('goal', v)} isTextarea rows={3} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Storyline</label><EditableMarkdown value={manualPrompt.storyline} onChange={v => handlePromptChange('storyline', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Environment</label><EditableMarkdown value={manualPrompt.environment} onChange={v => handlePromptChange('environment', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                        </>
                                    )}
                                    {activeTab === 'subject' && (
                                        <>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Product Details</label><EditableMarkdown value={manualPrompt.product} onChange={v => handlePromptChange('product', v)} isTextarea rows={3} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Subject Persona</label><EditableMarkdown value={manualPrompt.subject} onChange={v => handlePromptChange('subject', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                        </>
                                    )}
                                    {activeTab === 'camera' && (
                                        <>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Camera</label><EditableMarkdown value={manualPrompt.mentalCamera} onChange={v => handlePromptChange('mentalCamera', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Lighting</label><EditableMarkdown value={manualPrompt.lighting} onChange={v => handlePromptChange('lighting', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                        </>
                                    )}
                                    {activeTab === 'aesthetics' && (
                                        <>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Surfaces</label><EditableMarkdown value={manualPrompt.surfacesMaterials} onChange={v => handlePromptChange('surfacesMaterials', v)} isTextarea rows={4} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Style DNA</label><EditableMarkdown value={manualPrompt.styleDNA} onChange={v => handlePromptChange('styleDNA', v)} isTextarea rows={3} style={glassInputStyle} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Palette</label><ChipInput chips={manualPrompt.colorPalette || []} onChange={v => handlePromptChange('colorPalette', v)} /></div>
                                        </>
                                    )}
                                    {activeTab === 'advanced' && (
                                        <>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Realism</label><ChipInput chips={manualPrompt.realism || []} onChange={v => handlePromptChange('realism', v)} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Imperfections</label><ChipInput chips={manualPrompt.imperfections || []} onChange={v => handlePromptChange('imperfections', v)} /></div>
                                            <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}><label>Negative Prompt</label><EditableMarkdown value={manualPrompt.negativePrompting} onChange={v => handlePromptChange('negativePrompting', v)} isTextarea rows={3} style={glassInputStyle} /></div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Generating View Placeholder/Progress
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                {isGenerating ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div className="spinner large"></div>
                                        <h3>Generating Styles...</h3>
                                        <p>Creating {generationProgress.total} variations based on your input.</p>
                                        <div style={{ width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: 'var(--primary-color)', width: `${(generationProgress.current / (generationProgress.total || 1)) * 100}%`, transition: 'width 0.3s ease' }}></div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontSize: '4rem', opacity: 0.1, marginBottom: '24px' }}>
                                            {mode === 'text' ? ICONS.sparkles : ICONS.images}
                                        </div>
                                        <h3>Ready to Create</h3>
                                        <p style={{ maxWidth: '400px' }}>
                                            {mode === 'text'
                                                ? "Describe your vision on the left, select how many variations you want, and let AI build the style DNA."
                                                : "Upload one or more reference images on the left. AI will analyze them to reverse-engineer their style DNA."}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
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
                    <button className="button-secondary" onClick={onCancel} disabled={isGenerating}>Cancel</button>
                    {isManual ? (
                        <button className="button-primary" onClick={handleSaveManual}>Save Style</button>
                    ) : (
                        <button className="button-primary" onClick={handleGeneratePresets} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : (
                                mode === 'text'
                                    ? `Generate ${presetCount} Styles (${presetCount * CREDIT_COSTS.PROMPT_IDEAS > 0 ? (presetCount * CREDIT_COSTS.PROMPT_IDEAS) + ' Cr' : 'Free'})`
                                    : `Generate ${uploadedImages.length || 0} Styles (${uploadedImages.length * CREDIT_COSTS.STYLE_FROM_IMAGE > 0 ? (uploadedImages.length * CREDIT_COSTS.STYLE_FROM_IMAGE) + ' Cr' : 'Free'})`
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
