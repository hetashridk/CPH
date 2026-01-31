import React, { useState } from 'react';
import { Brand } from '../../core/types';
import { EmptyState } from '../../core/components/EmptyState';
import { ICONS, IconButton } from '../../core/components/IconButton';
import { Modal } from '../../core/components/Modal';
import { DeleteConfirmationView } from '../../core/components/DeleteConfirmationView';

export const BrandManagementView: React.FC<{
    brands: Brand[];
    onAddBrand: (brand: Brand) => void;
    onUpdateBrand: (brand: Brand) => void;
    selectedBrandId?: string | null;
    onSelectBrand: (brandId: string) => void;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { BRAND_ANALYSIS: number };
    onDeleteBrand: (brandId: string) => void;
    onCreateBrand: () => void;
    onEditBrand: (brand: Brand) => void;
}> = ({ brands, onAddBrand, onUpdateBrand, selectedBrandId, onSelectBrand, deductCredits, CREDIT_COSTS, onDeleteBrand, onCreateBrand, onEditBrand }) => {

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; brandId: string | null; brandName: string }>({
        isOpen: false,
        brandId: null,
        brandName: ''
    });

    const handleDeleteBrandRequest = (brandId: string) => {
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
            setDeleteConfirmation({
                isOpen: true,
                brandId: brand.id,
                brandName: brand.name
            });
        }
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmation.brandId) {
            onDeleteBrand(deleteConfirmation.brandId);
            setDeleteConfirmation({ isOpen: false, brandId: null, brandName: '' });
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, brandId: null, brandName: '' });
    };

    const handleQuickStart = () => {
        const genericBrandId = 'generic-default-workspace';
        const existingGeneric = brands.find(b => b.id === genericBrandId);

        if (existingGeneric) {
            onSelectBrand(existingGeneric.id);
        } else {
            const genericBrand: Brand = {
                id: genericBrandId,
                name: 'General Workspace',
                industry: 'Creative Exploration',
                status: 'approved',
                dna: {
                    brandEssence: 'A versatile workspace for general creative tasks without specific brand constraints.',
                    targetAudience: 'General Audience',
                    visualStyle: ['Clean', 'Versatile', 'Professional'],
                    toneOfVoice: ['Neutral', 'Helpful'],
                }
            };
            onAddBrand(genericBrand);
            onSelectBrand(genericBrandId);
        }
    };

    // --- FULL PAGE DELETE CONFIRMATION ---
    if (deleteConfirmation.isOpen && deleteConfirmation.brandId) {
        return (
            <DeleteConfirmationView
                title={`Delete ${deleteConfirmation.brandName}?`}
                message="This action is permanent. All products, styles, and data associated with this brand will be lost forever."
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                confirmText="Yes, Delete Brand"
            />
        );
    }

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Brand Intelligence</h2>
                    <p className="view-header-subtitle">Each workspace maintains a separate "Brand DNA" to guide the AI.</p>
                </div>
                <div className="view-header-actions">
                    <button className="button-secondary" onClick={handleQuickStart}>Quick Start</button>
                    <button
                        className="button-secondary"
                        onClick={onCreateBrand}
                        style={{
                            borderColor: 'var(--primary-color)',
                            color: 'var(--primary-color)',
                            background: 'rgba(45, 212, 191, 0.05)',
                            boxShadow: '0 0 15px rgba(45, 212, 191, 0.1)'
                        }}
                    >
                        + New Brand
                    </button>
                </div>
            </div>

            {brands.length === 0 ? (
                <EmptyState
                    title="No Brands Found"
                    message="Create a brand to begin. The AI will analyze your brand's website to establish a 'Brand DNA' that guides all future creative work."
                    action={
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <button className="button-primary" onClick={onCreateBrand}>Create Your First Brand</button>
                            <button className="button-secondary" onClick={handleQuickStart}>Continue without Brand</button>
                        </div>
                    }
                />
            ) : (
                <div className="brand-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '24px'
                }}>
                    {brands.map(brand => {
                        const isSelected = brand.id === selectedBrandId;
                        return (
                            <div
                                key={brand.id}
                                className={`brand-card ${isSelected ? 'selected' : ''}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '28px',
                                    gap: '20px',
                                    // Glass Theme Styling
                                    background: isSelected
                                        ? 'rgba(45, 212, 191, 0.03)'
                                        : 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    borderRadius: 'var(--radius-xl)',
                                    border: isSelected
                                        ? '2px solid var(--primary-color)'
                                        : '1px solid var(--glass-border)',
                                    boxShadow: isSelected
                                        ? '0 0 40px rgba(45, 212, 191, 0.15), inset 0 0 0 1px rgba(45, 212, 191, 0.1)'
                                        : '0 4px 30px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <h3 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{brand.name}</h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            color: 'var(--primary-color)',
                                            fontWeight: 700
                                        }}>
                                            {brand.industry}
                                        </span>
                                    </div>
                                    {brand.websiteUrl && (
                                        <a
                                            href={brand.websiteUrl.startsWith('http') ? brand.websiteUrl : `https://${brand.websiteUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: 'var(--text-tertiary)',
                                                opacity: 0.7,
                                                background: 'var(--bg-input)',
                                                width: '32px', height: '32px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                borderRadius: '50%',
                                                transition: 'all 0.2s'
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        </a>
                                    )}
                                </div>

                                <div style={{
                                    flex: 1,
                                    fontSize: '0.9rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {brand.dna?.brandEssence || "No brand essence defined."}
                                </div>

                                {brand.dna?.visualStyle && brand.dna.visualStyle.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {brand.dna.visualStyle.slice(0, 3).map((tag, i) => (
                                            <span key={i} style={{
                                                fontSize: '0.7rem',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                padding: '4px 12px',
                                                borderRadius: '99px',
                                                color: 'var(--text-secondary)',
                                                fontWeight: 500
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                        {brand.dna.visualStyle.length > 3 && (
                                            <span style={{ fontSize: '0.7rem', padding: '4px 6px', color: 'var(--text-tertiary)' }}>+{brand.dna.visualStyle.length - 3}</span>
                                        )}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                                    marginTop: 'auto',
                                    alignItems: 'center'
                                }}>
                                    <button
                                        className={isSelected ? "button-secondary button-full-width" : "button-primary button-full-width"}
                                        onClick={() => onSelectBrand(brand.id)}
                                        disabled={isSelected}
                                        style={{ justifyContent: 'center' }}
                                    >
                                        {isSelected ? (
                                            <>
                                                <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 8px var(--success)' }}></span>
                                                Active Workspace
                                            </>
                                        ) : 'Enter Workspace'}
                                    </button>

                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <IconButton
                                            icon="edit"
                                            tooltip="Edit DNA"
                                            onClick={() => onEditBrand(brand)}
                                        />
                                        <IconButton
                                            icon="delete"
                                            tooltip="Delete Brand"
                                            danger
                                            onClick={() => handleDeleteBrandRequest(brand.id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};