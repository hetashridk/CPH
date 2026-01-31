import React, { useState, useMemo, useEffect } from 'react';
import { ICONS, IconButton } from '../../core/components/IconButton';
import { EditableMarkdown } from '../../core/components/Modal';
import { Select } from '../../core/components/Select';
import { EmptyState } from '../../core/components/EmptyState';
import { generateVideoFromImage, generateVideoFromText, generateCreativeVideoIdeas, generateVideoDna } from './videoGeneration.service';
import type { Product, GeneratedImage, VideoPromptDNA, GeneratedVideo } from '../../core/types';

interface VideosModeViewProps {
    products: Product[];
    onAddGeneratedVideo: (productId: string, sourceImageId: string | undefined, videoBlob: Blob, prompt: VideoPromptDNA) => Promise<void>;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { VIDEO_GENERATION: number; PROMPT_IDEAS: number, PROMPT_FROM_IDEA: number };
}

interface EnrichedVideo extends GeneratedVideo {
    productName: string;
}

type WorkflowState = 'idle' | 'ideating' | 'ideasGenerated' | 'generatingDna' | 'dnaGenerated';
type VideoMode = 'i2v' | 't2v';

const emptyDna: VideoPromptDNA = { shotType: '', cameraMovement: '', cameraAngle: '', subjectAction: '', sceneDescription: '', lightingStyle: '', timeOfDay: '', environment: '', mood: '', colorGrade: '', filmStock: '', fx: '', duration: '', negativePrompt: '' };

export const VideosModeView: React.FC<VideosModeViewProps> = ({ 
    products, 
    onAddGeneratedVideo, 
    deductCredits, 
    CREDIT_COSTS 
}) => {
    
    // --- State ---
    const [mode, setMode] = useState<VideoMode>('i2v');
    const [selectedImage, setSelectedImage] = useState<(GeneratedImage & { productName: string }) | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    
    // AI Workflow State
    const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
    const [creativeIdeas, setCreativeIdeas] = useState<string[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
    const [videoDna, setVideoDna] = useState<VideoPromptDNA>(emptyDna);
    
    // Text-to-Video State
    const [t2vProductId, setT2vProductId] = useState<string | null>(null);
    const [t2vTextPrompt, setT2vTextPrompt] = useState('');

    // Generation Config State
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [resolution, setResolution] = useState('720p');

    // --- Derived Data ---
    const allGeneratedImages = useMemo(() => {
        return products.flatMap(p => 
            p.generatedImages.map(img => ({...img, productName: p.name}))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [products]);

    const allGeneratedVideos = useMemo<EnrichedVideo[]>(() => {
        return products.flatMap(p => 
            (p.generatedVideos || []).map(vid => ({...vid, productName: p.name}))
        ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [products]);

    const resetWorkflow = () => {
        setWorkflowState('idle');
        setCreativeIdeas([]);
        setSelectedIdea(null);
        setVideoDna(emptyDna);
        setT2vTextPrompt('');
    };

    useEffect(() => {
        resetWorkflow();
        setSelectedImage(null);
        setT2vProductId(null);
    }, [mode]);

    useEffect(() => {
        resetWorkflow();
    }, [selectedImage, t2vProductId]);

    // --- Handlers ---

    const handleGenerateIdeas = async () => {
        if (!selectedImage) return;
        if (!deductCredits(CREDIT_COSTS.PROMPT_IDEAS)) return;
        setWorkflowState('ideating');
        try {
            const ideas = await generateCreativeVideoIdeas(selectedImage);
            setCreativeIdeas(ideas);
            setWorkflowState('ideasGenerated');
        } catch (error) {
            console.error("Failed to generate creative ideas:", error);
            alert("The AI Ideator failed to generate ideas. Please try again.");
            setWorkflowState('idle');
        }
    };

    const handleSelectIdeaAndGenerateDna = async (idea: string) => {
        if (!selectedImage) return;
        if (!deductCredits(CREDIT_COSTS.PROMPT_FROM_IDEA)) return;

        setSelectedIdea(idea);
        setWorkflowState('generatingDna');
        try {
            const dna = await generateVideoDna(selectedImage.productName, idea, { imageData: selectedImage.imageData });
            setVideoDna(dna);
            setWorkflowState('dnaGenerated');
        } catch (error) {
            console.error("Failed to generate Video DNA:", error);
            alert("The AI Expert failed to generate the prompt DNA. Please try again.");
            setWorkflowState('ideasGenerated');
        }
    };
    
    const handleGenerateDnaFromText = async () => {
        const product = products.find(p => p.id === t2vProductId);
        if (!product || !t2vTextPrompt) return;
        if (!deductCredits(CREDIT_COSTS.PROMPT_FROM_IDEA)) return;
        setWorkflowState('generatingDna');
        try {
            const dna = await generateVideoDna(product.name, t2vTextPrompt);
            setVideoDna(dna);
            setWorkflowState('dnaGenerated');
        } catch (error) {
            console.error("Failed to generate Video DNA from text:", error);
            alert("The AI Expert failed to generate the prompt DNA. Please try again.");
            setWorkflowState('idle');
        }
    };

    const handleDnaChange = (field: keyof VideoPromptDNA, value: string) => {
        setVideoDna(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateVideo = async () => {
        if (workflowState !== 'dnaGenerated' || !videoDna) return;
        
        let contextProduct: Product | undefined;
        if (mode === 'i2v') contextProduct = products.find(p => p.id === selectedImage?.productId);
        if (mode === 't2v') contextProduct = products.find(p => p.id === t2vProductId);
        if (!contextProduct) return;

        if (!deductCredits(CREDIT_COSTS.VIDEO_GENERATION)) return;

        setIsGeneratingVideo(true);

        const promptObject = {
            productContext: {
                name: contextProduct.name,
                description: contextProduct.description,
                dna: contextProduct.dna || {}
            },
            videoPromptDNA: videoDna
        };
        const fullPrompt = JSON.stringify(promptObject, null, 2);
        const generationConfig = { aspectRatio, resolution };

        try {
            const videoBlob = mode === 'i2v'
                ? await generateVideoFromImage(selectedImage!.imageData, fullPrompt, generationConfig)
                : await generateVideoFromText(fullPrompt, generationConfig);

            await onAddGeneratedVideo(contextProduct.id, mode === 'i2v' ? selectedImage!.id : undefined, videoBlob, videoDna);
            resetWorkflow();
        } catch (error: any) {
            console.error("Video generation failed:", error);
            alert(`Generation failed: ${error.message}`);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleDownloadVideo = (videoUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>AI Video Lab</h2>
                    <p className="view-header-subtitle">Turn your product assets into cinematic motion video.</p>
                </div>
                <div className="view-header-actions">
                    <span className="stat-pill success"><strong>Veo 3.1</strong> Enabled</span>
                </div>
            </div>

            <div className="video-lab-3-panel-layout">
                {/* --- Panel 1: Image Selector --- */}
                <div className={`video-lab-panel ${mode === 't2v' ? 'disabled' : ''}`}>
                    <div className="video-lab-panel-content">
                        <div className="modal-form-group">
                            <label>1. Select Source Asset</label>
                        </div>
                        {allGeneratedImages.length > 0 ? (
                            <div className="repose-image-grid">
                                {allGeneratedImages.map(img => (
                                    <div 
                                        key={img.id} 
                                        className={`repose-image-card ${selectedImage?.id === img.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img.imageData} alt={img.productName} loading="lazy" />
                                        <div className="product-name-overlay">{img.productName}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState 
                                title="No Images Found" 
                                message="Generate images in the Workshop or Repose views first to use them as a base for video generation."
                            />
                        )}
                    </div>
                </div>

                {/* --- Panel 2: Config & Prompting --- */}
                <div className="video-lab-panel video-lab-prompting-panel">
                    <div className="mode-selector">
                        <div className="segmented-control">
                            <button className={mode === 'i2v' ? 'active' : ''} onClick={() => setMode('i2v')}>Image to Video</button>
                            <button className={mode === 't2v' ? 'active' : ''} onClick={() => setMode('t2v')}>Text to Video</button>
                        </div>
                    </div>
                    
                    <div className="video-lab-panel-content video-lab-prompting-panel-content">
                        {/* --- I2V WORKFLOW --- */}
                        {mode === 'i2v' && (
                            <>
                                <div className="repose-selected-image-preview">
                                    {selectedImage ? <img src={selectedImage.imageData} alt="Selected for video" /> : <div>{ICONS.images}<span>Select an image</span></div>}
                                </div>
                                {workflowState === 'idle' && <button className="button-primary button-lg" onClick={handleGenerateIdeas} disabled={!selectedImage}>✨ Generate Creative Ideas ({CREDIT_COSTS.PROMPT_IDEAS} Cr)</button>}
                                {workflowState === 'ideating' && <div className="spinner" style={{margin: 'auto'}}/>}
                                {workflowState === 'ideasGenerated' && (
                                    <div>
                                        <h4 style={{ margin: '0 0 var(--space-4) 0' }}>2. Choose a Creative Direction</h4>
                                        <div className="idea-list">{creativeIdeas.map((idea, i) => <div key={i} className="idea-card" onClick={() => handleSelectIdeaAndGenerateDna(idea)}>{idea}</div>)}</div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* --- T2V WORKFLOW --- */}
                        {mode === 't2v' && (
                            <>
                                <div className="modal-form-group">
                                    <label>1. Select Contextual Product</label>
                                    <Select options={products.map(p => ({ value: p.id, label: p.name }))} value={t2vProductId || ''} onChange={setT2vProductId} placeholder="Choose a product..."/>
                                </div>
                                {workflowState === 'idle' && (
                                    <div className="modal-form-group">
                                        <label>2. Describe Your Video Idea</label>
                                        <EditableMarkdown value={t2vTextPrompt} onChange={setT2vTextPrompt} isTextarea rows={5} placeholder="e.g., A bottle of perfume on a rainy Parisian street at night."/>
                                        <button className="button-primary button-lg" onClick={handleGenerateDnaFromText} disabled={!t2vProductId || !t2vTextPrompt.trim()}>✨ Generate Expert DNA ({CREDIT_COSTS.PROMPT_FROM_IDEA} Cr)</button>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {/* --- SHARED WORKFLOW STEPS --- */}
                        {workflowState === 'generatingDna' && <div className="spinner" style={{margin: 'auto'}}/>}
                        {workflowState === 'dnaGenerated' && (
                           <div>
                                <h4 style={{ margin: '0 0 var(--space-4) 0' }}>{mode === 'i2v' ? '3.' : '3.'} Refine Video Prompt DNA</h4>
                                <div className="video-config-grid">
                                    <div className="modal-form-group"><label>Aspect Ratio</label><Select value={aspectRatio} onChange={setAspectRatio} options={['16:9', '9:16', '1:1', '4:3', '3:4'].map(o => ({value: o, label: o}))} /></div>
                                    <div className="modal-form-group"><label>Resolution</label><Select value={resolution} onChange={setResolution} options={['720p', '1080p'].map(o => ({value: o, label: o}))} /></div>
                                </div>
                                <div className="dna-grid">
                                    {Object.entries(videoDna).map(([key, value]) => (
                                        <div key={key} className="dna-field-card">
                                            <div className="modal-form-group">
                                                <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                                <EditableMarkdown value={value} onChange={v => handleDnaChange(key as keyof VideoPromptDNA, v)} isTextarea={['sceneDescription', 'subjectAction', 'negativePrompt'].includes(key)} rows={3} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                           </div>
                        )}
                    </div>
                    
                    <div className="repose-footer">
                        <div className="repose-footer-summary">Est. Cost: <strong>{CREDIT_COSTS.VIDEO_GENERATION} Cr</strong></div>
                        <button className="button-primary button-lg" onClick={handleGenerateVideo} disabled={workflowState !== 'dnaGenerated' || isGeneratingVideo}>
                            {isGeneratingVideo ? <><span className="spinner" /> Generating...</> : 'Generate Video'}
                        </button>
                    </div>
                </div>

                {/* --- Panel 3: Gallery & Results --- */}
                <div className="video-lab-panel">
                    <div className="video-lab-panel-content">
                        {isGeneratingVideo && (
                            <div className="repose-generation-placeholder">
                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center'}}>
                                    <span className="spinner" style={{width: '32px', height: '32px'}}></span>
                                    <h3>Generating video...</h3>
                                    <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>This may take a few minutes. You can continue working in other tabs, but do not close this window.</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-4)' }}>Generated Videos ({allGeneratedVideos.length})</h3>
                            {allGeneratedVideos.length === 0 && !isGeneratingVideo ? (
                                <div style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Your generated videos will appear here.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-5)' }}>
                                    {allGeneratedVideos.map(video => (
                                        <div key={video.id} className="card" style={{ padding: 'var(--space-4)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{video.productName}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(video.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <video controls controlsList="nodownload" style={{ width: '100%', borderRadius: 'var(--radius-md)', backgroundColor: '#000', aspectRatio: '16/9' }} src={video.videoUrl} />
                                            <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', overflow: 'hidden' }}>
                                                    <span className="token-badge">{video.prompt.shotType}</span>
                                                    <span className="token-badge">{video.prompt.mood}</span>
                                                    <span className="token-badge">{video.prompt.lightingStyle}</span>
                                                </div>
                                                <IconButton icon="download" tooltip="Download Video" onClick={() => handleDownloadVideo(video.videoUrl, `video_${video.productName.replace(/\s+/g, '_')}_${video.id.substring(0,6)}.mp4`)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};