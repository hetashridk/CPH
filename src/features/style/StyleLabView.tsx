import React, { useState, useEffect } from 'react';
import { IconButton, ICONS } from '../../core/components/IconButton';
import { Modal } from '../../core/components/Modal';
import { DeleteConfirmationView } from '../../core/components/DeleteConfirmationView';
import type { StylePreset, Product, SystemInstructions, View } from '../../core/types';
import { emptyPrompt } from '../../core/utils/prompts';
import { StyleCreatorMode } from './StyleCreatorView';

// Helper function to create a descriptive snippet from the prompt
const getPromptSnippet = (prompt: StylePreset['prompt']): string => {
    // Defensive check: if prompt is missing or not an object, return an empty string.
    if (!prompt || typeof prompt !== 'object') {
        return '';
    }
    const parts = [
        prompt.styleDNA,
        prompt.lighting,
        prompt.environment,
    ];
    const snippet = parts.filter(Boolean).join(' · ');
    return snippet.length > 100 ? snippet.substring(0, 97) + '...' : snippet;
};

export const StyleLabView: React.FC<{
    stylePresets: StylePreset[];
    onAddPreset: (preset: Omit<StylePreset, 'id'>, contextSubject?: string) => void;
    onUpdatePreset: (id: string, preset: Partial<Omit<StylePreset, 'id'>>) => void;
    onAddMultiplePresets: (presets: Omit<StylePreset, 'id'>[], contextSubject?: string) => Promise<void>;
    onDeletePreset: (id: string) => Promise<void>;
    products: Product[];
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PROMPT_FROM_IDEA: number, STYLE_FROM_IMAGE: number, PROMPT_IDEAS: number };
    systemInstructions: SystemInstructions;
    setView: (view: View) => void;
    onStartCreator: (mode: StyleCreatorMode, preset?: StylePreset) => void;
}> = ({
    stylePresets, onAddPreset, onUpdatePreset, onAddMultiplePresets, onDeletePreset, products,
    deductCredits, CREDIT_COSTS, setView, onStartCreator
}) => {
        const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
        const [draggedPresetIds, setDraggedPresetIds] = useState<string[] | null>(null);
        const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

        // Deletion Confirmation Modal State
        const [deleteConfirm, setDeleteConfirm] = useState<{
            isOpen: boolean;
            ids: string[];
            title: string;
            message: string;
        }>({ isOpen: false, ids: [], title: '', message: '' });

        // Duplicate Confirmation Modal State
        const [duplicateConfirm, setDuplicateConfirm] = useState<{
            isOpen: boolean;
            ids: string[];
            title: string;
            message: string;
        }>({ isOpen: false, ids: [], title: '', message: '' });

        const [isDuplicating, setIsDuplicating] = useState(false);

        const handleEditPreset = (preset: StylePreset) => {
            onStartCreator('manual', preset);
        };

        const handleAddNew = () => {
            onStartCreator('manual');
        };

        const togglePresetSelection = (presetId: string) => {
            setSelectedPresetIds(prev => prev.includes(presetId) ? prev.filter(id => id !== presetId) : [...prev, presetId]);
        };

        const handleDragStart = (e: React.DragEvent, presetId: string) => {
            const idsToDrag = selectedPresetIds.includes(presetId) ? selectedPresetIds : [presetId];
            setDraggedPresetIds(idsToDrag);
            e.dataTransfer.setData('text/plain', JSON.stringify(idsToDrag));
            e.dataTransfer.effectAllowed = 'move';
        };

        const handleSelectInverse = () => {
            const allVisibleIds = new Set(stylePresets.map(p => p.id));
            const currentSelected = new Set(selectedPresetIds);
            const inverseSelection = [...allVisibleIds].filter(id => !currentSelected.has(id));
            setSelectedPresetIds(inverseSelection);
        };

        // --- Delete Logic ---
        const confirmDeleteSelected = () => {
            setDeleteConfirm({
                isOpen: true,
                ids: [...selectedPresetIds],
                title: 'Delete Styles',
                message: `Are you sure you want to permanently delete ${selectedPresetIds.length} selected style(s)? This action cannot be undone.`
            });
        };

        const confirmDeletePreset = (id: string, name: string) => {
            setDeleteConfirm({
                isOpen: true,
                ids: [id],
                title: 'Delete Style',
                message: `Are you sure you want to delete style "${name}"?`
            });
        };

        const handleExecuteDelete = async () => {
            const { ids } = deleteConfirm;
            setDeleteConfirm(prev => ({ ...prev, isOpen: false }));

            setDeletingIds(prev => {
                const next = new Set(prev);
                ids.forEach(id => next.add(id));
                return next;
            });

            try {
                await Promise.all(ids.map(id => onDeletePreset(id)));
                setSelectedPresetIds(prev => prev.filter(selectedId => !ids.includes(selectedId)));
            } catch (error) {
                console.error("Failed to delete preset(s)", error);
                alert("Failed to delete preset(s). Please try again.");
            } finally {
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    ids.forEach(id => next.delete(id));
                    return next;
                });
            }
        };

        // --- Duplicate Logic ---
        const confirmDuplicateSelected = () => {
            setDuplicateConfirm({
                isOpen: true,
                ids: [...selectedPresetIds],
                title: 'Duplicate Styles',
                message: `Are you sure you want to create copies of the ${selectedPresetIds.length} selected style(s)?`
            });
        };

        const confirmDuplicatePreset = (id: string, name: string) => {
            setDuplicateConfirm({
                isOpen: true,
                ids: [id],
                title: 'Duplicate Style',
                message: `Are you sure you want to create a copy of style "${name}"?`
            });
        };

        const handleExecuteDuplicate = async () => {
            const { ids } = duplicateConfirm;
            setIsDuplicating(true);

            const presetsToDuplicate = stylePresets.filter(p => ids.includes(p.id));

            const newPresets = presetsToDuplicate.map(p => {
                const { id, ...rest } = p;
                return {
                    ...rest,
                    name: `${p.name} (Copy)`,
                    prompt: p.prompt || emptyPrompt(),
                    status: 'complete' as const,
                    // Ensure we don't pass undefined, cleaner logic handles this in onAddMultiplePresets now
                    previewSubject: p.previewSubject || undefined
                };
            });

            try {
                if (newPresets.length > 0) {
                    await onAddMultiplePresets(newPresets);
                    if (ids.length > 1) {
                        setSelectedPresetIds([]);
                    }
                }
                setDuplicateConfirm(prev => ({ ...prev, isOpen: false }));
            } catch (error) {
                console.error("Failed to duplicate presets:", error);
                alert("Failed to duplicate presets. Please check the console for details.");
            } finally {
                setIsDuplicating(false);
            }
        };

        const handleRetry = (preset: StylePreset) => {
            onUpdatePreset(preset.id, { ...preset, status: 'pending_image', statusLastUpdatedAt: new Date().toISOString() });
        };

        if (deleteConfirm.isOpen) {
            return (
                <DeleteConfirmationView
                    title={deleteConfirm.title}
                    message={deleteConfirm.message}
                    onCancel={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
                    onConfirm={handleExecuteDelete}
                    confirmText="Yes, Delete"
                />
            );
        }

        if (duplicateConfirm.isOpen) {
            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    <div style={{
                        background: 'rgba(10, 10, 10, 0.2)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        flex: 1, width: '100%', gap: '32px', textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </div>
                        <div style={{ maxWidth: '500px' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--text-main)' }}>{duplicateConfirm.title}</h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{duplicateConfirm.message}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                            <button className="button-secondary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={() => setDuplicateConfirm(prev => ({ ...prev, isOpen: false }))} disabled={isDuplicating}>Cancel</button>
                            <button className="button-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={handleExecuteDuplicate} disabled={isDuplicating}>
                                {isDuplicating ? 'Duplicating...' : 'Yes, Duplicate'}
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="view-container">
                <div className="view-header">
                    <div>
                        <h2>Style Lab</h2>
                        <p className="view-header-subtitle">Design and manage reusable visual styles for your assets.</p>
                    </div>
                    <div className="view-header-actions">
                        <button onClick={() => onStartCreator('text')}>Create from Text</button>
                        <button onClick={() => onStartCreator('image')}>Create from Image</button>
                        <button className="button-primary" onClick={handleAddNew}>+ New Style</button>
                    </div>
                </div>
                {selectedPresetIds.length > 0 && (
                    <div style={{
                        marginTop: '24px', marginBottom: '32px',
                        background: 'linear-gradient(90deg, var(--primary-color) 0%, #14b8a6 100%)',
                        borderRadius: '16px',
                        padding: '0 24px',
                        height: '64px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#000', // Black text on bright teal
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(45, 212, 191, 0.3)'
                    }}>
                        <span style={{ fontSize: '1rem' }}>{selectedPresetIds.length} selected</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="button" onClick={() => setSelectedPresetIds(stylePresets.map(p => p.id))}
                                style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: '#000', fontWeight: 600, fontSize: '0.85rem' }}>Select All</button>
                            <button className="button" onClick={handleSelectInverse}
                                style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: '#000', fontWeight: 600, fontSize: '0.85rem' }}>Inverse</button>
                            <button className="button" onClick={confirmDuplicateSelected}
                                style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: '#000', fontWeight: 600, fontSize: '0.85rem' }}>Duplicate</button>
                            <button className="button" onClick={confirmDeleteSelected}
                                style={{ background: 'rgba(220, 38, 38, 0.1)', border: 'none', color: '#991b1b', fontWeight: 700, fontSize: '0.85rem' }}>Delete</button>
                            <button className="button" onClick={() => setSelectedPresetIds([])}
                                style={{ background: 'transparent', border: 'none', color: '#000', opacity: 0.6, fontWeight: 600, fontSize: '0.85rem' }}>Clear</button>
                        </div>
                    </div>
                )}
                <div className="style-lab-main-content">
                    {stylePresets.length === 0 ? (
                        <div className="empty-state" onClick={() => onStartCreator('text')}>
                            {ICONS.sparkles}
                            <h3>Your Style Lab is empty</h3>
                            <p>A Style is a reusable prompt for generating images. Click here to create your first style using AI tools.</p>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {stylePresets.map(preset => {
                                const isProcessing = preset.status === 'generating_image' || preset.status === 'pending_image';
                                const isFailed = preset.status === 'failed';
                                const isDeleting = deletingIds.has(preset.id);
                                const isSelected = selectedPresetIds.includes(preset.id);
                                const isDragged = draggedPresetIds?.includes(preset.id);
                                const imageUrl = preset.referenceImages?.[0] || '';

                                return (
                                    <div key={preset.id} draggable onDragStart={(e) => handleDragStart(e, preset.id)}
                                        className={`preset-card ${isSelected ? 'selected' : ''} ${isDragged ? 'dragging' : ''}`}
                                        onClick={() => !isProcessing && !isDeleting && togglePresetSelection(preset.id)}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '16px',
                                            gap: '16px',
                                            background: isSelected
                                                ? 'rgba(45, 212, 191, 0.05)'
                                                : 'rgba(255, 255, 255, 0.03)',
                                            backdropFilter: 'blur(20px)',
                                            WebkitBackdropFilter: 'blur(20px)',
                                            borderRadius: '24px',
                                            border: isSelected
                                                ? '2px solid var(--primary-color)'
                                                : '1px solid rgba(255, 255, 255, 0.08)',
                                            boxShadow: isSelected
                                                ? '0 0 30px rgba(45, 212, 191, 0.15)'
                                                : '0 4px 20px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            height: '100%'
                                        }}
                                    >
                                        {/* Selection Badge - Top Right */}
                                        {isSelected && !isProcessing && (
                                            <div style={{
                                                position: 'absolute', top: '24px', right: '24px', width: '24px', height: '24px',
                                                background: 'var(--primary-color)', borderRadius: '50%', zIndex: 10,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </div>
                                        )}

                                        {/* Image Container */}
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            background: 'var(--bg-surface)'
                                        }}>
                                            {preset.status === 'complete' && imageUrl ? (
                                                <img src={imageUrl} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{
                                                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                                    color: 'var(--text-tertiary)', gap: '8px', padding: '16px', textAlign: 'center'
                                                }}>
                                                    {isFailed ? (
                                                        <span style={{ color: 'var(--danger)' }}>Generation Failed</span>
                                                    ) : isProcessing ? (
                                                        <span>{preset.status === 'generating_image' ? 'Generating...' : 'Queued...'}</span>
                                                    ) : (
                                                        <>
                                                            <div style={{
                                                                width: '48px', height: '48px', borderRadius: '50%',
                                                                background: 'rgba(255,255,255,0.05)', display: 'flex',
                                                                alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
                                                            }}>
                                                                {ICONS.styles}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Style Preset</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {(isProcessing || isDeleting) && (
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', gap: '8px' }}>
                                                    <span className="spinner"></span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{isDeleting ? 'Deleting...' : 'Creating...'}</span>
                                                </div>
                                            )}

                                            {isFailed && (
                                                <div style={{ position: 'absolute', bottom: '16px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
                                                    <button className="button-secondary small" onClick={(e) => { e.stopPropagation(); handleRetry(preset); }}>Retry</button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <h4 style={{
                                                margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {preset.name}
                                            </h4>
                                            <p style={{
                                                margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                {getPromptSnippet(preset.prompt) || 'No style details available.'}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {!isDeleting && (
                                            <div style={{
                                                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px',
                                                marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                <IconButton icon="edit" tooltip="Edit" onClick={(e) => { e.stopPropagation(); handleEditPreset(preset) }} size="small" />
                                                <IconButton icon="copy" tooltip="Duplicate" onClick={(e) => { e.stopPropagation(); confirmDuplicatePreset(preset.id, preset.name) }} size="small" />
                                                <IconButton icon="delete" tooltip="Delete" danger onClick={(e) => { e.stopPropagation(); confirmDeletePreset(preset.id, preset.name) }} size="small" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };