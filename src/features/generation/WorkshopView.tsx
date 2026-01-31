
import React, { useState, useMemo, useEffect } from 'react';
import type { Product, StylePreset, ModularPrompt, View, SystemInstructions, AspectRatio, ImageSize } from '../../core/types';
import { generateProductionImage, compilePrompt } from './imageGeneration.service';
import { Select } from '../../core/components/Select';
import { IconButton, ICONS } from '../../core/components/IconButton';
import { EditableMarkdown } from '../../core/components/Modal';
import { ImageMagnifier } from '../../core/components/ImageMagnifier';

// --- Helper Components ---

const AspectRatioSelector: React.FC<{
    value: AspectRatio;
    onChange: (ratio: AspectRatio) => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
    const ratios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {ratios.map(ratio => {
                const isActive = value === ratio;
                return (
                    <button
                        key={ratio}
                        onClick={() => onChange(ratio)}
                        disabled={disabled}
                        style={{
                            padding: '10px 0',
                            borderRadius: '10px',
                            border: isActive ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        {ratio}
                    </button>
                );
            })}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {sizes.map(size => {
                const isActive = value === size;
                return (
                    <button
                        key={size}
                        onClick={() => onChange(size)}
                        disabled={disabled}
                        style={{
                            padding: '10px 0',
                            borderRadius: '10px',
                            border: isActive ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.03)',
                            color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            opacity: disabled ? 0.5 : 1,
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        {size}
                    </button>
                );
            })}
        </div>
    );
};

const SelectionPreview: React.FC<{
    imageUrl?: string;
    title: string;
    subtitle: string;
    onClear?: () => void;
}> = ({ imageUrl, title, subtitle, onClear }) => (
    <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginTop: '12px',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 100%)', pointerEvents: 'none' }} />

        <div style={{
            width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
            background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {imageUrl ? (
                <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ color: 'var(--text-light)', opacity: 0.5 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
            )}
        </div>
        <div style={{ flexGrow: 1, minWidth: 0, zIndex: 1, paddingTop: '2px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px', lineHeight: '1.2' }}>{title}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{subtitle}</div>
        </div>
        {onClear && (
            <div style={{ zIndex: 1, marginLeft: '-8px', marginTop: '-8px' }}>
                <IconButton icon="close" tooltip="Clear Selection" onClick={(e) => { e.stopPropagation(); onClear(); }} />
            </div>
        )}
    </div>
);

// --- Main Component ---

export const WorkshopView: React.FC<{
    products: Product[];
    stylePresets: StylePreset[];
    onAddGeneratedImage: (productId: string, imageData: string, mimeType: string, prompt: ModularPrompt, source: 'workshop', stylePresetId?: string, quality?: ImageSize) => Promise<any>;
    addGenerationLog: (logData: any) => void;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { IMAGE_GENERATION: number };
    systemInstructions: SystemInstructions;
    setView: (view: View) => void;
}> = ({ products, stylePresets, onAddGeneratedImage, addGenerationLog, deductCredits, CREDIT_COSTS, setView }) => {

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [imageSize, setImageSize] = useState<ImageSize>('4K');
    const [customInstruction, setCustomInstruction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<{ url: string, data: string, mime: string, prompt: ModularPrompt, quality: ImageSize } | null>(null);
    const [showPromptPreview, setShowPromptPreview] = useState(false);
    const [compiledPrompt, setCompiledPrompt] = useState<ModularPrompt | null>(null);

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

    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);
    const selectedPreset = useMemo(() => stylePresets.find(p => p.id === selectedPresetId), [stylePresets, selectedPresetId]);

    // Cost logic
    const currentCost = imageSize === '4K' ? 4 : imageSize === '2K' ? 2 : 1;

    // Update aspect ratio when product changes (optional preference)
    useEffect(() => {
        if (selectedProduct) {
            setAspectRatio(selectedProduct.aspectRatio);
        }
    }, [selectedProduct]);

    // Live compilation of prompt for preview
    useEffect(() => {
        const compile = async () => {
            if (selectedProduct && selectedPreset) {
                const prompt = await compilePrompt(selectedProduct, selectedPreset);
                setCompiledPrompt(prompt);
            } else {
                setCompiledPrompt(null);
            }
        };
        compile();
    }, [selectedProduct, selectedPreset]);

    const handleGenerate = async () => {
        if (!selectedProduct || !selectedPreset) return;

        if (!deductCredits(currentCost)) return;

        setIsLoading(true);
        setGeneratedImage(null);
        const startTime = Date.now();

        try {
            const { imageData, mimeType } = await generateProductionImage(
                selectedProduct,
                selectedPreset,
                aspectRatio,
                imageSize,
                customInstruction
            );

            const imageUrl = `data:${mimeType};base64,${imageData}`;

            // Re-compile to capture exact state at generation time
            const finalPrompt = await compilePrompt(selectedProduct, selectedPreset);

            // AUTO-SAVE: Automatically save to Firestore assets
            await onAddGeneratedImage(
                selectedProduct.id,
                imageData,
                mimeType,
                finalPrompt,
                'workshop',
                selectedPreset.id,
                imageSize
            );

            setGeneratedImage({
                url: imageUrl,
                data: imageData,
                mime: mimeType,
                prompt: finalPrompt,
                quality: imageSize
            });

            addGenerationLog({
                productName: selectedProduct.name,
                status: 'success',
                duration: Date.now() - startTime,
                action: 'Workshop Generation',
                cost: currentCost,
            });

        } catch (error) {
            console.error("Workshop generation failed:", error);
            alert("Image generation failed. Please try again or check your credit balance.");
            addGenerationLog({
                productName: selectedProduct.name,
                status: 'failure',
                duration: Date.now() - startTime,
                action: 'Workshop Generation',
                cost: 0,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Production Workshop</h2>
                    <p className="view-header-subtitle">High-fidelity 4K image generation with precise control.</p>
                </div>
                {generatedImage && (
                    <div className="view-header-actions">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginRight: 'var(--space-4)',
                            color: 'var(--success)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            animation: 'fadeIn 0.5s'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span>Saved to Assets</span>
                        </div>
                        <button className="button-primary" onClick={() => setGeneratedImage(null)}>New Generation</button>
                    </div>
                )}
            </div>

            <div className="workshop-container">
                {/* --- Left Sidebar: Configuration --- */}
                <div className="workshop-sidebar">
                    <div className="workshop-config-scroll">

                        {/* 1. Subject */}
                        <section style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>1. Subject</label>
                            <Select
                                value={selectedProductId || ''}
                                onChange={setSelectedProductId}
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select Product..."
                                disabled={isLoading}
                                triggerStyle={glassInputStyle}
                            />
                            {selectedProduct && (
                                <SelectionPreview
                                    title={selectedProduct.name}
                                    subtitle={selectedProduct.description}
                                    imageUrl={selectedProduct.sourceImages[0]?.data}
                                />
                            )}
                        </section>

                        {/* 2. Aesthetic */}
                        <section style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>2. Aesthetic</label>
                            <Select
                                value={selectedPresetId || ''}
                                onChange={setSelectedPresetId}
                                options={stylePresets.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select Style Preset..."
                                disabled={isLoading}
                                triggerStyle={glassInputStyle}
                            />
                            {selectedPreset && (
                                <SelectionPreview
                                    title={selectedPreset.name}
                                    subtitle="Style Preset"
                                    imageUrl={selectedPreset.referenceImages?.[0]}
                                />
                            )}
                        </section>

                        {/* 3. Format */}
                        <section style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>3. Format & Quality</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <AspectRatioSelector
                                    value={aspectRatio}
                                    onChange={setAspectRatio}
                                    disabled={isLoading}
                                />
                                <ResolutionSelector
                                    value={imageSize}
                                    onChange={setImageSize}
                                    disabled={isLoading}
                                />
                            </div>
                        </section>

                        {/* 4. Direction */}
                        <section style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>4. Creative Overlay (Optional)</label>
                            <p className="field-helper" style={{ marginBottom: 'var(--space-2)' }}>Add specific details or overrides to the scene.</p>
                            <EditableMarkdown
                                value={customInstruction}
                                onChange={setCustomInstruction}
                                isTextarea
                                rows={3}
                                placeholder="e.g., 'Ensure the background is out of focus', 'Add a splash of water'"
                                disabled={isLoading}
                                style={glassInputStyle}
                            />
                        </section>

                        {/* Prompt DNA Inspector */}
                        {compiledPrompt && (
                            <section style={{ marginBottom: '40px' }}>
                                <div
                                    className="prompt-preview-toggle"
                                    onClick={() => setShowPromptPreview(!showPromptPreview)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}
                                >
                                    <span>{showPromptPreview ? 'Hide' : 'Show'} Compiled Prompt DNA</span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showPromptPreview ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
                                </div>
                                {showPromptPreview && (
                                    <div className="prompt-preview-box" style={{
                                        marginTop: '16px',
                                        padding: '20px',
                                        background: 'rgba(0,0,0,0.4)',
                                        border: '1px solid var(--glass-border-light)',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        {Object.entries(compiledPrompt).map(([key, val]) => {
                                            if (!val || (Array.isArray(val) && val.length === 0)) return null;
                                            return (
                                                <div key={key} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span style={{
                                                        color: 'var(--primary-color)',
                                                        fontWeight: 600,
                                                        fontFamily: 'var(--font-mono)',
                                                        fontSize: '0.8rem',
                                                        letterSpacing: '0.02em',
                                                        opacity: 0.9
                                                    }}>{key}</span>
                                                    <span style={{
                                                        color: 'var(--text-secondary)',
                                                        lineHeight: '1.6',
                                                        paddingLeft: '12px',
                                                        borderLeft: '2px solid rgba(255,255,255,0.1)'
                                                    }}>
                                                        {Array.isArray(val) ? val.join(', ') : val}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="workshop-footer">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Est. Cost</span>
                            <span className="token-badge">{currentCost} Credits</span>
                        </div>
                        <button
                            className="button-primary button-full-width large"
                            onClick={handleGenerate}
                            disabled={!selectedProductId || !selectedPresetId || isLoading}
                        >
                            {isLoading ? 'Processing...' : `Generate ${imageSize} Asset`}
                        </button>
                    </div>
                </div>

                {/* --- Right Main: Stage --- */}
                {/* --- Right Main: Stage --- */}
                <div className="workshop-stage" style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    <div className="stage-header" style={{
                        height: '60px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 24px'
                    }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
                            {generatedImage ? 'Generated Result' : 'Canvas'}
                        </span>
                        {generatedImage && <span className="token-badge">{generatedImage.quality} Resolution</span>}
                    </div>

                    <div className="stage-content" style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundImage: 'radial-gradient(circle at center, rgba(20, 20, 30, 0.4) 0%, rgba(0, 0, 0, 0.8) 100%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                        backgroundPosition: '0 0, -1px -1px, -1px -1px'
                    }}>
                        {isLoading ? (
                            <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>Synthesizing Image</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Merging Product DNA with Style settings...</p>
                                </div>
                            </div>
                        ) : generatedImage ? (
                            <ImageMagnifier src={generatedImage.url} alt="Generated Asset" />
                        ) : (
                            <div className="empty-stage-state" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                                <div style={{
                                    marginBottom: '24px',
                                    opacity: 0.8,
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                                }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em' }}>Ready to Create</h3>
                                <p style={{ maxWidth: '280px', margin: '0 auto', fontSize: '0.95rem', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
                                    Configure your subject, aesthetic, and quality settings on the left to begin generation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};