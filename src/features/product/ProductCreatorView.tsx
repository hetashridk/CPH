import React, { useState, useEffect, useMemo } from 'react';
import { autoGroupImages } from './productAnalysis.service';

// Thumbnail Component for reusability
const ImageThumbnail: React.FC<{
    imageUrl: string;
    index: number;
    isSelected: boolean;
    isDragged: boolean;
    onClick: () => void;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragEnd: () => void;
}> = ({ imageUrl, index, isSelected, isDragged, onClick, onDragStart, onDragEnd }) => (
    <div
        style={{
            width: '64px',
            height: '64px',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            cursor: 'move',
            border: isSelected ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
            opacity: isDragged ? 0.5 : 1,
            transition: 'all 0.1s ease',
            boxShadow: isSelected ? '0 0 0 2px rgba(var(--primary-rgb), 0.3)' : 'none'
        }}
        onClick={onClick}
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragEnd={onDragEnd}
    >
        <img
            src={imageUrl}
            alt={`Upload ${index + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {isSelected && (
            <div style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '16px',
                height: '16px',
                background: 'var(--primary-color)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#fff'
            }}>✓</div>
        )}
    </div>
);

export const ProductCreatorView: React.FC<{
    images: { url: string; data: string }[];
    onConfirm: (groups: number[][], guidance: string) => void;
    onCancel: () => void;
}> = ({ images, onConfirm, onCancel }) => {
    const [groups, setGroups] = useState<number[][]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [aiGuidance, setAiGuidance] = useState('');

    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<{ type: 'group' | 'unsorted'; index: number } | null>(null);

    // Initialize state when component mounts or images change
    useEffect(() => {
        setGroups(images.map((_, i) => [i]));
        setSelectedIndices([]);
        setAiGuidance('');
    }, [images]);

    // Derived state for rendering
    const { groupedBins, ungroupedIndices } = useMemo(() => {
        const bins: number[][] = [];
        const ungrouped: number[] = [];
        groups.forEach(group => {
            if (group.length > 1) {
                bins.push(group);
            } else if (group.length === 1) {
                ungrouped.push(group[0]);
            }
        });
        return { groupedBins: bins, ungroupedIndices: ungrouped.sort((a, b) => a - b) };
    }, [groups]);

    const toggleSelection = (index: number) => {
        if (!ungroupedIndices.includes(index)) return;
        setSelectedIndices(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleGroupSelected = () => {
        if (selectedIndices.length < 2) return;
        // Remove selected indices from their single-item groups
        const newGroups = groups.filter(g => g.length > 1 || !selectedIndices.includes(g[0]));
        // Add a new group with the selected indices
        newGroups.push(selectedIndices);
        setGroups(newGroups);
        setSelectedIndices([]);
    };

    const handleResetGrouping = () => {
        if (window.confirm("Are you sure you want to reset all groups? This will move all images back to the unsorted tray.")) {
            setGroups(images.map((_, i) => [i]));
            setSelectedIndices([]);
        }
    };

    const handleAutoGroup = async () => {
        setIsLoading(true);
        try {
            const result = await autoGroupImages(images);
            const newGroups: number[][] = [];
            const assignedIndices = new Set<number>();

            result.forEach(group => {
                const validIndices = group.indices.filter(i => i < images.length && !assignedIndices.has(i));
                if (validIndices.length > 0) {
                    newGroups.push(validIndices);
                    validIndices.forEach(i => assignedIndices.add(i));
                }
            });
            images.forEach((_, index) => {
                if (!assignedIndices.has(index)) {
                    newGroups.push([index]);
                }
            });
            setGroups(newGroups);
        } catch (error) {
            console.error("AI grouping failed:", error);
            alert("AI auto-grouping failed. Please group images manually.");
        } finally {
            setIsLoading(false);
            setSelectedIndices([]);
        }
    };

    const handleConfirm = () => {
        // We need to pass all groups, including single-image ones.
        const finalGroups = groups.filter(g => g.length > 0);
        onConfirm(finalGroups, aiGuidance);
    };

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, imageIndex: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', imageIndex.toString());
        setDraggedImageIndex(imageIndex);
    };

    const handleDragEnd = () => {
        setDraggedImageIndex(null);
        setDropTarget(null);
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

    const handleDrop = (e: React.DragEvent, targetType: 'group' | 'unsorted', targetGroupIndex: number) => {
        e.preventDefault();
        if (draggedImageIndex === null) return;

        const imageToMove = draggedImageIndex;
        const sourceGroupIndex = groups.findIndex(g => g.includes(imageToMove));

        if (sourceGroupIndex === -1) return; // Should not happen

        // Prevent dropping into the same group
        if (targetType === 'group' && sourceGroupIndex === targetGroupIndex) {
            handleDragEnd();
            return;
        }

        let nextGroups = [...groups];

        // Remove from source
        const sourceGroup = nextGroups[sourceGroupIndex].filter(i => i !== imageToMove);

        // Add to target
        if (targetType === 'unsorted') {
            nextGroups.push([imageToMove]);
        } else {
            nextGroups[targetGroupIndex] = [...nextGroups[targetGroupIndex], imageToMove];
        }

        // Update/remove source group
        if (sourceGroup.length > 0) {
            nextGroups[sourceGroupIndex] = sourceGroup;
        } else {
            // If source group is now empty, find and remove it from the array
            nextGroups = nextGroups.filter((_, index) => index !== sourceGroupIndex);
        }

        setGroups(nextGroups);
        handleDragEnd();
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>

            {/* Full Screen Glass Panel */}
            <div style={{
                background: 'rgba(10, 10, 10, 0.2)', // Matches sidebar background
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)', // Matches sidebar border
                borderRadius: '24px', // Matches sidebar radius
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
                        <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>Review and Organize Uploads</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>Group images that show the same product from different angles.</p>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div style={{
                    padding: '32px 32px',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 300px', // Main content + Sidebar
                    gap: '32px',
                    overflowY: 'auto',
                    flex: 1
                }}>

                    {/* Left Column: Unsorted + Bins */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Unsorted Tray */}
                        <div>
                            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', margin: 0 }}>Unsorted Images</h4>
                                <div className="tooltip-container">
                                    <button
                                        style={{
                                            height: '32px',
                                            borderRadius: '6px',
                                            padding: '0 12px',
                                            fontSize: '0.8rem',
                                            background: 'transparent',
                                            border: '1px solid var(--primary-color)',
                                            color: 'var(--primary-color)',
                                            cursor: selectedIndices.length < 2 ? 'not-allowed' : 'pointer',
                                            opacity: selectedIndices.length < 2 ? 0.5 : 1
                                        }}
                                        onClick={handleGroupSelected}
                                        disabled={selectedIndices.length < 2}
                                    >
                                        Group Selected
                                    </button>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    padding: '16px',
                                    minHeight: '120px',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '16px',
                                    border: dropTarget?.type === 'unsorted' ? '1px dashed var(--primary-color)' : '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.2s ease'
                                }}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'unsorted', -1)}
                                onDragEnter={() => setDropTarget({ type: 'unsorted', index: -1 })}
                                onDragLeave={() => setDropTarget(null)}
                            >
                                {ungroupedIndices.length === 0 && (
                                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                        All images are grouped. Drag images here to ungroup.
                                    </div>
                                )}
                                {ungroupedIndices.map(index => (
                                    <ImageThumbnail
                                        key={index}
                                        imageUrl={images[index].url}
                                        index={index}
                                        isSelected={selectedIndices.includes(index)}
                                        isDragged={draggedImageIndex === index}
                                        onClick={() => toggleSelection(index)}
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Product Bins */}
                        <div>
                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', margin: 0 }}>Grouped Products ({groupedBins.length})</h4>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {groupedBins.map((group, i) => {
                                    const originalGroupIndex = groups.findIndex(g => g === group);
                                    const isTarget = dropTarget?.type === 'group' && dropTarget.index === originalGroupIndex;
                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                background: isTarget ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                                                border: isTarget ? '1px dashed var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '16px',
                                                padding: '12px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '12px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'group', originalGroupIndex)}
                                            onDragEnter={() => setDropTarget({ type: 'group', index: originalGroupIndex })}
                                            onDragLeave={() => setDropTarget(null)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 500 }}>
                                                <span>Product {i + 1}</span>
                                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{group.length} angles</span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {group.map(index => (
                                                    <ImageThumbnail
                                                        key={index}
                                                        imageUrl={images[index].url}
                                                        index={index}
                                                        isSelected={false}
                                                        isDragged={draggedImageIndex === index}
                                                        onClick={() => { }}
                                                        onDragStart={handleDragStart}
                                                        onDragEnd={handleDragEnd}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {groupedBins.length === 0 && (
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        padding: '32px',
                                        border: '1px dashed rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                        color: 'var(--text-tertiary)',
                                        fontSize: '0.9rem'
                                    }}>
                                        No multi-image groups yet. Drag images together to create products.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', margin: 0 }}>Actions</h4>
                        </div>

                        <div className="modal-form-group">
                            <label>Auto-Organization</label>
                            <p className="field-helper">Let AI group images by visual similarity.</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={handleAutoGroup}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1,
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-main)',
                                        cursor: isLoading ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {isLoading ? <span className="spinner small" /> : 'Auto-Group'}
                                </button>
                                <button
                                    onClick={handleResetGrouping}
                                    title="Reset All"
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--text-main)',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    ↺
                                </button>
                            </div>
                        </div>

                        <div className="modal-form-group">
                            <label>Context Hints (Optional)</label>
                            <p className="field-helper">Provide hints for the AI analysis.</p>
                            <textarea
                                value={aiGuidance}
                                onChange={e => setAiGuidance(e.target.value)}
                                rows={6}
                                placeholder="e.g. 'Focus on the stitching details', 'The material is velvet'"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-input)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    color: 'var(--text-main)',
                                    resize: 'none',
                                    lineHeight: '1.5',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Products</span>
                                <strong style={{ color: 'var(--primary-color)' }}>{groups.filter(g => g.length > 0).length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Images</span>
                                <strong>{images.length}</strong>
                            </div>
                        </div>
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
                    <button
                        onClick={onCancel}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-tertiary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            padding: '0 16px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={images.length === 0}
                        style={{
                            minWidth: '160px',
                            background: 'transparent',
                            border: '1px solid var(--primary-color)',
                            color: 'var(--primary-color)',
                            borderRadius: '8px',
                            height: '40px',
                            padding: '0 20px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: images.length === 0 ? 'not-allowed' : 'pointer',
                            opacity: images.length === 0 ? 0.5 : 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        Analyze & Create
                    </button>
                </div>

            </div>
        </div>
    );
};
