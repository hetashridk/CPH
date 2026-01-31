import React, { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { Product, GeneratedImage, BatchJob, StylePreset, EnrichedImage } from '../../core/types';
import { ICONS, IconButton } from '../../core/components/IconButton';
import { Select } from '../../core/components/Select';
import { FullscreenAssetViewer } from '../../core/components/FullscreenAssetViewer';

// --- Types ---

interface GenContentViewProps {
    products: Product[];
    stylePresets: StylePreset[];
    batchJobs: BatchJob[];
    onSetImageApproval: (productId: string, imageId: string, approved: boolean) => void;
    onDeleteGeneratedImages: (productId: string, imageIds: string[]) => void;
    onRefineImage: (productId: string, imageId: string, instruction: string) => Promise<void>;
    onReshootImage: (productId: string, image: GeneratedImage) => Promise<void>;
}

type SortOption = 'newest' | 'oldest' | 'product' | 'style' | 'source';
type FilterStatus = 'all' | 'approved' | 'unapproved';

// --- Main View ---

export const GenContentView: React.FC<GenContentViewProps> = ({
    products,
    stylePresets,
    batchJobs,
    onSetImageApproval,
    onDeleteGeneratedImages,
    onRefineImage,
    onReshootImage,
}) => {
    // Filter State
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterProduct, setFilterProduct] = useState<string>('all');
    const [filterStylePreset, setFilterStylePreset] = useState<string>('all');
    const [filterBatch, setFilterBatch] = useState<string>('all');
    const [filterSources, setFilterSources] = useState<Set<string>>(new Set(['workshop', 'repose', 'batch_job', 'unknown']));

    // Sort State
    const [sortOption, setSortOption] = useState<SortOption>('newest');

    // Selection & UI State
    const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
    const [detailModalImageId, setDetailModalImageId] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // --- Helpers ---
    const getStyleName = (id?: string) => {
        if (!id) return 'Manual / Custom';
        return stylePresets.find(p => p.id === id)?.name || 'Unknown Style';
    };

    // --- Data Processing ---
    const allImages = useMemo<EnrichedImage[]>(() =>
        products.flatMap(p =>
            p.generatedImages.map(img => ({
                ...img,
                productName: p.name,
                styleName: getStyleName(img.stylePresetId),
                productAspectRatio: p.aspectRatio
            }))
        ),
        [products, stylePresets]);

    const processedImages = useMemo(() => {
        // 1. Filter
        let result = allImages.filter(img => {
            const statusMatch = filterStatus === 'all'
                ? true
                : filterStatus === 'approved' ? img.approved : !img.approved;
            const productMatch = filterProduct === 'all' ? true : img.productId === filterProduct;
            const styleMatch = filterStylePreset === 'all' ? true : img.stylePresetId === filterStylePreset;
            const batchMatch = filterBatch === 'all' ? true : img.batchJobId === filterBatch;
            const sourceMatch = filterSources.has(img.source || 'unknown');
            return statusMatch && productMatch && styleMatch && batchMatch && sourceMatch;
        });

        // 2. Sort
        result.sort((a, b) => {
            switch (sortOption) {
                case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'product': return a.productName.localeCompare(b.productName);
                case 'style': return a.styleName.localeCompare(b.styleName);
                case 'source': return (a.source || '').localeCompare(b.source || '');
                default: return 0;
            }
        });

        return result;
    }, [allImages, filterStatus, filterProduct, filterStylePreset, filterBatch, filterSources, sortOption]);

    // Derived Stats
    const stats = useMemo(() => ({
        total: allImages.length,
        approved: allImages.filter(i => i.approved).length,
        pending: allImages.filter(i => !i.approved).length
    }), [allImages]);

    // Handlers
    const toggleSelection = (id: string) => {
        setSelectedImageIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSourceFilter = (source: string) => {
        setFilterSources(prev => {
            const newSet = new Set(prev);
            if (newSet.has(source)) newSet.delete(source);
            else newSet.add(source);
            return newSet;
        });
    };

    const handleBulkApproval = (approved: boolean) => {
        if (selectedImageIds.length === 0) return;
        selectedImageIds.forEach(id => {
            const img = allImages.find(i => i.id === id);
            if (img) {
                onSetImageApproval(img.productId, img.id, approved);
            }
        });
        setSelectedImageIds([]);
    };

    const handleDownloadImage = async (img: EnrichedImage) => {
        try {
            const response = await fetch(img.imageData);
            const blob = await response.blob();
            const ext = img.mimeType.split('/')[1] || 'png';
            const safeProductName = img.productName.replace(/[^a-z0-9]/gi, '_');
            const safeStyleName = img.styleName.replace(/[^a-z0-9]/gi, '_');
            const filename = `${safeProductName}__${safeStyleName}__${img.id.substring(0, 6)}.${ext}`;

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Download failed:", e);
            // Fallback for data URIs or if fetch fails but url is accessible
            const link = document.createElement('a');
            link.href = img.imageData;
            link.download = `image_${img.id}.png`;
            link.click();
        }
    };

    const handleBulkDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        const imagesToDownload = allImages.filter(img => selectedImageIds.includes(img.id));
        const zip = new JSZip();

        try {
            const fetchPromises = imagesToDownload.map(async (img) => {
                try {
                    const response = await fetch(img.imageData);
                    const blob = await response.blob();
                    const ext = img.mimeType.split('/')[1] || 'png';
                    const safeProductName = img.productName.replace(/[^a-z0-9]/gi, '_');
                    const safeStyleName = img.styleName.replace(/[^a-z0-9]/gi, '_');
                    const filename = `${safeProductName}__${safeStyleName}__${img.id.substring(0, 6)}.${ext}`;
                    zip.file(filename, blob);
                } catch (e) {
                    console.error("Failed to fetch image for download:", img.id, e);
                }
            });

            await Promise.all(fetchPromises);

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `GenContent_Export_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Zip generation failed:", error);
            alert("Failed to generate zip file. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBulkDelete = () => {
        if (!window.confirm(`Delete ${selectedImageIds.length} assets? This action cannot be undone.`)) return;
        const toDelete: Record<string, string[]> = {};
        selectedImageIds.forEach(id => {
            const img = allImages.find(i => i.id === id);
            if (img) {
                if (!toDelete[img.productId]) toDelete[img.productId] = [];
                toDelete[img.productId].push(id);
            }
        });
        Object.entries(toDelete).forEach(([pid, ids]) => {
            onDeleteGeneratedImages(pid, ids);
        });
        setSelectedImageIds([]);
    };

    // Lightbox Nav
    const currentDetailModalIndex = processedImages.findIndex(img => img.id === detailModalImageId);
    const goNext = () => { if (currentDetailModalIndex < processedImages.length - 1) setDetailModalImageId(processedImages[currentDetailModalIndex + 1].id); };
    const goPrev = () => { if (currentDetailModalIndex > 0) setDetailModalImageId(processedImages[currentDetailModalIndex - 1].id); };

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Generated Content</h2>
                    <p className="view-header-subtitle">Review, approve, and manage all AI-generated assets.</p>
                </div>
                <div className="view-header-actions">
                    <div className="stat-pill"><strong>{stats.total}</strong> Total</div>
                    <div className="stat-pill success"><strong>{stats.approved}</strong> Approved</div>
                    <div className="stat-pill warning"><strong>{stats.pending}</strong> Pending</div>
                </div>
            </div>

            <div className="gen-content-layout">
                {/* --- Left Column: Controls --- */}
                <aside className="gen-content-sidebar">
                    <div className="control-section">
                        <label className="section-label">Sort &amp; Status</label>
                        <Select
                            value={sortOption}
                            onChange={(val) => setSortOption(val as SortOption)}
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'oldest', label: 'Oldest First' },
                                { value: 'product', label: 'Product Name' },
                                { value: 'style', label: 'Style Name' },
                                { value: 'source', label: 'Source' },
                            ]}
                        />
                        <div className="segmented-control" style={{ marginTop: 'var(--space-3)' }}>
                            <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>All</button>
                            <button className={filterStatus === 'approved' ? 'active' : ''} onClick={() => setFilterStatus('approved')}>Approved</button>
                            <button className={filterStatus === 'unapproved' ? 'active' : ''} onClick={() => setFilterStatus('unapproved')}>Pending</button>
                        </div>
                    </div>

                    <div className="control-section">
                        <label className="section-label">Filter by Content</label>
                        <Select
                            value={filterProduct}
                            onChange={setFilterProduct}
                            options={[{ value: 'all', label: 'All Products' }, ...products.map(p => ({ value: p.id, label: p.name }))]}
                        />
                        <Select
                            value={filterStylePreset}
                            onChange={setFilterStylePreset}
                            options={[{ value: 'all', label: 'All Styles' }, ...stylePresets.map(s => ({ value: s.id, label: s.name }))]}
                        />
                        <Select
                            value={filterBatch}
                            onChange={setFilterBatch}
                            options={[{ value: 'all', label: 'All Batches' }, ...batchJobs.map(b => ({ value: b.id, label: b.name }))]}
                        />
                    </div>

                    <div className="control-section">
                        <label className="section-label">Filter by Source</label>
                        <div className="checkbox-group">
                            {['workshop', 'repose', 'batch_job', 'unknown'].map(src => (
                                <label key={src} className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={filterSources.has(src)}
                                        onChange={() => toggleSourceFilter(src)}
                                    />
                                    <span>{src === 'batch_job' ? 'Batch Job' : src.charAt(0).toUpperCase() + src.slice(1)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- Right Column: Content --- */}
                <main className="gen-content-main">
                    {/* Bulk Toolbar */}
                    {selectedImageIds.length > 0 && (
                        <div className="bulk-actions-island">
                            <span className="selection-count">{selectedImageIds.length} Selected</span>
                            <div className="island-separator" />
                            <button className="island-btn success" onClick={() => handleBulkApproval(true)}>Approve</button>
                            <button className="island-btn warning" onClick={() => handleBulkApproval(false)}>Mark for Review</button>
                            <div className="island-separator" />
                            <button className="island-btn primary" onClick={handleBulkDownload} disabled={isDownloading}>
                                {isDownloading ? <span className="spinner small" /> : ICONS.upload} {isDownloading ? 'Zipping...' : 'Download'}
                            </button>
                            <button className="island-btn danger" onClick={handleBulkDelete}>Delete</button>
                            <div className="island-separator" />
                            <button className="island-btn" onClick={() => setSelectedImageIds([])}>Clear</button>
                        </div>
                    )}

                    {/* Content Area */}
                    {processedImages.length === 0 ? (
                        <div className="gen-content-empty-state">
                            <div className="empty-icon">{ICONS.images}</div>
                            <h3>{allImages.length === 0 ? 'No Content Generated' : 'No matches found'}</h3>
                            <p>Use the Workshop or Batch Jobs to generate new creative assets.</p>
                        </div>
                    ) : (
                        <div className="gen-content-list-container">
                            <div className="gen-content-list-header">
                                <div className="header-select"></div>
                                <div className="header-info">Asset</div>
                                <div className="header-meta">Metadata</div>
                                <div className="header-status">Status</div>
                                <div className="header-actions">Actions</div>
                            </div>
                            <div className="gen-content-list">
                                {processedImages.map(img => (
                                    <div
                                        key={img.id}
                                        className={`gen-content-row ${selectedImageIds.includes(img.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection(img.id)}
                                    >
                                        <div className="row-select">
                                            <div className="row-checkbox-ui"></div>
                                        </div>
                                        <div className="row-info">
                                            <div className="row-thumbnail">
                                                <img src={img.imageData} alt={img.productName} loading="lazy" />
                                            </div>
                                            <div className="row-text">
                                                <h4 className="row-title">{img.productName}</h4>
                                                <p className="row-subtitle">{img.styleName}</p>
                                            </div>
                                        </div>
                                        <div className="row-meta">
                                            <span>{(img.source || 'unknown').replace('_', ' ')}</span>
                                            <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="row-status">
                                            <span
                                                className={`status-pill ${img.approved ? 'approved' : 'pending'}`}
                                                onClick={(e) => { e.stopPropagation(); onSetImageApproval(img.productId, img.id, !img.approved); }}
                                            >
                                                {img.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="row-actions">
                                            <button className="button-secondary small" onClick={(e) => { e.stopPropagation(); setDetailModalImageId(img.id); }}>Details</button>
                                            <IconButton
                                                icon="download"
                                                tooltip="Download Image"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadImage(img);
                                                }}
                                            />
                                            <IconButton
                                                icon="delete"
                                                danger
                                                tooltip="Delete Asset"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Delete asset for "${img.productName}"?`)) {
                                                        onDeleteGeneratedImages(img.productId, [img.id]);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <FullscreenAssetViewer
                isOpen={!!detailModalImageId}
                image={detailModalImageId ? processedImages[currentDetailModalIndex] : null}
                currentIndex={currentDetailModalIndex}
                totalImages={processedImages.length}
                onClose={() => setDetailModalImageId(null)}
                onNext={goNext}
                onPrev={goPrev}
                onApprove={(app) => {
                    if (detailModalImageId) {
                        onSetImageApproval(processedImages[currentDetailModalIndex].productId, detailModalImageId, app);
                    }
                }}
                onRefine={(instr) => {
                    if (detailModalImageId) {
                        return onRefineImage(processedImages[currentDetailModalIndex].productId, detailModalImageId, instr).then(() => {
                            setDetailModalImageId(null); // Close viewer after refine
                        });
                    }
                    return Promise.resolve();
                }}
                onReshoot={() => {
                    if (detailModalImageId) {
                        return onReshootImage(processedImages[currentDetailModalIndex].productId, processedImages[currentDetailModalIndex]).then(() => {
                            setDetailModalImageId(null); // Close viewer after reshoot
                        });
                    }
                    return Promise.resolve();
                }}
                onDelete={() => {
                    if (detailModalImageId && window.confirm('Are you sure you want to permanently delete this asset?')) {
                        onDeleteGeneratedImages(processedImages[currentDetailModalIndex].productId, [detailModalImageId]);
                        setDetailModalImageId(null);
                    }
                }}
            />
        </div>
    );
};
