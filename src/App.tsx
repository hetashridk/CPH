
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

import {
    View, Industry, Bucket, Product, GeneratedImage, ModularPrompt,
    StylePreset, GenerationLog, BatchJob, AspectRatio, SystemInstructions, Brand, SourceImage, ImageSize
} from './core/types';
import { generateId } from './core/utils/misc';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from './features/settings/systemPrompts';
import { IconButton } from './core/components/IconButton';
import {
    auth,
    subscribeToCollection,
    subscribeToDocument,
    saveDocument,
    deleteDocument,
    uploadImage,
    logout,
    addArrayItem,
    onAuthStateChanged,
    User
} from './core/auth/firebase';
import { generateReferenceImageForPreset } from './features/style/styleGeneration.service';
import { generateProductionImage, refineGeneratedImage } from './features/generation/imageGeneration.service';

import { BrandManagementView } from './features/brand/BrandManagementView';
import { BrandCreatorView } from './features/brand/BrandCreatorView';
import { ProductManagementView } from './features/product/ProductCatalogueView';
import { StyleLabView } from './features/style/StyleLabView';
import { BatchJobsView } from './features/batch/BatchJobsView';
import { BatchJobDetailView } from './features/batch/BatchJobDetailView';
import { GenContentView } from './features/delivery/DeliveryManagementView';
import { SystemPerformanceView } from './features/settings/SystemPerformanceView';
import { CustomizeSystemView } from './features/settings/CustomizeSystemView';
import { CostBillingView } from './features/settings/CostBillingView';
import { ResourceIntelligenceView } from './features/settings/ResourceIntelligenceView';
import { LoginView } from './core/auth/LoginView';
import { StartHereView } from './features/dashboard/StartHereView';
import { WorkshopView } from './features/generation/WorkshopView';
import { ReposeView } from './features/generation/ReposeView';
import { VideosModeView } from './features/videos/VideosModeView';
import { Modal } from './core/components/Modal';
import { AccentColorSelector } from './core/components/AccentColorSelector';
import { EmptyState } from './core/components/EmptyState';

// --- COST CONFIGURATION ---
const CREDIT_COSTS = {
    BRAND_ANALYSIS: 0,
    PRODUCT_ANALYSIS: 0,
    PROMPT_FROM_IDEA: 0,
    STYLE_FROM_IMAGE: 0,
    PROMPT_IDEAS: 0,
    STYLE_PRESET_FROM_IDEA: 0,
    VIDEO_GENERATION: 20,
    IMAGE_GENERATION: 4,
    IMAGE_REFINEMENT: 2,
};

const getImageCost = (size: ImageSize): number => {
    switch (size) {
        case '1K': return 1;
        case '2K': return 2;
        case '4K': return 4;
        default: return 4;
    }
};

// --- NAVIGATION COMPONENTS --- //
type NavGroup = {
    label?: string;
    items: { id: View; label: string; description?: string }[];
};

const Sidebar: React.FC<{
    isMobileOpen: boolean;
    onMobileClose: () => void;
    view: View;
    onSetView: (view: View) => void;
    brand?: Brand;
    user?: User | null;
}> = ({ isMobileOpen, onMobileClose, view, onSetView, brand, user }) => {

    const navigationGroups: NavGroup[] = [
        {
            label: "Setup",
            items: [
                { id: 'brandManagement', label: 'Brand DNA' },
                { id: 'productManagement', label: 'Catalogue' },
                { id: 'styleLab', label: 'Style Lab' },
            ]
        },
        {
            label: "Production",
            items: [
                { id: 'workshop', label: 'Workshop' },
                { id: 'repose', label: 'Repose' },
                { id: 'batchJobs', label: 'Batch Jobs' },
            ]
        },
        {
            label: "Download",
            items: [
                { id: 'genContent', label: 'Gallery' },
            ]
        }
    ];

    const systemItems = [
        { id: 'resourceIntelligence', label: 'Resources' },
    ];

    const handleNavClick = (id: View) => {
        onSetView(id);
        onMobileClose();
    };

    return (
        <>
            <div className={`sidebar-backdrop ${isMobileOpen ? 'visible' : ''}`} onClick={onMobileClose} />
            <nav className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>

                {/* Sidebar Header - Interactive Button for Dashboard */}
                <button
                    className={`sidebar-header ${view === 'startHere' ? 'active' : ''}`}
                    onClick={() => { onSetView('startHere'); onMobileClose(); }}
                    title="Go to Dashboard"
                >
                    <div className="app-info">
                        <span className="app-name">AI Marketing Studio</span>
                        <span className="app-subtitle">Creative Suite</span>
                    </div>
                </button>

                <div className="sidebar-scroll-area">
                    {/* Main Navigation Groups */}
                    {navigationGroups.map((group, idx) => (
                        <div key={idx} className="nav-group">
                            {group.label && <div className="nav-group-label">{group.label}</div>}
                            <ul className="nav-list">
                                {group.items.map(item => (
                                    <li key={item.id}>
                                        <button
                                            className={`nav-button ${view === item.id ? 'active' : ''}`}
                                            onClick={() => handleNavClick(item.id)}
                                        >
                                            <span className="nav-label">{item.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <div style={{ flexGrow: 1 }}></div>

                    {/* System Group */}
                    <div className="nav-group system-group">
                        <ul className="nav-list">
                            {systemItems.map(item => (
                                <li key={item.id}>
                                    <button
                                        className={`nav-button ${view === item.id ? 'active' : ''}`}
                                        onClick={() => handleNavClick(item.id as View)}
                                    >
                                        <span className="nav-label">{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar Footer - Interactive Button for Settings */}
                <button
                    className={`sidebar-footer ${view === 'backend' ? 'active' : ''}`}
                    onClick={() => { onSetView('backend'); onMobileClose(); }}
                    title="Settings"
                >
                    <div className="user-info">
                        <span className="user-name">{user?.displayName || 'User'}</span>
                        <span className="user-email">{user?.email || ''}</span>
                    </div>
                </button>
            </nav>
        </>
    );
};

// Top Header for Mobile Devices
const MobileHeader: React.FC<{
    onToggleSidebar: () => void;
    brandName?: string;
}> = ({ onToggleSidebar, brandName }) => {
    return (
        <header className="mobile-header">
            <IconButton
                icon="="
                tooltip="Menu"
                onClick={onToggleSidebar}
                style={{ fontSize: '1.2rem', padding: 'var(--space-2)' }}
            />
            <h1>{brandName || 'AI Studio'}</h1>
            <div style={{ width: '32px' }} /> {/* Spacer for centering */}
        </header>
    );
};

// --- MAIN APP COMPONENT --- //
export const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('brandManagement');
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Data States
    const [products, setProducts] = useState<Product[]>([]);
    const [stylePresets, setStylePresets] = useState<StylePreset[]>([]);
    const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
    const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
    const [credits, setCredits] = useState<number>(20);
    const [systemInstructions, setSystemInstructions] = useState<SystemInstructions>(DEFAULT_SYSTEM_INSTRUCTIONS);
    const [viewingJobId, setViewingJobId] = useState<string | null>(null);

    // Brand Editing State
    const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);

    // Global Timer State for Batch Jobs
    const [batchJobTimers, setBatchJobTimers] = useState<Record<string, number>>({});

    // Modals
    const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
    const uploadProductsInputRef = useRef<HTMLInputElement>(null);

    // Refs for safe access in effects
    const viewRef = useRef(view);
    const selectedBrandIdRef = useRef(selectedBrandId);
    const batchJobsRef = useRef(batchJobs);
    // Use Ref for credits to ensure loops access the latest value
    const creditsRef = useRef(credits);

    // --- JOB PROCESSING SAFEGUARDS ---
    const processingPresetsRef = useRef<Set<string>>(new Set());
    const stylePresetsRef = useRef(stylePresets);
    const prevBatchJobsRef = useRef<BatchJob[]>([]);

    // --- Effects --- //
    useEffect(() => { viewRef.current = view; }, [view]);
    useEffect(() => { selectedBrandIdRef.current = selectedBrandId; }, [selectedBrandId]);
    useEffect(() => { stylePresetsRef.current = stylePresets; }, [stylePresets]);
    useEffect(() => { batchJobsRef.current = batchJobs; }, [batchJobs]);
    useEffect(() => { creditsRef.current = credits; }, [credits]);

    // --- Global Timer Effect ---
    useEffect(() => {
        const interval = setInterval(() => {
            setBatchJobTimers(prev => {
                const next = { ...prev };
                let hasChanges = false;

                Object.keys(next).forEach(key => {
                    if (next[key] > 0) {
                        next[key]--;
                        hasChanges = true;
                    }
                });

                return hasChanges ? next : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Effect to clear timers for completed/failed jobs
    useEffect(() => {
        const prevJobs = prevBatchJobsRef.current;
        const jobsThatFinished = batchJobs.filter(currentJob => {
            const prevJob = prevJobs.find(p => p.id === currentJob.id);
            return prevJob && prevJob.status === 'running' && currentJob.status !== 'running';
        });

        if (jobsThatFinished.length > 0) {
            setBatchJobTimers(prevTimers => {
                const nextTimers = { ...prevTimers };
                let changed = false;
                jobsThatFinished.forEach(job => {
                    if (nextTimers[job.id] !== undefined) {
                        delete nextTimers[job.id];
                        changed = true;
                    }
                });
                return changed ? nextTimers : prevTimers;
            });
        }

        prevBatchJobsRef.current = batchJobs;
    }, [batchJobs]);


    const startBatchJobTimer = (jobId: string, duration: number) => {
        setBatchJobTimers(prev => ({ ...prev, [jobId]: duration }));
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsubBrands = subscribeToCollection(user.uid, 'brands', (data) => setBrands(data as Brand[]));
        const unsubProducts = subscribeToCollection(user.uid, 'products', (data) => setProducts(data as Product[]));
        const unsubStyles = subscribeToCollection(user.uid, 'stylePresets', (data) => setStylePresets(data as StylePreset[]));
        const unsubJobs = subscribeToCollection(user.uid, 'batchJobs', (data) => setBatchJobs(data as BatchJob[]));
        const unsubLogs = subscribeToCollection(user.uid, 'generationLogs', (data) => setGenerationLogs(data as GenerationLog[]));

        const unsubSettings = subscribeToDocument(user.uid, 'settings', 'general', (data) => {
            if (data) {
                if (typeof data.credits === 'number') setCredits(data.credits);
                if (data.selectedBrandId && data.selectedBrandId !== selectedBrandIdRef.current) {
                    setSelectedBrandId(data.selectedBrandId);
                    if (viewRef.current === 'brandManagement') setView('startHere');
                }
            } else {
                // Initialize default settings if missing
                saveDocument(user.uid, 'settings', 'general', { credits: 20, selectedBrandId: null });
            }
        });

        const unsubInstructions = subscribeToDocument(user.uid, 'settings', 'systemInstructions', (data) => {
            if (data) setSystemInstructions(data as SystemInstructions);
        });

        return () => {
            unsubBrands(); unsubProducts(); unsubStyles();
            unsubJobs(); unsubLogs(); unsubSettings(); unsubInstructions();
        };
    }, [user]);

    // --- TAB CLOSE PROTECTION ---
    const isAnyJobRunning = useMemo(() => batchJobs.some(j => j.status === 'running'), [batchJobs]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isAnyJobRunning) {
                e.preventDefault();
                e.returnValue = 'Batch jobs are currently running. Leaving now will stop processing.';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isAnyJobRunning]);

    // --- SELF-HEALING & PROCESSING LOOP (STYLES) ---
    useEffect(() => {
        if (!user) return;
        const pendingPresets = stylePresets.filter(p => p.status === 'pending_image' || p.status === 'generating_image');

        if (pendingPresets.length > 0) {
            pendingPresets.forEach(preset => {
                if (!processingPresetsRef.current.has(preset.id)) {
                    console.log(`Skipping generation for style ${preset.id}. Marking as complete.`);
                    saveDocument(user.uid, 'stylePresets', preset.id, { status: 'complete', statusLastUpdatedAt: new Date().toISOString() });
                }
            });
        }
    }, [stylePresets, user]);

    // --- SELF-HEALING (BATCH JOBS) ---
    useEffect(() => {
        if (!user || batchJobs.length === 0) return;
        const jobsToDelete: string[] = [];
        batchJobs.forEach(job => {
            if (!job.config) {
                jobsToDelete.push(job.id);
            }
        });
        if (jobsToDelete.length > 0) {
            jobsToDelete.forEach(jobId => deleteDocument(user.uid, 'batchJobs', jobId));
        }
    }, [batchJobs, user]);

    // --- STUCK STATUS SAFEGUARD ---
    useEffect(() => {
        if (!user) return;
        const safeguardInterval = setInterval(() => {
            const now = new Date();
            const STUCK_TIMEOUT_MINUTES = 5;
            const timeout = STUCK_TIMEOUT_MINUTES * 60 * 1000;

            products.forEach(product => {
                if (product.status === 'processing' && product.statusLastUpdatedAt) {
                    const lastUpdate = new Date(product.statusLastUpdatedAt);
                    if (now.getTime() - lastUpdate.getTime() > timeout) {
                        saveDocument(user.uid, 'products', product.id, {
                            status: 'complete',
                            name: "Analysis Failed (Timeout)",
                            description: "The AI analysis took too long to respond. Please try re-analyzing.",
                            statusLastUpdatedAt: now.toISOString()
                        });
                    }
                }
            });

            stylePresets.forEach(preset => {
                const isProcessing = preset.status === 'generating_image' || preset.status === 'pending_image';
                if (isProcessing && preset.statusLastUpdatedAt) {
                    const lastUpdate = new Date(preset.statusLastUpdatedAt);
                    if (now.getTime() - lastUpdate.getTime() > timeout) {
                        saveDocument(user.uid, 'stylePresets', preset.id, {
                            status: 'failed',
                            statusLastUpdatedAt: now.toISOString()
                        });
                    }
                }
            });

            batchJobs.forEach(job => {
                if (job.status === 'running' && job.statusLastUpdatedAt) {
                    const lastUpdate = new Date(job.statusLastUpdatedAt);
                    const batchTimeout = timeout * 2;
                    if (now.getTime() - lastUpdate.getTime() > batchTimeout) {
                        saveDocument(user.uid, 'batchJobs', job.id, {
                            status: 'failed',
                            statusLastUpdatedAt: now.toISOString()
                        });
                    }
                }
            });

        }, 30 * 1000);

        return () => clearInterval(safeguardInterval);

    }, [user, products, stylePresets, batchJobs]);


    const selectedBrand = useMemo(() => brands.find(b => b.id === selectedBrandId), [brands, selectedBrandId]);

    useEffect(() => {
        // Enforce brand selection for most views, but allow brand management and creation
        const brandSpecificViews: View[] = ['startHere', 'productManagement', 'styleLab', 'workshop', 'repose', 'batchJobs', 'genContent', 'batchJobDetail', 'resourceIntelligence', 'videoLab'];

        // If no brand is selected, and we are trying to access a brand-specific view, redirect to brand management
        if (!selectedBrand && brandSpecificViews.includes(view)) {
            setView('brandManagement');
        }
    }, [selectedBrand, view]);

    // --- Actions --- //
    const deductCredits = (amount: number): boolean => {
        // Use ref for immediate checks in loops, ensuring we don't overspend due to closure staleness
        if (creditsRef.current < amount) {
            alert(`Insufficient credits. Required: ${amount}, Available: ${creditsRef.current}`);
            return false;
        }
        const newCredits = creditsRef.current - amount;

        // Update both state (for UI) and Ref (for logic)
        setCredits(newCredits);
        creditsRef.current = newCredits;

        if (user) saveDocument(user.uid, 'settings', 'general', { credits: newCredits });
        return true;
    };

    const handleSelectBrand = (brandId: string) => {
        setSelectedBrandId(brandId);
        setView('startHere');
        if (user) saveDocument(user.uid, 'settings', 'general', { selectedBrandId: brandId });
    };

    const handleLogout = () => {
        logout();
        setView('brandManagement');
        setSelectedBrandId(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY, currentTarget } = e;
        currentTarget.style.setProperty('--mouse-x', `${clientX}px`);
        currentTarget.style.setProperty('--mouse-y', `${clientY}px`);
    };

    // --- Data Handlers ---
    const addBrand = async (brand: Brand) => user && await saveDocument(user.uid, 'brands', brand.id, brand);
    const updateBrand = async (brand: Brand) => user && await saveDocument(user.uid, 'brands', brand.id, brand);
    const deleteBrand = async (brandId: string) => {
        if (!user) return;
        await deleteDocument(user.uid, 'brands', brandId);
        if (selectedBrandId === brandId) {
            setSelectedBrandId(null);
            saveDocument(user.uid, 'settings', 'general', { selectedBrandId: null });
        }
    };

    const addProducts = async (productData: any[]) => {
        if (!user) return;
        for (const data of productData) {
            const id = data.id || generateId();
            const uploadedSourceImages: SourceImage[] = await Promise.all(
                data.sourceImages.map(async (img: any) => {
                    const url = await uploadImage(user.uid, img.data, 'products');
                    return { ...img, data: url };
                })
            );
            const newProduct: Product = {
                id, name: data.name, brandId: selectedBrandId!, description: data.description,
                sourceImages: uploadedSourceImages, generatedImages: [],
                status: data.status || 'complete', aspectRatio: data.aspectRatio || '1:1', dimensions: data.dimensions || null,
                statusLastUpdatedAt: new Date().toISOString()
            };
            await saveDocument(user.uid, 'products', id, newProduct);
        }
    };

    const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
        if (!user) return;
        let fieldsToSave = { ...updatedFields };
        if (updatedFields.sourceImages) {
            fieldsToSave.sourceImages = await Promise.all(
                updatedFields.sourceImages.map(async (img) => {
                    if (img.data.startsWith('http')) return img;
                    const url = await uploadImage(user.uid, img.data, 'products');
                    return { ...img, data: url };
                })
            );
        }
        await saveDocument(user.uid, 'products', id, fieldsToSave);
    };

    const deleteProduct = async (id: string) => user && await deleteDocument(user!.uid, 'products', id);

    const onAddPreset = async (preset: Omit<StylePreset, 'id'>, contextSubject?: string) => {
        if (!user) return;
        const newId = generateId();
        let finalReferenceImages: string[] = [];

        if (preset.referenceImages && preset.referenceImages.length > 0) {
            finalReferenceImages = await Promise.all(
                preset.referenceImages.map(img => {
                    if (img.startsWith('data:')) {
                        return uploadImage(user.uid, img, 'style-presets');
                    }
                    return Promise.resolve(img);
                })
            );
        }

        const newPreset: StylePreset = {
            ...preset,
            id: newId,
            referenceImages: finalReferenceImages,
            status: 'complete',
            statusLastUpdatedAt: new Date().toISOString()
        };

        if (contextSubject !== undefined) {
            newPreset.previewSubject = contextSubject;
        }

        Object.keys(newPreset).forEach(key => (newPreset as any)[key] === undefined && delete (newPreset as any)[key]);

        await saveDocument(user.uid, 'stylePresets', newId, newPreset);
    };

    const onAddMultiplePresets = async (presets: Omit<StylePreset, 'id'>[], contextSubject?: string) => {
        if (!user) return;

        for (const preset of presets) {
            const newId = generateId();
            let finalReferenceImages: string[] = [];

            if (preset.referenceImages && preset.referenceImages.length > 0) {
                finalReferenceImages = await Promise.all(
                    preset.referenceImages.map(img => {
                        if (img.startsWith('data:')) {
                            return uploadImage(user.uid, img, 'style-presets');
                        }
                        return Promise.resolve(img);
                    })
                );
            }

            const newPreset: StylePreset = {
                ...preset,
                id: newId,
                referenceImages: finalReferenceImages,
                status: 'complete',
                statusLastUpdatedAt: new Date().toISOString()
            };

            if (contextSubject !== undefined) {
                newPreset.previewSubject = contextSubject;
            }

            Object.keys(newPreset).forEach(key => (newPreset as any)[key] === undefined && delete (newPreset as any)[key]);

            await saveDocument(user.uid, 'stylePresets', newId, newPreset);
        }
    };

    const handleDeletePreset = async (id: string) => {
        if (!user) return;
        try {
            await deleteDocument(user.uid, 'stylePresets', id);
        } catch (error) {
            console.error(`Failed to delete preset ${id}:`, error);
            throw error;
        }
    };

    const handleAddGeneratedImage = async (
        productId: string,
        imageData: string,
        mimeType: string,
        prompt: ModularPrompt,
        source: any,
        batchJobId?: string,
        stylePresetId?: string,
        quality: ImageSize = '4K'
    ): Promise<GeneratedImage> => {
        if (!user) throw new Error("User not authenticated");
        const newImageId = generateId();
        const imageUrl = await uploadImage(user.uid, `data:${mimeType};base64,${imageData}`, 'generated');

        const newImage: GeneratedImage = {
            id: newImageId,
            productId,
            imageData: imageUrl,
            mimeType,
            prompt,
            approved: false,
            createdAt: new Date().toISOString(),
            source,
            quality
        };

        if (batchJobId) newImage.batchJobId = batchJobId;
        if (stylePresetId) newImage.stylePresetId = stylePresetId;

        await addArrayItem(user.uid, 'products', productId, 'generatedImages', newImage);
        return newImage;
    };

    const handleSetImageApproval = async (productId: string, imageId: string, approved: boolean) => {
        if (!user) return;
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const updatedImages = product.generatedImages.map(img =>
            img.id === imageId ? { ...img, approved } : img
        );

        await saveDocument(user.uid, 'products', productId, { generatedImages: updatedImages });
    };

    const handleDeleteGeneratedImages = async (productId: string, imageIds: string[]) => {
        if (!user) return;
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const imageIdsToDelete = new Set(imageIds);
        const updatedImages = product.generatedImages.filter(img => !imageIdsToDelete.has(img.id));

        await saveDocument(user.uid, 'products', productId, { generatedImages: updatedImages });
    };

    const handleLogGeneration = (log: any) => {
        if (user) saveDocument(user.uid, 'generationLogs', generateId(), { ...log, id: generateId(), timestamp: new Date().toISOString() });
    };

    const handleAddGeneratedVideo = async (productId: string, sourceImageId: string | undefined, videoBlob: Blob, prompt: any) => {
        if (!user) throw new Error("User not authenticated");
        const newVideoId = generateId();
        const videoUrl = await uploadImage(user.uid, videoBlob, 'generated-videos');

        const newVideo = {
            id: newVideoId,
            productId,
            sourceImageId,
            videoUrl,
            prompt,
            createdAt: new Date().toISOString()
        };

        await addArrayItem(user.uid, 'products', productId, 'generatedVideos', newVideo);
    };

    // --- Refine & Reshoot Handlers ---
    const handleRefineImage = async (productId: string, imageId: string, instruction: string) => {
        const product = products.find(p => p.id === productId);
        const image = product?.generatedImages.find(i => i.id === imageId);

        if (!product || !image) {
            console.error("Original product or image not found for refinement.");
            return;
        }

        // Use original quality or default to 4K.
        const quality: ImageSize = image.quality || '4K';
        const cost = getImageCost(quality);

        if (!deductCredits(cost)) return;

        try {
            const { imageData, mimeType } = await refineGeneratedImage(image.imageData, instruction, product.aspectRatio, quality);

            // Preserve prompt but append refinement note
            const refinedPrompt: ModularPrompt = {
                ...image.prompt,
                storyline: `${image.prompt?.storyline || ''} (Refined: ${instruction})`
            };

            await handleAddGeneratedImage(productId, imageData, mimeType, refinedPrompt, 'workshop', undefined, image.stylePresetId, quality);

            handleLogGeneration({
                productName: `${product.name} (Refine)`,
                status: 'success',
                duration: 0,
                action: 'Image Refinement',
                cost: cost,
            });
        } catch (error) {
            console.error("Refinement failed:", error);
            alert("Image refinement failed.");
        }
    };

    const handleReshootImage = async (productId: string, originalImage: GeneratedImage) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const style = stylePresets.find(s => s.id === originalImage.stylePresetId);
        if (!style && originalImage.stylePresetId) {
            alert("Original style preset has been deleted. Cannot reshoot.");
            return;
        }

        // Use original quality or default to 4K
        const quality: ImageSize = originalImage.quality || '4K';
        const cost = getImageCost(quality);

        if (!deductCredits(cost)) return;

        try {
            // Re-use prompt if style is deleted or use style's current prompt
            const promptToUse = style ? style : { prompt: originalImage.prompt } as any;

            if (!style) {
                if (!originalImage.prompt) throw new Error("No prompt data available.");
            }

            if (style) {
                const { imageData, mimeType } = await generateProductionImage(product, style, product.aspectRatio, quality);
                await handleAddGeneratedImage(productId, imageData, mimeType, style.prompt, 'workshop', undefined, style.id, quality);

                handleLogGeneration({
                    productName: `${product.name} (Reshoot)`,
                    status: 'success',
                    duration: 0,
                    action: 'Image Reshoot',
                    cost: cost,
                });
            } else {
                alert("Cannot reshoot: Associated style preset is missing.");
            }

        } catch (error) {
            console.error("Reshoot failed:", error);
            alert("Reshoot failed.");
        }
    };

    const handleRunJob = async (jobId: string) => {
        if (!user) return;
        const job = batchJobsRef.current.find(j => j.id === jobId);
        if (!job || !job.config || !job.config.productIds || !job.config.stylePresetIds) {
            console.error("Invalid job config", job);
            return;
        }

        const jobProducts = products.filter(p => job.config.productIds.includes(p.id));
        const jobStyles = stylePresets.filter(s => job.config.stylePresetIds.includes(s.id));

        if (jobProducts.length !== job.config.productIds.length || jobStyles.length !== job.config.stylePresetIds.length) {
            alert("Job contains deleted products or styles.");
            return;
        }

        await saveDocument(user.uid, 'batchJobs', jobId, { status: 'running', statusLastUpdatedAt: new Date().toISOString(), completedImages: job.completedImages || 0 });

        const tasksToRun = [];
        for (const product of jobProducts) {
            for (const style of jobStyles) {
                const progressKey = `${product.id}_${style.id}`;
                if (batchJobsRef.current.find(j => j.id === jobId)?.progressDetails?.[progressKey] !== 'completed') {
                    tasksToRun.push({ product, style });
                }
            }
        }

        // Increased concurrency for bulk processing
        const CONCURRENCY_LIMIT = 25;

        const taskProcessor = async (task: { product: Product, style: StylePreset }) => {
            const { product, style } = task;
            const progressKey = `${product.id}_${style.id}`;

            const currentJobState = batchJobsRef.current.find(j => j.id === jobId);
            // Abort if job was stopped by user (status changed to failed/completed externally)
            if (!currentJobState || currentJobState.status !== 'running') return;

            const qualityForGeneration = currentJobState.config.quality || '4K';
            const costPerImage = getImageCost(qualityForGeneration);

            // CRITICAL: Deduct credits per image generation in the loop
            if (!deductCredits(costPerImage)) {
                // If out of credits, fail the job entirely to prevent further processing
                await saveDocument(user.uid, 'batchJobs', jobId, { status: 'failed', statusLastUpdatedAt: new Date().toISOString() });
                return; // Stop this specific task
            }

            try {
                const aspectRatioForGeneration = currentJobState.config.aspectRatio || product.aspectRatio;

                const { imageData, mimeType } = await generateProductionImage(
                    product,
                    style,
                    aspectRatioForGeneration,
                    qualityForGeneration,
                    currentJobState.config.customInstruction
                );

                const promptUsed = await (async () => {
                    const { compilePrompt } = await import('./features/generation/imageGeneration.service');
                    return compilePrompt(product, style);
                })();

                await handleAddGeneratedImage(product.id, imageData, mimeType, promptUsed, 'batch_job', jobId, style.id, qualityForGeneration);

                const currentJob = batchJobsRef.current.find(j => j.id === jobId);
                if (currentJob) {
                    const updatedCompleted = (currentJob.completedImages || 0) + 1;
                    const updatedProgress = { ...currentJob.progressDetails, [progressKey]: 'completed' };
                    await saveDocument(user.uid, 'batchJobs', jobId, {
                        completedImages: updatedCompleted,
                        progressDetails: updatedProgress,
                        statusLastUpdatedAt: new Date().toISOString()
                    });
                }

                handleLogGeneration({
                    productName: product.name,
                    status: 'success',
                    duration: 0,
                    action: 'Batch Generation',
                    cost: costPerImage,
                });

            } catch (error) {
                console.error(`Task failed for ${product.name} with style ${style.name}:`, error);
                const currentJob = batchJobsRef.current.find(j => j.id === jobId);
                if (currentJob) {
                    const updatedProgress = { ...currentJob.progressDetails, [progressKey]: 'failed' };
                    await saveDocument(user.uid, 'batchJobs', jobId, {
                        progressDetails: updatedProgress,
                        statusLastUpdatedAt: new Date().toISOString()
                    });
                }
            }
        };

        const runTasks = async () => {
            let i = 0;
            while (i < tasksToRun.length) {
                const currentJobState = batchJobsRef.current.find(j => j.id === jobId);
                if (currentJobState?.status !== 'running') {
                    console.log(`Job ${jobId} stopped by user. Aborting further tasks.`);
                    break;
                }

                const batch = tasksToRun.slice(i, i + CONCURRENCY_LIMIT);
                await Promise.all(batch.map(taskProcessor));
                i += CONCURRENCY_LIMIT;
            }

            // After loop, check final status
            const finalJobState = batchJobsRef.current.find(j => j.id === jobId);
            if (finalJobState?.status === 'running') {
                await saveDocument(user.uid, 'batchJobs', jobId, { status: 'completed', statusLastUpdatedAt: new Date().toISOString() });
            }
        };

        runTasks();
    };


    const handleStopJob = async (jobId: string) => {
        if (!user) return;
        await saveDocument(user.uid, 'batchJobs', jobId, { status: 'failed', statusLastUpdatedAt: new Date().toISOString() });
    };

    const handleAddJob = (job: Omit<BatchJob, 'id' | 'createdAt' | 'status' | 'completedImages'>) => {
        if (!user) return;
        const newJob: BatchJob = {
            ...job,
            id: generateId(),
            createdAt: new Date().toISOString(),
            status: 'pending',
            completedImages: 0,
        };
        saveDocument(user.uid, 'batchJobs', newJob.id, newJob);
    };

    const handleDeleteJob = (jobId: string) => user && deleteDocument(user.uid, 'batchJobs', jobId);

    // --- RENDER LOGIC --- //
    const renderView = () => {
        // If we are in the brand creator view, render it immediately
        if (view === 'brandCreator') {
            return (
                <div key="brand-creator" className="view-transition-wrapper">
                    <BrandCreatorView
                        onAddBrand={addBrand}
                        onUpdateBrand={updateBrand}
                        editingBrand={brandToEdit}
                        deductCredits={deductCredits}
                        CREDIT_COSTS={CREDIT_COSTS}
                        onCancel={() => { setView('brandManagement'); setBrandToEdit(null); }}
                    />
                </div>
            );
        }

        // Standard Brand Check - if no brand selected, force brand management
        if (!selectedBrand) {
            return (
                <div key="brand-mgmt" className="view-transition-wrapper">
                    <BrandManagementView
                        brands={brands}
                        onAddBrand={addBrand}
                        onUpdateBrand={updateBrand}
                        onSelectBrand={handleSelectBrand}
                        selectedBrandId={selectedBrandId}
                        deductCredits={deductCredits}
                        CREDIT_COSTS={CREDIT_COSTS}
                        onDeleteBrand={deleteBrand}
                        onCreateBrand={() => { setBrandToEdit(null); setView('brandCreator'); }}
                        onEditBrand={(b) => { setBrandToEdit(b); setView('brandCreator'); }}
                    />
                </div>
            );
        }

        let content;
        switch (view) {
            case 'startHere':
                content = <StartHereView
                    brand={selectedBrand}
                    products={products}
                    stylePresets={stylePresets}
                    credits={credits}
                    recentLogs={generationLogs}
                    onNavigate={setView}
                    totalBrands={brands.length}
                />;
                break;
            case 'brandManagement':
                content = <BrandManagementView
                    brands={brands}
                    onAddBrand={addBrand}
                    onUpdateBrand={updateBrand}
                    onSelectBrand={handleSelectBrand}
                    selectedBrandId={selectedBrandId}
                    deductCredits={deductCredits}
                    CREDIT_COSTS={CREDIT_COSTS}
                    onDeleteBrand={deleteBrand}
                    onCreateBrand={() => { setBrandToEdit(null); setView('brandCreator'); }}
                    onEditBrand={(b) => { setBrandToEdit(b); setView('brandCreator'); }}
                />;
                break;
            case 'productManagement':
                content = <ProductManagementView products={products} onAddProducts={addProducts} onUpdateProduct={updateProduct} onDeleteProduct={deleteProduct} uploadInputRef={uploadProductsInputRef} onUploadProductsClick={() => uploadProductsInputRef.current?.click()} selectedBrand={selectedBrand} deductCredits={deductCredits} CREDIT_COSTS={CREDIT_COSTS} systemInstructions={systemInstructions} setView={setView} />;
                break;
            case 'styleLab':
                content = <StyleLabView stylePresets={stylePresets} onAddPreset={onAddPreset} onUpdatePreset={(id, p) => saveDocument(user!.uid, 'stylePresets', id, p)} onAddMultiplePresets={onAddMultiplePresets} onDeletePreset={handleDeletePreset} products={products} deductCredits={deductCredits} CREDIT_COSTS={CREDIT_COSTS} systemInstructions={systemInstructions} setView={setView} />;
                break;
            case 'workshop':
                content = <WorkshopView products={products} stylePresets={stylePresets} onAddGeneratedImage={handleAddGeneratedImage} addGenerationLog={handleLogGeneration} deductCredits={deductCredits} CREDIT_COSTS={CREDIT_COSTS} systemInstructions={systemInstructions} setView={setView} />;
                break;
            case 'videoLab':
                content = <VideosModeView products={products} onAddGeneratedVideo={handleAddGeneratedVideo} deductCredits={deductCredits} CREDIT_COSTS={CREDIT_COSTS} />;
                break;
            case 'repose':
                content = <ReposeView products={products} onAddGeneratedImage={async (pId, iD, mT, p, s, _, __, q) => { await handleAddGeneratedImage(pId, iD, mT, p, s, undefined, undefined, q); return ''; }} deductCredits={deductCredits} CREDIT_COSTS={CREDIT_COSTS} />;
                break;
            case 'batchJobs':
                content = <BatchJobsView jobs={batchJobs} products={products} stylePresets={stylePresets} onAddJob={handleAddJob} onRunJob={handleRunJob} onStopJob={handleStopJob} onDeleteJob={handleDeleteJob} onViewJobDetails={setViewingJobId} credits={credits} CREDIT_COSTS={CREDIT_COSTS} activeTimers={batchJobTimers} onStartTimer={startBatchJobTimer} />;
                break;
            case 'batchJobDetail':
                const job = batchJobs.find(j => j.id === viewingJobId);
                content = job ? <BatchJobDetailView job={job} allProducts={products} stylePresets={stylePresets} onBack={() => setView('batchJobs')} /> : <div>Job not found</div>;
                break;
            case 'genContent':
                content = <GenContentView products={products} stylePresets={stylePresets} batchJobs={batchJobs} onSetImageApproval={handleSetImageApproval} onDeleteGeneratedImages={handleDeleteGeneratedImages} onRefineImage={handleRefineImage} onReshootImage={handleReshootImage} />;
                break;
            case 'resourceIntelligence':
                content = <ResourceIntelligenceView onNavigate={setView} />;
                break;
            case 'backend':
                content = (
                    <div className="view-container">
                        <div className="view-header"><h2>System & Settings</h2></div>
                        <div className="backend-card-grid">
                            <div className="card backend-card is-button" onClick={() => setView('performance')}><div className="backend-card-content"><h3>Performance</h3><p>View generation logs and system metrics.</p></div></div>
                            <div className="card backend-card is-button" onClick={() => setView('customizeSystem')}><div className="backend-card-content"><h3>Customize AI</h3><p>Edit the underlying system instructions for AI agents.</p></div></div>
                            <div className="card backend-card is-button" onClick={() => setView('costBilling')}><div className="backend-card-content"><h3>Cost & Billing</h3><p>Track credit usage and manage your subscription.</p></div></div>
                        </div>
                        <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <button className="button-secondary" onClick={handleLogout}>Logout</button>
                            <AccentColorSelector />
                        </div>
                    </div>
                );
                break;
            case 'performance':
                content = <SystemPerformanceView logs={generationLogs} onClearLogs={() => { if (window.confirm('Delete all logs?')) generationLogs.forEach(l => deleteDocument(user!.uid, 'generationLogs', l.id)) }} />;
                break;
            case 'customizeSystem':
                content = <CustomizeSystemView industry={selectedBrand.industry} instructions={systemInstructions} onSave={(i) => saveDocument(user!.uid, 'settings', 'systemInstructions', i)} onCancel={() => setView('backend')} />;
                break;
            case 'costBilling':
                content = <CostBillingView credits={credits} logs={generationLogs} onNavigate={setView} />;
                break;
            default: content = <div>Not implemented</div>;
        }

        return <div key={view} className="view-transition-wrapper">{content}</div>;
    };

    if (!user) return <LoginView />;

    const viewingJob = batchJobs.find(j => j.id === viewingJobId);

    return (
        <div className="app-container" onMouseMove={handleMouseMove}>
            {/* Liquid Background Elements */}
            <div className="liquid-background">
                <div className="liquid-orb orb-1"></div>
                <div className="liquid-orb orb-2"></div>
                <div className="liquid-orb orb-3"></div>
                <div className="liquid-orb orb-4"></div>
                {/* Central gradient blob behind card */}
                <div className="liquid-orb orb-center"></div>
                <div className="liquid-orb orb-mouse"></div>
            </div>

            <Sidebar
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
                view={view}
                onSetView={setView}
                brand={selectedBrand}
                user={user}
            />
            <div className="main-content-wrapper">
                <MobileHeader
                    onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    brandName={selectedBrand?.name}
                />
                {viewingJobId && viewingJob ? (
                    <div key="job-detail" className="view-transition-wrapper">
                        <BatchJobDetailView job={viewingJob} allProducts={products} stylePresets={stylePresets} onBack={() => { setViewingJobId(null); setView('batchJobs'); }} />
                    </div>
                ) : renderView()}
            </div>

            <Modal isOpen={isResetConfirmModalOpen} onClose={() => setIsResetConfirmModalOpen(false)} title="Confirm Factory Reset">
                <p>Are you sure you want to reset all application data? This will delete all brands, products, styles, and jobs. This action cannot be undone.</p>
                <div className="modal-actions">
                    <button onClick={() => setIsResetConfirmModalOpen(false)}>Cancel</button>
                    <button className="button-danger">Confirm Reset</button>
                </div>
            </Modal>
        </div>
    );
};
