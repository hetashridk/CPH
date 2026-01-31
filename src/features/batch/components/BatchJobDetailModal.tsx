
import React, { useMemo, useState } from 'react';
import { Modal } from '../../../core/components/Modal';
import { IconButton } from '../../../core/components/IconButton';
import type { BatchJob, Product, StylePreset } from '../../../core/types';

const getImageSrc = (data: string | undefined) => {
    if (!data) return '';
    if (data.startsWith('http') || data.startsWith('data:')) return data;
    return `data:image/jpeg;base64,${data}`;
};

interface AssetStatus {
    product: Product;
    style: StylePreset;
    status: 'completed' | 'failed' | 'pending';
    generatedImageUrl?: string;
}

export const BatchJobDetailModal: React.FC<{
    job: BatchJob | null;
    isOpen: boolean;
    onClose: () => void;
    allProducts: Product[];
    stylePresets: StylePreset[];
}> = ({ job, isOpen, onClose, allProducts, stylePresets }) => {
    const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');

    const { assetList, missingProductCount, missingStyleCount } = useMemo(() => {
        if (!job || !job.config) {
            return { assetList: [], missingProductCount: 0, missingStyleCount: 0 };
        }

        const configProductIds = job.config.productIds || [];
        const configStylePresetIds = job.config.stylePresetIds || [];

        const jobProducts = allProducts.filter(p => configProductIds.includes(p.id));
        const jobStyles = stylePresets.filter(s => configStylePresetIds.includes(s.id));
        
        const missingProducts = configProductIds.length - jobProducts.length;
        const missingStyles = configStylePresetIds.length - jobStyles.length;
        
        const generatedImagesMap = new Map<string, string>();
        allProducts.forEach(p => {
            p.generatedImages.forEach(img => {
                if (img.batchJobId === job.id && img.stylePresetId) {
                    const key = `${p.id}_${img.stylePresetId}`;
                    generatedImagesMap.set(key, img.imageData);
                }
            });
        });

        const list: AssetStatus[] = [];
        for (const product of jobProducts) {
            for (const style of jobStyles) {
                const progressKey = `${product.id}_${style.id}`;
                const status = job.progressDetails?.[progressKey] ?? 'pending';
                const generatedImageUrl = generatedImagesMap.get(progressKey);
                list.push({ product, style, status, generatedImageUrl });
            }
        }
        return { assetList: list, missingProductCount: missingProducts, missingStyleCount: missingStyles };
    }, [job, allProducts, stylePresets]);

    const filteredList = useMemo(() => {
        if (filter === 'all') return assetList;
        return assetList.filter(item => item.status === filter);
    }, [assetList, filter]);

    if (!job) return null;

    const progress = job.totalImages > 0 ? (job.completedImages / job.totalImages) * 100 : 0;
    const isInvalid = missingProductCount > 0 || missingStyleCount > 0;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Job Details: ${job.name}`} size="xlarge">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', height: '70vh' }}>
                
                {isInvalid && (
                    <div className="warning-banner">
                        <strong>Warning:</strong> {missingProductCount > 0 && `${missingProductCount} product(s)`} {missingStyleCount > 0 && `and ${missingStyleCount} style(s)`} used in this job have been deleted.
                    </div>
                )}

                <div className="card" style={{ padding: 'var(--space-5)', flexShrink: 0 }}>
                    <div className="batch-job-header" style={{ marginBottom: 'var(--space-4)'}}>
                        <div style={{display: 'flex', gap: 'var(--space-3)', alignItems: 'center'}}>
                            <h3>Overall Progress</h3>
                            <span className={`batch-status ${job.status}`}>{job.status}</span>
                        </div>
                    </div>
                     <div className="batch-job-progress-section">
                        <div className="progress-header">
                            <span>{job.completedImages} / {job.totalImages} Assets Generated</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="batch-detail-controls" style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    {(['all', 'completed', 'failed', 'pending'] as const).map(f => (
                        <button 
                            key={f} 
                            className={`button-secondary small ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                            style={filter === f ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)', fontWeight: 600 } : {}}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)} ({assetList.filter(i => f === 'all' ? true : i.status === f).length})
                        </button>
                    ))}
                </div>

                <div className="batch-detail-asset-list" style={{ flexGrow: 1, overflowY: 'auto' }}>
                    <div className="asset-list-header">
                        <div className="header-item product">Product</div>
                        <div className="header-item style">Style</div>
                        <div className="header-item status">Status</div>
                        <div className="header-item preview">Result</div>
                    </div>
                    {filteredList.map(({ product, style, status, generatedImageUrl }) => (
                        <div key={`${product.id}-${style.id}`} className="asset-list-row">
                            <div className="asset-cell product" data-label="Product">
                                <img src={getImageSrc(product.sourceImages[0]?.data)} alt={product.name} className="asset-thumbnail" />
                                <span>{product.name}</span>
                            </div>
                            <div className="asset-cell style" data-label="Style">
                                <img src={getImageSrc(style.referenceImages[0])} alt={style.name} className="asset-thumbnail" />
                                <span>{style.name}</span>
                            </div>
                            <div className="asset-cell status" data-label="Status">
                                <span className={`asset-status-badge ${status}`}>{status}</span>
                            </div>
                            <div className="asset-cell preview" data-label="Result">
                                {status === 'completed' && generatedImageUrl ? (
                                    <img src={generatedImageUrl} alt="Generated asset" className="asset-thumbnail" />
                                ) : status === 'failed' ? (
                                    <div className="asset-thumbnail-placeholder error">✖</div>
                                ) : (
                                    <div className="asset-thumbnail-placeholder">...</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No assets found in this category.
                        </div>
                    )}
                </div>
            </div>
            <div className="modal-actions">
                <button className="button-secondary" onClick={onClose}>Close</button>
            </div>
        </Modal>
    );
};
