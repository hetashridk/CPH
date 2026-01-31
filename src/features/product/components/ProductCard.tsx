
import React, { useState } from 'react';
import { Product } from '../../../core/types';
import { IconButton } from '../../../core/components/IconButton';


interface ProductCardProps {
    product: Product;
    isSelected: boolean;
    isDragged: boolean;
    onToggleSelection: (productId: string) => void;
    onDragStart: (e: React.DragEvent, productId: string) => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onReanalyze: (product: Product) => void;
    creditCost: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isSelected,
    isDragged,
    onToggleSelection,
    onDragStart,
    onEdit,
    onDelete,
    onReanalyze,
    creditCost
}) => {
    const isProcessing = product.status === 'processing';
    const [isHovered, setIsHovered] = useState(false);

    const handleCardClick = () => {
        if (!isProcessing) {
            onToggleSelection(product.id);
        }
    };

    const imageUrl = product.sourceImages[0]?.data || '';
    const imageSrc = imageUrl.startsWith('http') || imageUrl.startsWith('data:') ? imageUrl : `data:image/jpeg;base64,${imageUrl}`;

    return (
        <>
            <div
                draggable={!isProcessing}
                onDragStart={(e) => onDragStart(e, product.id)}
                className={`product-card ${isSelected ? 'selected' : ''} ${isDragged ? 'dragging' : ''}`}
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
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
                    borderRadius: '24px', // var(--radius-xl) approximation
                    border: isSelected
                        ? '2px solid var(--primary-color)'
                        : isHovered ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected
                        ? '0 0 30px rgba(45, 212, 191, 0.15)'
                        : isHovered ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%'
                }}
            >
                {!isProcessing && isSelected && (
                    <div style={{
                        position: 'absolute', top: '16px', right: '16px', width: '24px', height: '24px',
                        background: 'var(--primary-color)', borderRadius: '50%', zIndex: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                )}

                <div className="product-card-image-container" style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'var(--bg-surface)'
                }}>
                    {imageSrc && <img src={imageSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />}
                    {product.sourceImages.length > 1 && (
                        <div className="product-card-image-count" style={{
                            position: 'absolute', bottom: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem'
                        }}>
                            +{product.sourceImages.length - 1}
                        </div>
                    )}
                    {isProcessing && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                            <span className="spinner"></span>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{
                        margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)',
                        letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {product.name || 'Untitled Product'}
                    </h4>
                    <p style={{
                        margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {product.description || 'No description available.'}
                    </p>
                </div>

                {!isProcessing && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {/* Using Icons instead of buttons for cleaner look */}
                        <IconButton
                            icon="edit"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                            tooltip="Edit DNA"
                            size="small"
                        />
                        <IconButton
                            icon="delete"
                            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                            tooltip="Delete Product"
                            danger
                            size="small"
                        />
                    </div>
                )}
            </div>


        </>
    );
};
