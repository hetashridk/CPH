import React, { useState, useMemo, useEffect } from 'react';
import type { Product, GeneratedImage, ModularPrompt, ReposeIdeaSet, ImageSize } from '../../core/types';
import { usePersistentState } from '../../core/hooks/usePersistentState';
import { Select } from '../../core/components/Select';
import { generateId } from '../../core/utils/misc';
import { refineGeneratedImage } from './imageGeneration.service';
import { ICONS, IconButton } from '../../core/components/IconButton';
import { EmptyState } from '../../core/components/EmptyState';
import { emptyPrompt } from '../../core/utils/prompts';

type Idea = {
    id: string;
    text: string;
    checked: boolean;
};

export const ReposeView: React.FC<{
    products: Product[];
    onAddGeneratedImage: (productId: string, imageData: string, mimeType: string, prompt: ModularPrompt, source: 'repose', batchId: undefined, presetId: undefined, quality: ImageSize) => Promise<string>;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { IMAGE_REFINEMENT: number };
}> = ({ products, onAddGeneratedImage, deductCredits, CREDIT_COSTS }) => {

    const [allGeneratedImages, setAllGeneratedImages] = useState<(GeneratedImage & { productName: string })[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedImage, setSelectedImage] = useState<(GeneratedImage & { productName: string }) | null>(null);
    const [imageSize, setImageSize] = useState<ImageSize>('4K');

    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [newIdeaText, setNewIdeaText] = useState('');

    const [ideaSets, setIdeaSets] = usePersistentState<ReposeIdeaSet[]>('repose_idea_sets_v3', []);
    const [newSetName, setNewSetName] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResults, setGeneratedResults] = useState<{ url: string; prompt: string }[]>([]);
    const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        const images = products.flatMap(p =>
            p.generatedImages.map(img => ({ ...img, productName: p.name }))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllGeneratedImages(images);
    }, [products]);

    const filteredImages = useMemo(() => {
        if (!searchTerm) return allGeneratedImages;
        return allGeneratedImages.filter(img =>
            img.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allGeneratedImages, searchTerm]);

    const activeIdeas = useMemo(() => ideas.filter(i => i.checked && i.text.trim()), [ideas]);

    // Cost logic
    const costPerImage = imageSize === '4K' ? 4 : imageSize === '2K' ? 2 : 1;
    const cost = activeIdeas.length * costPerImage;

    const handleSelectImage = (image: GeneratedImage & { productName: string }) => {
        setSelectedImage(image);
        setGeneratedResults([]);
    };

    const handleAddNewIdea = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (newIdeaText.trim()) {
            setIdeas(prev => [...prev, { id: generateId(), text: newIdeaText.trim(), checked: true }]);
            setNewIdeaText('');
        }
    };

    const handleIdeaChange = (id: string, newText: string) => {
        setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, text: newText } : idea));
    };

    const handleToggleIdea = (id: string) => {
        setIdeas(prev => prev.map(idea => idea.id === id ? { ...idea, checked: !idea.checked } : idea));
    };

    const handleRemoveIdea = (id: string) => {
        setIdeas(prev => prev.filter(idea => idea.id !== id));
    };

    const handleSaveSet = () => {
        if (!newSetName.trim()) {
            alert('Please enter a name for the idea set.');
            return;
        }
        const ideaTexts = ideas.map(i => i.text);
        const ideasToSave: [string, string, string, string, string] = [
            ideaTexts[0] || '', ideaTexts[1] || '', ideaTexts[2] || '', ideaTexts[3] || '', ideaTexts[4] || ''
        ];

        const newSet: ReposeIdeaSet = { id: generateId(), name: newSetName.trim(), ideas: ideasToSave };
        setIdeaSets(prev => [...prev.filter(s => s.name !== newSetName.trim()), newSet]);
        alert(`Idea set "${newSet.name}" saved!`);
    };

    const handleLoadSet = (setId: string) => {
        const setToLoad = ideaSets.find(s => s.id === setId);
        if (setToLoad) {
            setIdeas(setToLoad.ideas.filter(text => text).map(text => ({ id: generateId(), text, checked: true })));
            setNewSetName(setToLoad.name);
        }
    };

    const handleGenerate = async () => {
        if (!selectedImage || activeIdeas.length === 0) return;
        if (!deductCredits(cost)) return;

        setIsGenerating(true);
        setGeneratedResults([]);

        const originalProduct = products.find(p => p.id === selectedImage.productId);
        if (!originalProduct) {
            alert("Could not find the original product for this image.");
            setIsGenerating(false);
            return;
        }

        setGenerationProgress({ current: 0, total: activeIdeas.length });

        for (const idea of activeIdeas) {
            try {
                const result = await refineGeneratedImage(selectedImage.imageData, idea.text, originalProduct.aspectRatio, imageSize);
                const newPrompt: ModularPrompt = { ...(selectedImage.prompt || emptyPrompt()), storyline: `${selectedImage.prompt?.storyline || ''} (Reposed: ${idea.text})` };
                await onAddGeneratedImage(selectedImage.productId, result.imageData, result.mimeType, newPrompt, 'repose', undefined, undefined, imageSize);
                setGeneratedResults(prev => [...prev, { url: `data:${result.mimeType};base64,${result.imageData}`, prompt: idea.text }]);
            } catch (err) {
                console.error(`Repose generation failed for idea: "${idea.text}"`, err);
            } finally {
                setGenerationProgress(prev => ({ ...prev, current: prev.current + 1 }));
            }
        }

        setIsGenerating(false);
    };

    const hasResults = generatedResults.length > 0;

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Repose Studio</h2>
                    <p className="view-header-subtitle">Generate creative variations of an existing asset.</p>
                </div>
            </div>

            <div className="repose-layout">
                <div className="repose-image-selection-column" style={{
                    background: 'rgba(10, 10, 10, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '24px',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>1. Select Source Asset</label>
                        <input
                            type="search"
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    {filteredImages.length > 0 ? (
                        <div className="repose-image-grid" style={{ paddingBottom: '20px' }}>
                            {filteredImages.map(img => (
                                <div
                                    key={img.id}
                                    className={`repose-image-card ${selectedImage?.id === img.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectImage(img)}
                                    style={{
                                        aspectRatio: '1/1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedImage?.id === img.id ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedImage?.id === img.id ? '0 0 20px rgba(45, 212, 191, 0.2)' : 'none'
                                    }}
                                >
                                    <img src={img.imageData} alt={img.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                    <div className="product-name-overlay" style={{
                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                        padding: '8px 12px',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                        color: '#fff', fontSize: '0.8rem', fontWeight: 500,
                                        opacity: selectedImage?.id === img.id ? 1 : 0,
                                        transition: 'opacity 0.2s'
                                    }}>{img.productName}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No Generated Images" message="Generate some images in the Workshop first to use the Repose tool." />
                    )}
                </div>

                <div className="repose-config-column" style={{
                    width: '420px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    <div className="repose-config-panel" style={{
                        flex: 1,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <div className="repose-config-content" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>

                            <div className="section-block" style={{ marginBottom: '32px' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>Selected Asset</div>
                                <div className="repose-selected-image-preview" style={{
                                    width: '100%', aspectRatio: '16/9',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '16px',
                                    border: '1px dashed rgba(255,255,255,0.1)',
                                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {selectedImage ? (
                                        <img src={selectedImage.imageData} alt="Selected" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            <span>Select an image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="section-block" style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>2. Settings</label>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Output Resolution</span>
                                    <div className="aspect-ratio-selector" style={{ display: 'flex', gap: '8px' }}>
                                        {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setImageSize(size)}
                                                disabled={isGenerating}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: imageSize === size ? '1px solid var(--primary-color)' : '1px solid transparent',
                                                    background: imageSize === size ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255,255,255,0.05)',
                                                    color: imageSize === size ? 'var(--primary-color)' : 'var(--text-secondary)',
                                                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="section-block" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>3. Creative Variations</label>

                                <form onSubmit={handleAddNewIdea} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                    <input
                                        type="text"
                                        value={newIdeaText}
                                        onChange={e => setNewIdeaText(e.target.value)}
                                        placeholder="Add a new variation idea..."
                                        disabled={isGenerating}
                                        style={{
                                            flex: 1,
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '10px',
                                            padding: '0 16px', height: '42px', color: 'var(--text-main)'
                                        }}
                                    />
                                    <button type="submit" className="button-primary" disabled={isGenerating || !newIdeaText.trim()} style={{ width: 'auto', padding: '0 20px' }}>Add</button>
                                </form>

                                <div className="repose-ideas-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px', overflowX: 'hidden' }}>
                                    {ideas.map((idea) => (
                                        <div key={idea.id} className="repose-idea-row" style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px', background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '10px',
                                            border: '1px solid var(--glass-border-light)',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}>
                                            <input type="checkbox" checked={idea.checked} onChange={() => handleToggleIdea(idea.id)} disabled={isGenerating} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                value={idea.text}
                                                onChange={e => handleIdeaChange(idea.id, e.target.value)}
                                                disabled={isGenerating}
                                                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', minWidth: 0 }}
                                            />
                                            <IconButton icon="close" tooltip="Remove" onClick={() => handleRemoveIdea(idea.id)} disabled={isGenerating} />
                                        </div>
                                    ))}
                                    {ideas.length === 0 && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.9rem', fontStyle: 'italic', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
                                            No ideas yet. Add one above!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="repose-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Cost</span>
                                <div style={{
                                    background: 'rgba(45, 212, 191, 0.1)',
                                    color: 'var(--primary-color)',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em'
                                }}>
                                    {cost} CREDITS
                                </div>
                            </div>
                            <button
                                className="button-primary button-full-width"
                                onClick={handleGenerate}
                                disabled={!selectedImage || activeIdeas.length === 0 || isGenerating}
                                style={{ height: '48px', fontSize: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="spinner small" style={{ borderTopColor: 'currentColor', borderRightColor: 'transparent', borderBottomColor: 'currentColor', borderLeftColor: 'transparent' }}></div>
                                        <span>Items Generating...</span>
                                    </>
                                ) : (
                                    `Generate ${activeIdeas.length} Variations`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};