import React, { useState, useEffect } from 'react';
import { generatePromptFromIdea, generateStylePresetName } from '../styleGeneration.service';
import { fileToDataUri } from '../../../core/utils/imageUtils';
import { emptyPrompt } from '../../../core/utils/prompts';
import { ChipInput } from '../../../core/components/ChipInput';
import { Modal, EditableMarkdown } from '../../../core/components/Modal';
import { IconButton, ICONS } from '../../../core/components/IconButton';
import { Select } from '../../../core/components/Select';
import type { Product, StylePreset, ModularPrompt } from '../../../core/types';

type DnaTab = 'scene' | 'subject' | 'camera' | 'aesthetics' | 'advanced';

const TAB_ICONS: Record<DnaTab, React.ReactNode> = {
    scene: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 12.5c0-5.25-4.25-9.5-9.5-9.5S2.5 7.25 2.5 12.5"/><path d="M2.5 12.5h19"/><path d="M12.5 2.5c-2.48 0-4.5 2.02-4.5 4.5 0 2.48 2.02 4.5 4.5 4.5s4.5-2.02 4.5-4.5c0-2.48-2.02-4.5-4.5-4.5zM21.5 12.5c0 5.25-4.25 9.5-9.5 9.5S2.5 17.75 2.5 12.5"/></svg>,
    subject: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
    camera: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    aesthetics: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>,
    advanced: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};


export const StyleEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: Omit<StylePreset, 'id'>, id?: string, contextSubject?: string) => void;
    products: Product[];
    presetToEdit: StylePreset | null;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PROMPT_FROM_IDEA: number };
}> = ({ isOpen, onClose, onSave, products, presetToEdit, deductCredits, CREDIT_COSTS }) => {
    const [name, setName] = useState('');
    const [prompt, setPrompt] = useState<ModularPrompt>(emptyPrompt());
    const [refImage, setRefImage] = useState<string | null>(null);
    const [userIdea, setUserIdea] = useState('');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isNaming, setIsNaming] = useState(false);
    const [activeTab, setActiveTab] = useState<DnaTab>('scene');

    useEffect(() => {
        if (isOpen) {
            if (presetToEdit) {
                setName(presetToEdit.name);
                setPrompt({ ...emptyPrompt(), ...presetToEdit.prompt });
                setRefImage(presetToEdit.referenceImages[0] || null);
            } else {
                setName('');
                setPrompt(emptyPrompt());
                setRefImage(null);
                setUserIdea('');
                setSelectedProductId(null);
            }
            setIsNaming(false);
            setActiveTab('scene');
        }
    }, [isOpen, presetToEdit]);

    const handlePromptChange = (field: keyof ModularPrompt, value: string | string[]) => {
        setPrompt(p => ({ ...p, [field]: value }));
    };

    const handleRefImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToDataUri(e.target.files[0]);
            setRefImage(base64);
        }
        e.target.value = '';
    };

    const handleGenerateDetails = async () => {
        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) {
            alert("Please select a product to provide context for the style.");
            return;
        }
        if (!deductCredits(CREDIT_COSTS.PROMPT_FROM_IDEA)) {
            return;
        }
        setIsGenerating(true);
        setIsNaming(true); 
        try {
            const newPrompt = await generatePromptFromIdea(selectedProduct, userIdea, refImage);
            setPrompt(newPrompt);
            
            const suggestedName = await generateStylePresetName(newPrompt);
            setName(suggestedName);

        } catch (error) {
            console.error("AI prompt/name generation failed:", error);
            alert("The AI assistant failed to generate prompt details or a name.");
        } finally {
            setIsGenerating(false);
            setIsNaming(false);
        }
    };
    
    const handleAutoName = async () => {
        setIsNaming(true);
        try {
            const suggestedName = await generateStylePresetName(prompt);
            setName(suggestedName);
        } catch (error) {
            console.error("Failed to auto-name style:", error);
            alert("The AI failed to suggest a name. Please try again.");
        } finally {
            setIsNaming(false);
        }
    };
    
    const handleSave = () => {
        if (!name.trim()) {
            alert("Please enter a name for the style preset.");
            return;
        }
        const selectedProduct = products.find(p => p.id === selectedProductId);
        const contextSubject = selectedProduct ? selectedProduct.name : undefined;
        onSave({ name, prompt, referenceImages: refImage ? [refImage] : [], status: 'complete', statusLastUpdatedAt: new Date().toISOString() }, presetToEdit?.id, contextSubject);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={presetToEdit ? 'Edit Style Preset' : 'Create Style Preset'} size="xlarge" bodyClassName="style-editor-body">
             
            <div className="style-editor-modal-grid">
                
                <div className="style-editor-controls">
                    <div className="modal-form-group">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <label>Style Name</label>
                            <button
                                className="button-secondary small"
                                onClick={handleAutoName}
                                disabled={isNaming}
                                title={`Auto-name with AI (Free)`}
                           >
                            {isNaming ? <span className="spinner"/> : 'Auto-name'}
                           </button>
                        </div>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alpine Majesty Editorial" disabled={isNaming} />
                    </div>

                    <div className="ai-assistant-card">
                         <div className="ai-assistant-card-header">
                            {ICONS.sparkles}
                            <h4>AI Assistant</h4>
                        </div>
                        <div className="modal-form-group">
                            <label>Contextual Product</label>
                            <p className="field-helper">Required for AI generation.</p>
                            <Select
                                value={selectedProductId || ''}
                                onChange={setSelectedProductId}
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select Product..."
                            />
                        </div>

                        <div className="modal-form-group">
                            <label>Creative Idea (Optional)</label>
                            <textarea value={userIdea} onChange={e => setUserIdea(e.target.value)} rows={3} placeholder="e.g., Product sitting on a mossy rock in a forest." />
                        </div>

                        <div className="modal-form-group" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <label>Reference Image (Optional)</label>
                            <div 
                                className="reference-image-preview-container" 
                                onClick={() => document.getElementById('style-ref-image')?.click()}
                            >
                                {refImage ? (
                                    <img src={refImage} alt="Reference" />
                                ) : (
                                    <div className="reference-image-placeholder">
                                        {ICONS.upload}
                                        <span>Click to Upload</span>
                                    </div>
                                )}
                                <input type="file" id="style-ref-image" accept="image/*" onChange={handleRefImageUpload} style={{ display: 'none' }} />
                            </div>
                            {refImage && (
                                <button className="button-secondary small" style={{marginTop: 'var(--space-2)', alignSelf: 'flex-start'}} onClick={() => setRefImage(null)}>Remove Image</button>
                            )}
                        </div>
                        
                        <button onClick={handleGenerateDetails} disabled={isGenerating || !selectedProductId} className="button-primary button-full-width">
                            {isGenerating && <span className="spinner"/>}
                            {isGenerating ? 'Generating DNA...' : (CREDIT_COSTS.PROMPT_FROM_IDEA > 0 ? `Generate DNA (${CREDIT_COSTS.PROMPT_FROM_IDEA} Cr)` : `Generate DNA (Free)`)}
                        </button>
                    </div>
                </div>

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
                        {activeTab === 'scene' && (
                            <>
                                <div className="dna-field">
                                    <label>Goal</label>
                                    <p className="field-helper">What is the specific objective for this image?</p>
                                    <EditableMarkdown value={prompt.goal} onChange={v => handlePromptChange('goal', v)} isTextarea rows={3} placeholder="e.g., A breathtaking high-fashion editorial..." />
                                </div>
                                <div className="dna-field">
                                    <label>Storyline</label>
                                    <p className="field-helper">What story does the photo tell? What emotions should it evoke?</p>
                                    <EditableMarkdown value={prompt.storyline} onChange={v => handlePromptChange('storyline', v)} isTextarea rows={4} placeholder="e.g., A queen of the mountains standing amidst..." />
                                </div>
                                 <div className="dna-field">
                                    <label>Environment</label>
                                    <p className="field-helper">Describe the setting, ambiance, and any real-life effects.</p>
                                    <EditableMarkdown value={prompt.environment} onChange={v => handlePromptChange('environment', v)} isTextarea rows={4} placeholder="e.g., The summit of a Swiss Alp..." />
                                </div>
                            </>
                        )}

                        {activeTab === 'subject' && (
                            <>
                                <div className="dna-field">
                                    <label>Product Details</label>
                                    <p className="field-helper">Generic placeholder for the product being shot.</p>
                                    <EditableMarkdown value={prompt.product} onChange={v => handlePromptChange('product', v)} isTextarea rows={3} placeholder="e.g., The featured couture saree ensemble." />
                                </div>
                                <div className="dna-field">
                                    <label>Subject Persona & Action</label>
                                    <p className="field-helper">Describe the character, mood, expression, and action.</p>
                                    <EditableMarkdown value={prompt.subject} onChange={v => handlePromptChange('subject', v)} isTextarea rows={4} placeholder="e.g., A statuesque foreign fashion model..." />
                                </div>
                            </>
                        )}
                        
                        {activeTab === 'camera' && (
                            <>
                                <div className="dna-field">
                                    <label>Camera & Lens</label>
                                    <p className="field-helper">Camera, lens, filter, ISO, shutter speed, aperture, etc.</p>
                                    <EditableMarkdown value={prompt.mentalCamera} onChange={v => handlePromptChange('mentalCamera', v)} isTextarea rows={4} placeholder="e.g., Hasselblad H6D-100c, 85mm prime lens..." />
                                </div>
                                <div className="dna-field">
                                    <label>Lighting</label>
                                    <p className="field-helper">Describe the lighting setup and quality.</p>
                                    <EditableMarkdown value={prompt.lighting} onChange={v => handlePromptChange('lighting', v)} isTextarea rows={4} placeholder="e.g., High-altitude daylight, soft fill light..." />
                                </div>
                            </>
                        )}

                        {activeTab === 'aesthetics' && (
                            <>
                                <div className="dna-field">
                                    <label>Surfaces & Materials</label>
                                    <p className="field-helper">What surfaces and materials are visible in the scene?</p>
                                    <EditableMarkdown value={prompt.surfacesMaterials} onChange={v => handlePromptChange('surfacesMaterials', v)} isTextarea rows={4} placeholder="e.g., Powdery fresh snow, rugged granite..." />
                                </div>
                                <div className="dna-field">
                                    <label>Style DNA</label>
                                    <p className="field-helper">Keywords defining the overall aesthetic style.</p>
                                    <EditableMarkdown value={prompt.styleDNA} onChange={v => handlePromptChange('styleDNA', v)} isTextarea rows={3} placeholder="e.g., Cinematic, high-fashion, editorial..." />
                                </div>
                                <div className="dna-field">
                                    <label>Color Palette</label>
                                    <ChipInput chips={prompt.colorPalette || []} onChange={v => handlePromptChange('colorPalette', v)} />
                                </div>
                            </>
                        )}
                        
                        {activeTab === 'advanced' && (
                             <>
                                <div className="dna-field">
                                    <label>Realism Keywords</label>
                                    <ChipInput chips={prompt.realism || []} onChange={v => handlePromptChange('realism', v)} suggestions={['hyperrealistic texture', '8k resolution', 'optical clarity']} />
                                </div>
                                <div className="dna-field">
                                    <label>Imperfections</label>
                                    <p className="field-helper">Keywords to add realism and avoid a sterile AI look.</p>
                                    <ChipInput chips={prompt.imperfections || []} onChange={v => handlePromptChange('imperfections', v)} suggestions={['Film grain', 'Lens flare', 'Subtle motion blur']} />
                                </div>
                                <div className="dna-field">
                                    <label>Negative Prompting</label>
                                    <p className="field-helper">Keywords for things to explicitly avoid in the generation.</p>
                                    <EditableMarkdown value={prompt.negativePrompting} onChange={v => handlePromptChange('negativePrompting', v)} isTextarea rows={3} placeholder="e.g., no text, no logos, avoid oversaturation..." />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="modal-actions">
                <button className="button-secondary" onClick={onClose}>Cancel</button>
                <button className="button-primary" onClick={handleSave}>Save Style</button>
            </div>
        </Modal>
    )
}