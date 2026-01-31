
import React, { useMemo } from 'react';
import { Product, StylePreset, GenerationLog, Brand, View } from '../../core/types';
import { ICONS } from '../../core/components/IconButton';

interface StartHereViewProps {
    brand: Brand;
    products: Product[];
    stylePresets: StylePreset[];
    credits: number;
    recentLogs: GenerationLog[];
    onNavigate: (view: View) => void;
    totalBrands: number;
}

export const StartHereView: React.FC<StartHereViewProps> = ({
    brand,
    products,
    stylePresets,
    credits,
    recentLogs,
    onNavigate,
    totalBrands
}) => {
    
    const recentAssets = useMemo(() => {
        return products.flatMap(p => p.generatedImages.map(img => ({
            ...img,
            productName: p.name
        })))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8);
    }, [products]);

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Dashboard</h2>
                    <p className="view-header-subtitle">Welcome to your <strong>{brand.name}</strong> creative workspace.</p>
                </div>
            </div>

            <div className="dashboard-view">
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div className="dashboard-section-title">Overview</div>
                    </div>

                    <div className="stats-bento-grid">
                        <div className="stat-box" onClick={() => onNavigate('brandManagement')}>
                            <div className="stat-number">{totalBrands}</div>
                            <div className="stat-label">Brands</div>
                            <div className="stat-icon-bg">{ICONS.search}</div>
                        </div>
                        <div className="stat-box" onClick={() => onNavigate('productManagement')}>
                            <div className="stat-number">{products.length}</div>
                            <div className="stat-label">Products</div>
                            <div className="stat-icon-bg">{ICONS.products}</div>
                        </div>
                        <div className="stat-box" onClick={() => onNavigate('styleLab')}>
                            <div className="stat-number">{stylePresets.length}</div>
                            <div className="stat-label">Styles</div>
                            <div className="stat-icon-bg">{ICONS.styles}</div>
                        </div>
                        <div className="stat-box" onClick={() => onNavigate('genContent')}>
                            <div className="stat-number">{products.reduce((acc, p) => acc + p.generatedImages.length, 0)}</div>
                            <div className="stat-label">Assets</div>
                            <div className="stat-icon-bg">{ICONS.images}</div>
                        </div>
                        <div className="stat-box" onClick={() => onNavigate('costBilling')}>
                            <div className="stat-number">{credits}</div>
                            <div className="stat-label">Remaining Credits</div>
                            <div className="stat-icon-bg">{ICONS.credits}</div>
                        </div>
                    </div>
                </section>

                {recentAssets.length > 0 && (
                    <section className="dashboard-section">
                        <div className="dashboard-section-header">
                            <div className="dashboard-section-title">Recent Assets</div>
                        </div>
                        <div className="recent-assets-grid">
                            {recentAssets.map(img => (
                                <div key={img.id} className="recent-asset-thumb" onClick={() => onNavigate('genContent')}>
                                    <img src={img.imageData} alt={img.productName} />
                                    <div className="asset-overlay">
                                        <span>{img.productName}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};
