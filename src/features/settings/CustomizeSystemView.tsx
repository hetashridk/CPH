
import React, { useState, useRef, useMemo } from 'react';
import { EditableMarkdown } from '../../core/components/Modal';
import { IconButton } from '../../core/components/IconButton';
import { SystemInstructions, Industry, View } from '../../core/types';
import { DEFAULT_SYSTEM_INSTRUCTIONS } from './systemPrompts';

type InstructionKey = keyof SystemInstructions;

const instructionMetadata: Record<InstructionKey, { title: string; description: string; group: string }> = {
    analyzeBrandFromUrl: { title: "Analyze Brand DNA from Website", description: "The instruction for analyzing a brand's website to extract its core DNA, including essence, audience, and visual style.", group: "Brand Analysis" },
    analyzePackagedFoodSingle: { title: "Analyze Packaged Food (Single Image)", description: "The instruction for when one image of a food product is uploaded.", group: "Product Analysis" },
    analyzePackagedFoodMulti: { title: "Analyze Packaged Food (Multiple Images)", description: "The instruction for when front and back images of a food product are uploaded.", group: "Product Analysis" },
    analyzeGenericProduct: { title: "Analyze Generic Product", description: "The default instruction for analyzing products in industries like Fashion or Creative.", group: "Product Analysis" },
    analyzeHomeDecorProduct: { title: "Analyze Home Decor Product", description: "The instruction for analyzing furniture, decor, and other home goods.", group: "Product Analysis" },
    analyzeRealEstateListing: { title: "Analyze Real Estate Listing", description: "The instruction for analyzing images of property interiors and exteriors.", group: "Product Analysis" },
    autoGroupImages: { title: "Auto-Group Product Images", description: "The instruction for grouping multiple images of the same product into a single entry.", group: "Product Organization" },
    generatePromptFromIdea: { title: "Generate Style from Idea", description: "The core instruction for turning a user's idea into a detailed modular prompt.", group: "Style Generation" },
    generateStyleFromBatch: { title: "Generate Style from Image", description: "The instruction for analyzing a reference image to create a new style preset.", group: "Style Generation" },
    createStylePresetFromIdea: { title: "Create Style Preset from Idea (Prompt Lab)", description: "The instruction for converting a single creative idea into a full style preset.", group: "Style Generation" },
    generateStylePresetName: { title: "Generate Style Preset Name", description: "The instruction for creating a creative name for a style preset based on its prompt.", group: "Style Generation" },
    generateReferenceImageForPreset: { title: "Generate Style Thumbnail", description: "The base prompt for generating the thumbnail image for a style preset. (A generic product is appended).", group: "Style Generation" },
    generateProductionImage: { title: "Generate Image (Text-to-Image)", description: "The system instruction when generating an image from a text prompt only (e.g., for style thumbnails).", group: "Image Generation" },
    generateProductionImageWithSource: { title: "Generate Image (Image-to-Image)", description: "The complex instruction for placing a source product into a new scene. Use {aspectRatio} and {creativeDirection} as placeholders.", group: "Image Generation" },
    refineGeneratedImage: { title: "Refine Generated Image", description: "The instruction for making iterative changes to a generated image. The user's feedback is appended.", group: "Image Generation" },
    styleAssistant: { title: "Style Assistant Persona", description: "The complete persona and instruction set for the AI Style Assistant in the Style Lab.", group: "AI Assistants" },
};

const instructionVisibilityMap: Record<InstructionKey, Industry[]> = {
    analyzeBrandFromUrl: [],
    analyzePackagedFoodSingle: ['Packaged Food'],
    analyzePackagedFoodMulti: ['Packaged Food'],
    analyzeGenericProduct: ['Fashion', 'Creative Exploration'],
    analyzeHomeDecorProduct: ['Home Decor'],
    analyzeRealEstateListing: ['Real Estate'],
    autoGroupImages: [],
    generatePromptFromIdea: [],
    generateStyleFromBatch: [],
    createStylePresetFromIdea: [],
    generateStylePresetName: [],
    generateReferenceImageForPreset: [],
    generateProductionImage: [],
    generateProductionImageWithSource: [],
    refineGeneratedImage: [],
    styleAssistant: [],
};

interface ViewConfig {
    id: string;
    label: string;
    instructions: InstructionKey[];
}

const VIEW_HIERARCHY: ViewConfig[] = [
    { id: 'brandManagement', label: 'Brand Management', instructions: ['analyzeBrandFromUrl'] },
    { id: 'productManagement', label: 'Product Management', instructions: [ 'analyzeGenericProduct', 'analyzePackagedFoodSingle', 'analyzePackagedFoodMulti', 'analyzeHomeDecorProduct', 'analyzeRealEstateListing', 'autoGroupImages' ] },
    { id: 'styleLab', label: 'Style Lab', instructions: [ 'styleAssistant', 'generateStyleFromBatch', 'generatePromptFromIdea', 'generateStylePresetName', 'generateReferenceImageForPreset' ] },
    { id: 'batchJobs', label: 'Batch Jobs', instructions: [ 'generateProductionImage', 'generateProductionImageWithSource' ] },
    { id: 'delivery', label: 'Delivery', instructions: [ 'refineGeneratedImage' ] },
];

export const CustomizeSystemView: React.FC<{
    industry: Industry | null;
    instructions: SystemInstructions;
    onSave: (newInstructions: SystemInstructions) => void;
    onCancel: () => void;
}> = ({ industry, instructions, onSave, onCancel }) => {
    const [draft, setDraft] = useState<SystemInstructions>(instructions);
    const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
    const [selectedInstructionKey, setSelectedInstructionKey] = useState<InstructionKey | null>(null);
    const importRef = useRef<HTMLInputElement>(null);

    const instructionIsVisible = (key: InstructionKey, currentIndustry: Industry | null): boolean => {
        if (!currentIndustry) return false;
        const visibility = instructionVisibilityMap[key];
        if (!visibility || visibility.length === 0) {
            return true;
        }
        return visibility.includes(currentIndustry);
    };

    const handleInstructionChange = (key: InstructionKey, value: string) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const handleResetInstruction = (key: InstructionKey) => {
        handleInstructionChange(key, DEFAULT_SYSTEM_INSTRUCTIONS[key]);
    };
    
    const handleResetAll = () => {
        if (window.confirm("Are you sure you want to reset all instructions to their default values? This will discard your current changes.")) {
            setDraft(DEFAULT_SYSTEM_INSTRUCTIONS);
        }
    };

    const handleExport = () => {
        const jsonString = JSON.stringify(draft, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-marketing-studio-system-config.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const importedData = JSON.parse(text);

                if (typeof importedData !== 'object' || importedData === null || Array.isArray(importedData)) {
                    throw new Error("Invalid format: imported file must be an object.");
                }

                const newInstructions = { ...DEFAULT_SYSTEM_INSTRUCTIONS };
                let keysFound = 0;

                for (const key of Object.keys(DEFAULT_SYSTEM_INSTRUCTIONS)) {
                    if (Object.prototype.hasOwnProperty.call(importedData, key)) {
                        if (typeof (importedData as any)[key] === 'string') {
                            newInstructions[key as InstructionKey] = (importedData as any)[key];
                            keysFound++;
                        } else {
                            console.warn(`Ignoring key "${key}" from import due to invalid type.`);
                        }
                    }
                }
                
                if (keysFound === 0) {
                     throw new Error("No valid instructions found in the imported file.");
                }

                setDraft(newInstructions);
                alert("Instructions successfully imported. Review and click 'Save Changes' to apply them.");

            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                alert(`Failed to import instructions: ${message}`);
            } finally {
                if(importRef.current) importRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    if (selectedInstructionKey) {
        const meta = instructionMetadata[selectedInstructionKey];
        return (
            <div className="view-container">
                <div className="view-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <IconButton icon="<" tooltip="Back to Use Cases" onClick={() => setSelectedInstructionKey(null)} />
                        <div>
                            <h2>{meta.title}</h2>
                            <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)'}}>{meta.description}</p>
                        </div>
                    </div>
                    <div className="style-library-header-actions">
                        <button className="button-secondary" onClick={() => handleResetInstruction(selectedInstructionKey)}>Reset to Default</button>
                        <button className="button-primary" onClick={() => onSave(draft)}>Save Changes</button>
                    </div>
                </div>
                <div className="customize-system-content">
                    <div className="system-instruction-group" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                        <EditableMarkdown
                            value={draft[selectedInstructionKey]}
                            onChange={(newValue) => handleInstructionChange(selectedInstructionKey, newValue)}
                            isTextarea
                            rows={25}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (selectedViewId) {
        const viewConfig = VIEW_HIERARCHY.find(v => v.id === selectedViewId);
        const visibleInstructions = viewConfig?.instructions.filter(key => instructionIsVisible(key, industry)) || [];

        return (
            <div className="view-container">
                <div className="view-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <IconButton icon="<" tooltip="Back to Views" onClick={() => setSelectedViewId(null)} />
                        <h2>{viewConfig?.label} Settings</h2>
                    </div>
                    <button className="button-primary" onClick={() => onSave(draft)}>Save Changes</button>
                </div>
                
                {visibleInstructions.length === 0 ? (
                    <div className="empty-state">
                        <p>No customizable AI settings available for this view in the current mode.</p>
                    </div>
                ) : (
                    <div className="backend-card-grid">
                        {visibleInstructions.map(key => {
                            const meta = instructionMetadata[key];
                            return (
                                <div 
                                    key={key} 
                                    className="backend-card is-button" 
                                    onClick={() => setSelectedInstructionKey(key)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="backend-card-content">
                                        <h3>{meta.title}</h3>
                                        <p>{meta.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="view-container">
            <input type="file" ref={importRef} style={{ display: 'none' }} accept=".json" onChange={handleImport} />
            <div className="view-header">
                <h2>Customize System: <span style={{ color: 'var(--text-main)' }}>{industry}</span></h2>
                <div className="catalogue-header-actions">
                    <button className="button-secondary" onClick={() => importRef.current?.click()}>Import</button>
                    <button className="button-secondary" onClick={handleExport}>Export</button>
                    <button className="button-danger" onClick={handleResetAll}>Reset All</button>
                    <button className="button-secondary" onClick={onCancel}>Close</button>
                </div>
            </div>
            
            <p style={{ marginTop: '-1.5rem', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Select a view to customize the AI behavior, prompt templates, and system instructions used within that specific area of the application.
            </p>

            <div className="backend-card-grid">
                {VIEW_HIERARCHY.map(view => (
                    <div 
                        key={view.id} 
                        className="backend-card is-button" 
                        onClick={() => setSelectedViewId(view.id)}
                        role="button"
                        tabIndex={0}
                    >
                        <div className="backend-card-content">
                            <h3>{view.label}</h3>
                            <p>Customize {view.instructions.filter(k => instructionIsVisible(k, industry)).length} AI behaviors.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
