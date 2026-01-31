import React, { useState, useMemo, useRef } from 'react';
import { Modal, EditableMarkdown } from '../../core/components/Modal';
import { IconButton, ICONS } from '../../core/components/IconButton';
import { DeleteConfirmationView } from '../../core/components/DeleteConfirmationView';
import { ProductCard } from './components/ProductCard';
import { ReanalysisImageSelectorModal } from './components/ReanalysisImageSelectorModal';
import { fileToDataUri, resizeImage } from '../../core/utils/imageUtils';
import { generateId } from '../../core/utils/misc';
import { analyzeProduct } from './productAnalysis.service';
import type { Product, Brand, SystemInstructions, View, SourceImage } from '../../core/types';

export const ProductManagementView: React.FC<{
    products: Product[];
    onAddProducts: (productData: (Partial<Product> & { name: string, description: string, sourceImages: SourceImage[] })[]) => void;
    onUpdateProduct: (id: string, updatedProduct: Partial<Product>) => void;
    onDeleteProduct: (id: string) => void;
    uploadInputRef: React.RefObject<HTMLInputElement>;
    onUploadProductsClick: () => void;
    selectedBrand: Brand;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PRODUCT_ANALYSIS: number };
    systemInstructions: SystemInstructions;
    setView: (view: View) => void;
    onStartCreator: (images: { url: string; data: string }[]) => void;
}> = ({
    products,
    onAddProducts, onUpdateProduct, onDeleteProduct,
    uploadInputRef,
    onUploadProductsClick,
    selectedBrand,
    deductCredits,
    CREDIT_COSTS,
    systemInstructions,
    setView,
    onStartCreator
}) => {
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [editingProduct, setEditingProduct] = useState<Product | null>(null);
        const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
        const [draggedProductIds, setDraggedProductIds] = useState<string[] | null>(null);

        const [deleteConfirmation, setDeleteConfirmation] = useState<{
            isOpen: boolean;
            productIds: string[];
            title: string;
            message: string;
        }>({ isOpen: false, productIds: [], title: '', message: '' });

        const requestDeleteProduct = (id: string, name: string) => {
            setDeleteConfirmation({
                isOpen: true,
                productIds: [id],
                title: `Delete ${name}?`,
                message: "Are you sure you want to delete this product? This action cannot be undone."
            });
        };

        const requestDeleteSelected = () => {
            setDeleteConfirmation({
                isOpen: true,
                productIds: [...selectedProductIds],
                title: `Delete ${selectedProductIds.length} Products?`,
                message: "Are you sure you want to permanently delete the selected products? This action cannot be undone."
            });
        };

        const handleConfirmDelete = () => {
            deleteConfirmation.productIds.forEach(id => onDeleteProduct(id));
            if (deleteConfirmation.productIds.length > 1) setSelectedProductIds([]); // Clear selection if bulk
            setDeleteConfirmation({ isOpen: false, productIds: [], title: '', message: '' });
            if (isEditModalOpen) closeEditModal();
        };

        const [reanalysisModalState, setReanalysisModalState] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
        const [isBulkReanalysisModalOpen, setIsBulkReanalysisModalOpen] = useState(false);
        const [reanalysisDirection, setReanalysisDirection] = useState('');
        const [isProcessingUpload, setIsProcessingUpload] = useState(false);
        const [isDraggingOver, setIsDraggingOver] = useState(false);
        const addSourceImagesInputRef = useRef<HTMLInputElement>(null);

        const isAnyProductProcessing = useMemo(() => products.some(p => p.status === 'processing'), [products]);

        const processFiles = async (fileArray: File[]) => {
            setIsProcessingUpload(true);
            try {
                const validImages = fileArray.filter(file => file.type.startsWith('image/'));

                if (validImages.length === 0) {
                    if (fileArray.length > 0) alert("No valid image files found in upload.");
                    return;
                }

                const originalImagePromises = validImages.map(fileToDataUri);
                const originalBase64Images = await Promise.all(originalImagePromises);


                const MAX_SIZE = 512;
                const resizedImagePromises = validImages.map(file => resizeImage(file, MAX_SIZE));
                const resizedBase64Images = await Promise.all(resizedImagePromises);

                // setImagesToGroup(resizedBase64Images.map(b64 => ({ url: b64, data: b64 })));
                // setIsGroupingModalOpen(true);

                // New Flow:
                onStartCreator(resizedBase64Images.map((b64, i) => ({ url: b64, data: originalBase64Images[i] })));

            } catch (error) {
                console.error("Error processing files:", error);
                alert("There was an error processing your upload.");
            } finally {
                setIsProcessingUpload(false);
                if (uploadInputRef.current) uploadInputRef.current.value = '';
            }
        };

        const handleFileChange = async (files: FileList | null) => {
            if (!files || files.length === 0) return;
            await processFiles(Array.from(files) as File[]);
        };

        const handleDragEnter = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.types.includes('Files')) {
                setIsDraggingOver(true);
            }
        };

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            // Check if leaving the container and not just moving over a child
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDraggingOver(false);
            }
        };

        const handleDrop = async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
            const files = Array.from(e.dataTransfer.files) as File[];
            if (files.length > 0) {
                await processFiles(files);
            }
        };



        const closeEditModal = () => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
        };

        const handleUpdateProductInModal = () => {
            if (editingProduct) {
                onUpdateProduct(editingProduct.id, editingProduct);
                closeEditModal();
            }
        };

        const handleConfirmReanalysis = async ({ selectedImages, direction }: { selectedImages: string[], direction: string }) => {
            const productToReanalyze = reanalysisModalState.product;
            if (!productToReanalyze) return;

            if (!deductCredits(CREDIT_COSTS.PRODUCT_ANALYSIS)) {
                return;
            }

            setReanalysisModalState({ isOpen: false, product: null });
            onUpdateProduct(productToReanalyze.id, { status: 'processing', name: "Re-analyzing DNA...", statusLastUpdatedAt: new Date().toISOString() });

            if (isEditModalOpen && editingProduct?.id === productToReanalyze.id) {
                closeEditModal();
            }

            try {
                // Unified call
                const analysisResult = await analyzeProduct(selectedImages, selectedBrand.industry, direction);

                onUpdateProduct(productToReanalyze.id, {
                    ...analysisResult,
                    status: 'complete',
                    statusLastUpdatedAt: new Date().toISOString(),
                });
            } catch (error) {
                console.error("Error during product re-analysis:", error);
                alert("There was an error re-analyzing the product.");
                onUpdateProduct(productToReanalyze.id, { status: 'complete', statusLastUpdatedAt: new Date().toISOString() });
            }
        };

        const toggleProductSelection = (productId: string) => {
            setSelectedProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
        };

        const handleDragStart = (e: React.DragEvent, productId: string) => {
            const product = products.find(p => p.id === productId);
            if (product?.status === 'processing') {
                e.preventDefault();
                return;
            }
            const idsToDrag = selectedProductIds.includes(productId) ? selectedProductIds : [productId];
            setDraggedProductIds(idsToDrag);
            e.dataTransfer.setData('text/plain', JSON.stringify(idsToDrag));
            e.dataTransfer.effectAllowed = 'move';
        };

        const handleAddSourceImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files || !editingProduct) return;
            const fileArray = Array.from(e.target.files);
            const imagePromises = fileArray.map(fileToDataUri);
            const newImagesData = await Promise.all(imagePromises);
            const newSourceImages = newImagesData.map(data => ({ data, description: '' }));
            setEditingProduct(prev => prev ? { ...prev, sourceImages: [...prev.sourceImages, ...newSourceImages] } : null);
            if (addSourceImagesInputRef.current) {
                addSourceImagesInputRef.current.value = '';
            }
        };

        const handleSelectInverse = () => {
            const allVisibleIds = new Set(products.map(p => p.id));
            const currentSelected = new Set(selectedProductIds);
            const inverseSelection = [...allVisibleIds].filter(id => !currentSelected.has(id));
            setSelectedProductIds(inverseSelection);
        };

        const handleDeleteSelected = () => {
            requestDeleteSelected();
        };

        const handleConfirmBulkReanalysis = async () => {
            const productsToReanalyze = products.filter(p => selectedProductIds.includes(p.id));
            if (productsToReanalyze.length === 0) return;

            const cost = productsToReanalyze.length * CREDIT_COSTS.PRODUCT_ANALYSIS;
            if (!deductCredits(cost)) {
                return;
            }

            setIsBulkReanalysisModalOpen(false);

            productsToReanalyze.forEach(p => onUpdateProduct(p.id, { status: 'processing', name: "Re-analyzing DNA...", statusLastUpdatedAt: new Date().toISOString() }));
            setSelectedProductIds([]);

            const analysisPromises = productsToReanalyze.map(product => (async () => {
                try {
                    const images = product.sourceImages.map(si => si.data);
                    // Unified call
                    const analysisResult = await analyzeProduct(images, selectedBrand.industry, reanalysisDirection);

                    onUpdateProduct(product.id, { ...analysisResult, status: 'complete', statusLastUpdatedAt: new Date().toISOString() });
                } catch (error) {
                    console.error(`Error re-analyzing product ${product.id}:`, error);
                    onUpdateProduct(product.id, { name: "Re-analysis Failed", description: "Click to edit.", status: 'complete', statusLastUpdatedAt: new Date().toISOString() });
                }
            })());

            await Promise.all(analysisPromises).finally(() => {
                setReanalysisDirection('');
            });
        };

        const handleUpdateProductDNA = (field: 'bestUseCase' | 'emotionalTriggers', value: string) => {
            setEditingProduct(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    dna: {
                        bestUseCase: prev.dna?.bestUseCase || '',
                        emotionalTriggers: prev.dna?.emotionalTriggers || '',
                        ...prev.dna,
                        [field]: value
                    }
                };
            });
        };

        const handleSetPrimaryImage = (indexToMakePrimary: number) => {
            if (!editingProduct || indexToMakePrimary === 0) return;

            setEditingProduct(prev => {
                if (!prev) return null;
                const newSourceImages = [...prev.sourceImages];
                const [primaryImage] = newSourceImages.splice(indexToMakePrimary, 1);
                newSourceImages.unshift(primaryImage);
                return { ...prev, sourceImages: newSourceImages };
            });
        };

        if (deleteConfirmation.isOpen) {
            return (
                <DeleteConfirmationView
                    title={deleteConfirmation.title}
                    message={deleteConfirmation.message}
                    onCancel={() => setDeleteConfirmation({ isOpen: false, productIds: [], title: '', message: '' })}
                    onConfirm={handleConfirmDelete}
                    confirmText={`Yes, Delete ${deleteConfirmation.productIds.length > 1 ? 'Products' : 'Product'}`}
                />
            );
        }

        // --- FULL PAGE EDIT VIEW ---
        if (editingProduct) {
            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    {/* Glass Panel Container */}
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
                                <button onClick={closeEditModal} style={{
                                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                </button>
                                <div>
                                    <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>
                                        Edit Product DNA
                                    </h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>
                                        Refine the AI's understanding of this product.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="button-secondary" onClick={() => {
                                    requestDeleteProduct(editingProduct.id, editingProduct.name);
                                }} style={{ color: 'var(--danger)', borderColor: 'rgba(255, 59, 48, 0.2)' }}>
                                    Delete
                                </button>
                                <button className="button-secondary" onClick={() => {
                                    const productToReanalyze = editingProduct;
                                    // We stay in edit mode or go back? Let's go back for now as re-analysis is async
                                    closeEditModal();
                                    setReanalysisModalState({ isOpen: true, product: productToReanalyze });
                                }}>
                                    Re-analyze
                                </button>
                                <button className="button-primary" onClick={handleUpdateProductInModal}>
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                            <div className="edit-product-modal-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
                                {/* --- SOURCE IMAGES SECTION --- */}
                                <div className="edit-product-images-panel" style={{ width: '100%' }}>
                                    <h4 className="dna-panel-section-header" style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Source Images</h4>
                                    <p className="field-helper" style={{ marginBottom: '16px' }}>The first image is the primary. Drag or click to reorder/set primary.</p>

                                    <div className="source-images-grid" style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px', alignItems: 'start'
                                    }}>
                                        {editingProduct.sourceImages.map((sourceImage, index) => (
                                            <div
                                                key={index}
                                                className={`source-image-item ${index === 0 ? 'is-primary' : ''}`}
                                                onClick={() => handleSetPrimaryImage(index)}
                                                style={{
                                                    aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', position: 'relative', cursor: 'pointer',
                                                    border: index === 0 ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <img src={sourceImage.data} alt={`Source ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                                {index === 0 && (
                                                    <div style={{
                                                        position: 'absolute', bottom: 0, left: 0, right: 0,
                                                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                                                        color: 'var(--primary-color)', fontSize: '0.7rem', fontWeight: 600,
                                                        display: 'flex', justifyContent: 'center', padding: '4px'
                                                    }}>
                                                        Primary
                                                    </div>
                                                )}

                                                <button
                                                    style={{
                                                        position: 'absolute', top: '4px', right: '4px',
                                                        background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '4px',
                                                        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', color: 'white'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProduct(p => p ? { ...p, sourceImages: p.sourceImages.filter((_, i) => i !== index) } : null);
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        ))}

                                        <div
                                            className="add-image-card"
                                            onClick={() => addSourceImagesInputRef.current?.click()}
                                            style={{
                                                aspectRatio: '1', borderRadius: '12px',
                                                border: '1px dashed rgba(255,255,255,0.2)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: 'var(--text-tertiary)', gap: '8px',
                                                background: 'rgba(255,255,255,0.02)'
                                            }}
                                        >
                                            {ICONS.plus}
                                            <span style={{ fontSize: '0.8rem' }}>Add Image</span>
                                        </div>
                                    </div>
                                    <input type="file" multiple accept="image/*" ref={addSourceImagesInputRef} style={{ display: 'none' }} onChange={handleAddSourceImages} />
                                </div>

                                {/* --- CORE INFORMATION --- */}
                                <div className="edit-product-dna-panel" style={{ width: '100%' }}>
                                    <h4 className="dna-panel-section-header" style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '24px',
                                        fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)'
                                    }}>Core Information</h4>

                                    <div className="modal-form-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>SEO Friendly Product Name</label>
                                        <input
                                            value={editingProduct.name}
                                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            placeholder="Optimized product title"
                                            style={{
                                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-main)', fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div className="modal-form-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</label>
                                        <p className="field-helper" style={{ marginBottom: '12px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>What the product is, its key features, and visual attributes.</p>
                                        <EditableMarkdown
                                            value={editingProduct.description}
                                            onChange={val => setEditingProduct({ ...editingProduct, description: val })}
                                            isTextarea
                                            rows={5}
                                            placeholder="Detailed product description..."
                                            style={{
                                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-main)', fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <h4 className="dna-panel-section-header" style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '24px', marginTop: '32px',
                                        fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)'
                                    }}>AI-Generated Analysis</h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div className="modal-form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Best Use Case</label>
                                            <EditableMarkdown
                                                value={editingProduct.dna?.bestUseCase || ''}
                                                onChange={val => handleUpdateProductDNA('bestUseCase', val)}
                                                isTextarea
                                                rows={4}
                                                placeholder="e.g., 'Perfect for a minimalist office space.'"
                                                style={{
                                                    width: '100%', padding: '12px 16px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'var(--text-main)', fontSize: '1rem'
                                                }}
                                            />
                                        </div>
                                        <div className="modal-form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Emotional Triggers</label>
                                            <EditableMarkdown
                                                value={editingProduct.dna?.emotionalTriggers || ''}
                                                onChange={val => handleUpdateProductDNA('emotionalTriggers', val)}
                                                isTextarea
                                                rows={4}
                                                placeholder="e.g., 'Evokes a sense of calm and focus.'"
                                                style={{
                                                    width: '100%', padding: '12px 16px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'var(--text-main)', fontSize: '1rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (reanalysisModalState.isOpen && reanalysisModalState.product) {
            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    <div style={{
                        background: 'rgba(10, 10, 10, 0.2)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', flex: 1, width: '100%', overflow: 'hidden'
                    }}>
                        <div style={{ height: '80px', padding: '0 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)' }}>Re-analyze Product DNA</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0 }}>{reanalysisModalState.product.name}</p>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            <ReanalysisImageSelectorModal
                                isOpen={true}
                                onClose={() => setReanalysisModalState({ isOpen: false, product: null })}
                                product={reanalysisModalState.product}
                                onSubmit={handleConfirmReanalysis}
                                creditCost={CREDIT_COSTS.PRODUCT_ANALYSIS}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        if (isBulkReanalysisModalOpen) {
            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    <div style={{
                        background: 'rgba(10, 10, 10, 0.2)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', flex: 1, width: '100%', overflow: 'hidden',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ maxWidth: '600px', width: '100%', padding: '40px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Bulk Re-analyze Product DNA</h2>
                            <div className="modal-form-group" style={{ marginBottom: '32px' }}>
                                <label>Feedback / Direction (Optional)</label>
                                <textarea
                                    value={reanalysisDirection}
                                    onChange={e => setReanalysisDirection(e.target.value)}
                                    rows={6}
                                    placeholder="e.g., Focus on sustainability and eco-friendly aspects."
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px', borderRadius: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                <button className="button-secondary" onClick={() => setIsBulkReanalysisModalOpen(false)}>Cancel</button>
                                <button className="button-primary" onClick={handleConfirmBulkReanalysis}>{`Submit ${selectedProductIds.length * CREDIT_COSTS.PRODUCT_ANALYSIS > 0 ? `(${selectedProductIds.length * CREDIT_COSTS.PRODUCT_ANALYSIS} Cr)` : '(Free)'}`}</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // --- MAIN PRODUCT GRID VIEW ---
        return (
            <div className="view-container product-management-container">
                <input
                    type="file"
                    ref={uploadInputRef}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e.target.files)}
                />

                <div className="view-header">
                    <div>
                        <h2>Product Catalogue</h2>
                        <p className="view-header-subtitle">Upload, analyze, and manage your product inventory.</p>
                    </div>
                    <div className="view-header-actions">
                        <button className="button-primary" onClick={onUploadProductsClick} disabled={isAnyProductProcessing || isProcessingUpload}>
                            {isProcessingUpload ? 'Processing...' : (isAnyProductProcessing ? 'Analyzing...' : 'Upload Products')}
                        </button>
                    </div>
                </div>

                {selectedProductIds.length > 0 && (
                    <div className="selection-toolbar">
                        <span>{selectedProductIds.length} selected</span>
                        <div className="toolbar-actions">
                            <button className="button-secondary small" onClick={() => setSelectedProductIds(products.map(p => p.id))}>Select All</button>
                            <button className="button-secondary small" onClick={handleSelectInverse}>Inverse</button>
                            <button className="button-secondary small" onClick={() => setIsBulkReanalysisModalOpen(true)}>Re-analyze</button>
                            <button className="button-danger small" onClick={handleDeleteSelected}>Delete</button>
                            <button className="button-secondary small" onClick={() => setSelectedProductIds([])}>Clear</button>
                        </div>
                    </div>
                )}

                <div
                    className={`product-grid-container ${isDraggingOver ? 'drag-over' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {products.length === 0 ? (
                        <div className="product-management-empty-state" onClick={onUploadProductsClick}>
                            {isProcessingUpload ? (
                                <>
                                    <span className="spinner" style={{ width: '32px', height: '32px' }}></span>
                                    <h3>Processing Upload...</h3>
                                </>
                            ) : (
                                <>
                                    {ICONS.upload}
                                    <h3>Welcome to your '{selectedBrand.name}' workspace!</h3>
                                    <p>Drag & drop product images here to get started.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="product-grid">
                            <div className="product-upload-card" onClick={onUploadProductsClick}>
                                {ICONS.plus}
                                <span>Add Products</span>
                            </div>
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isSelected={selectedProductIds.includes(product.id)}
                                    isDragged={!!draggedProductIds?.includes(product.id)}
                                    onToggleSelection={toggleProductSelection}
                                    onDragStart={handleDragStart}
                                    onEdit={(p) => { setEditingProduct(p); setIsEditModalOpen(true); }}
                                    onDelete={(id) => requestDeleteProduct(id, product.name)}
                                    onReanalyze={(p) => setReanalysisModalState({ isOpen: true, product: p })}
                                    creditCost={CREDIT_COSTS.PRODUCT_ANALYSIS}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };


