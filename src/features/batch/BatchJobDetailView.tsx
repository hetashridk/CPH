import React, { useMemo, useState } from 'react';
import type { BatchJob, Product, StylePreset, EnrichedImage } from '../../core/types';
import { FullscreenAssetViewer } from '../../core/components/FullscreenAssetViewer';

const getImageSrc = (data: string | undefined) => {
    if (!data) return '';
    if (data.startsWith('http') || data.startsWith('data:')) return data;
    return `data:image/jpeg;base64,${data}`;
};

interface AssetStatus {
    product: Product;
    style: StylePreset;
    status: 'completed' | 'failed' | 'pending';
    generatedImage?: EnrichedImage;
}

export const BatchJobDetailView: React.FC<{
    job: BatchJob;
    allProducts: Product[];
    stylePresets: StylePreset[];
    onBack: () => void;
}> = ({ job, allProducts, stylePresets, onBack }) => {
    const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
    const [viewerState, setViewerState] = useState<{ isOpen: boolean; imageId: string | null }>({ isOpen: false, imageId: null });

    const { assetList, counts, missingProductCount, missingStyleCount } = useMemo(() => {
        const list: AssetStatus[] = [];

        if (!job.config) {
            return { assetList: [], counts: { all: 0, completed: 0, failed: 0, pending: 0 }, missingProductCount: 0, missingStyleCount: 0 };
        }

        const configProductIds = new Set(job.config.productIds || []);
        const configStylePresetIds = new Set(job.config.stylePresetIds || []);

        const jobProducts = allProducts.filter(p => configProductIds.has(p.id));
        const jobStyles = stylePresets.filter(s => configStylePresetIds.has(s.id));

        const missingProducts = configProductIds.size - jobProducts.length;
        const missingStyles = configStylePresetIds.size - jobStyles.length;

        const generatedImagesMap = new Map<string, EnrichedImage>();

        allProducts.forEach(p => {
            p.generatedImages.forEach(img => {
                if (img.batchJobId === job.id && img.stylePresetId) {
                    const key = `${p.id}_${img.stylePresetId}`;
                    generatedImagesMap.set(key, {
                        ...img,
                        productName: p.name,
                        styleName: stylePresets.find(s => s.id === img.stylePresetId)?.name || 'Unknown Style',
                        productAspectRatio: p.aspectRatio,
                    });
                }
            });
        });

        for (const product of jobProducts) {
            for (const style of jobStyles) {
                const progressKey = `${product.id}_${style.id}`;
                const generatedImage = generatedImagesMap.get(progressKey);

                let status: 'completed' | 'failed' | 'pending' = 'pending';
                if (generatedImage) {
                    status = 'completed';
                } else if (job.progressDetails?.[progressKey] === 'failed') {
                    status = 'failed';
                }

                list.push({ product, style, status, generatedImage });
            }
        }

        const calculatedCounts = {
            all: list.length,
            completed: list.filter(item => item.status === 'completed').length,
            failed: list.filter(item => item.status === 'failed').length,
            pending: list.filter(item => item.status === 'pending').length,
        };

        return { assetList: list, counts: calculatedCounts, missingProductCount: missingProducts, missingStyleCount: missingStyles };
    }, [job, allProducts, stylePresets]);

    const viewableImages = useMemo(() => assetList.filter(a => a.generatedImage).map(a => a.generatedImage!), [assetList]);

    const filteredList = useMemo(() => {
        if (filter === 'all') return assetList;
        return assetList.filter(item => item.status === filter);
    }, [assetList, filter]);

    const progress = counts.all > 0 ? (counts.completed / counts.all) * 100 : 0;
    const isInvalid = missingProductCount > 0 || missingStyleCount > 0;

    const currentViewerIndex = viewableImages.findIndex(img => img.id === viewerState.imageId);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={onBack} style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </button>
                        <div>
                            <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                                {job.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`batch-status ${job.status}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{job.status}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                    Created on {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
                    {/* LEFT PANEL: Sidebar with stats */}
                    <div style={{
                        width: '320px',
                        borderRight: '1px solid rgba(255,255,255,0.06)',
                        padding: '32px',
                        display: 'flex', flexDirection: 'column',
                        background: 'rgba(0,0,0,0.2)'
                    }}>
                        {isInvalid && (
                            <div className="warning-banner" style={{ marginBottom: '24px' }}>
                                References missing: {missingProductCount} products, {missingStyleCount} styles.
                            </div>
                        )}

                        <div className="detail-stat-card" style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div className="detail-stat-label" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>Overall Progress</div>
                                <div className="detail-stat-value" style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary-color)' }}>{progress.toFixed(0)}%</div>
                            </div>
                            <div className="progress-bar-container" style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--primary-color)' }}></div>
                            </div>
                        </div>

                        <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statistics</h4>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="detail-stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                <div className="detail-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total Assets</div>
                                <div className="detail-stat-value" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{counts.all}</div>
                            </div>
                            <div className="detail-stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                <div className="detail-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Completed</div>
                                <div className="detail-stat-value" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{counts.completed}</div>
                            </div>
                            {counts.failed > 0 && (
                                <div className="detail-stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                    <div className="detail-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Failed</div>
                                    <div className="detail-stat-value" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>{counts.failed}</div>
                                </div>
                            )}
                            {counts.pending > 0 && (
                                <div className="detail-stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                    <div className="detail-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Pending</div>
                                    <div className="detail-stat-value" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{counts.pending}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Main content with asset list */}
                    <main className="batch-detail-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="tab-control" style={{
                            padding: '24px 32px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px'
                        }}>
                            {(['all', 'completed', 'failed', 'pending'] as const).map(f => (
                                <button
                                    key={f}
                                    className={filter === f ? 'active' : ''}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        background: 'none', border: 'none',
                                        padding: '0 0 16px 0',
                                        borderBottom: filter === f ? '2px solid var(--primary-color)' : '2px solid transparent',
                                        color: filter === f ? 'var(--text-main)' : 'var(--text-tertiary)',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    }}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)} <span style={{ opacity: 0.7, marginLeft: '4px', fontSize: '0.8rem' }}>({counts[f]})</span>
                                </button>
                            ))}
                        </div>

                        <div className="asset-table-header" style={{
                            display: 'grid', gridTemplateColumns: '60px 2fr 2fr 100px 100px',
                            padding: '16px 32px', background: 'rgba(255,255,255,0.02)',
                            color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 500
                        }}>
                            <div></div> {/* Thumb */}
                            <div>Product</div>
                            <div>Style Preset</div>
                            <div>Status</div>
                            <div>Result</div>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: '0 32px' }}>
                            {filteredList.length > 0 ? (
                                filteredList.map(({ product, style, status, generatedImage }) => (
                                    <div key={`${product.id}-${style.id}`} className="asset-table-row" style={{
                                        display: 'grid', gridTemplateColumns: '60px 2fr 2fr 100px 100px',
                                        padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        alignItems: 'center'
                                    }}>
                                        <div className="table-cell-image">
                                            <img src={getImageSrc(product.sourceImages[0]?.data)} alt={product.name} className="table-thumb" style={{
                                                width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', background: 'var(--bg-card)'
                                            }} />
                                        </div>
                                        <div className="table-cell-text">
                                            <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>{product.name}</strong>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{product.description?.substring(0, 40)}...</span>
                                        </div>
                                        <div className="table-cell-text">
                                            <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.9rem' }}>{style.name}</strong>
                                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{style.prompt?.styleDNA || 'Custom Style'}</span>
                                        </div>
                                        <div>
                                            <span className={`status-badge ${status}`}>{status}</span>
                                        </div>
                                        <div>
                                            {status === 'completed' && generatedImage ? (
                                                <div className="result-thumb" onClick={() => setViewerState({ isOpen: true, imageId: generatedImage.id })} style={{
                                                    width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)'
                                                }}>
                                                    <img src={generatedImage.imageData} alt="Result" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ) : status === 'failed' ? (
                                                <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>Failed</div>
                                            ) : (
                                                <div style={{ color: 'var(--text-light)', fontSize: '1.2rem', opacity: 0.3 }}>—</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No assets found matching this filter.
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <FullscreenAssetViewer
                isOpen={viewerState.isOpen}
                onClose={() => setViewerState({ isOpen: false, imageId: null })}
                image={currentViewerIndex > -1 ? viewableImages[currentViewerIndex] : null}
                currentIndex={currentViewerIndex}
                totalImages={viewableImages.length}
                onNext={() => {
                    const nextIndex = (currentViewerIndex + 1) % viewableImages.length;
                    setViewerState(s => ({ ...s, imageId: viewableImages[nextIndex].id }));
                }}
                onPrev={() => {
                    const prevIndex = (currentViewerIndex - 1 + viewableImages.length) % viewableImages.length;
                    setViewerState(s => ({ ...s, imageId: viewableImages[prevIndex].id }));
                }}
            // Other actions like approve/delete are handled in Gen Content view for now
            />
        </div>
    );
};
