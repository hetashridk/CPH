
import React, { useState, useEffect } from 'react';
import { Modal } from '../../../core/components/Modal';
import { Select } from '../../../core/components/Select';
import { ChipInput } from '../../../core/components/ChipInput';
import { generateId } from '../../../core/utils/misc';
import { analyzeBrandFromUrl } from '../brandAnalysis.service';
import { Brand, BrandDNA, Industry } from '../../../core/types';

const industries: Industry[] = [
    'Packaged Food', 'Fashion', 'Home Decor', 'Real Estate', 'Creative Exploration',
    'Technology', 'Health & Wellness', 'Beauty', 'Automotive', 'Beverage', 'Retail', 'Hospitality', 'Luxury Goods', 'Media & Entertainment'
];

const emptyDNA: BrandDNA = {
    brandEssence: '',
    targetAudience: '',
    visualStyle: [],
    toneOfVoice: [],
};

export const BrandCreatorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddBrand: (brand: Brand) => void;
    onUpdateBrand: (brand: Brand) => void;
    editingBrand: Brand | null;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { BRAND_ANALYSIS: number };
    onDelete?: (brandId: string) => void;
}> = ({ isOpen, onClose, onAddBrand, onUpdateBrand, editingBrand, deductCredits, CREDIT_COSTS, onDelete }) => {
    
    const [urlInput, setUrlInput] = useState('');
    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState<Industry>('Creative Exploration');
    const [dna, setDna] = useState<BrandDNA>(emptyDNA);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingBrand) {
                setBrandName(editingBrand.name);
                setIndustry(editingBrand.industry);
                setDna(editingBrand.dna);
                setUrlInput(editingBrand.websiteUrl || '');
            } else {
                setUrlInput('');
                setBrandName('');
                setDna(emptyDNA);
                setIndustry('Creative Exploration');
                setError('');
            }
        }
    }, [isOpen, editingBrand]);

    const handleAnalyze = async () => {
        if (!urlInput.trim()) {
            setError('Please enter a brand name or website URL.');
            return;
        }
        if (!deductCredits(CREDIT_COSTS.BRAND_ANALYSIS)) {
            return;
        }
        setError('');
        setIsAnalyzing(true);
        try {
            const analysisResult = await analyzeBrandFromUrl(urlInput);
            setDna(analysisResult.dna);
            if (analysisResult.brandName) {
                setBrandName(analysisResult.brandName);
            }
            if (analysisResult.industry) {
                setIndustry(analysisResult.industry);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to analyze the brand. Please check the URL or fill the details manually.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleDelete = () => {
        if (editingBrand && onDelete) {
            onDelete(editingBrand.id);
        }
    };
    
    const handleSave = () => {
        if (!brandName.trim()) {
            alert('Brand Name is required.');
            return;
        }
        
        if (editingBrand) {
            const updatedBrand: Brand = { ...editingBrand, name: brandName, industry, dna, status: 'approved', websiteUrl: urlInput };
            onUpdateBrand(updatedBrand);
        } else {
            const newBrand: Brand = {
                id: generateId(),
                name: brandName,
                industry,
                websiteUrl: urlInput,
                status: 'approved',
                dna,
            };
            onAddBrand(newBrand);
        }
        onClose();
    };
    
    const handleKeywordChange = (field: 'visualStyle' | 'toneOfVoice', newChips: string[]) => {
        setDna(prev => ({ ...prev, [field]: newChips }));
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Create New Brand Workspace'} 
            size="xlarge"
        >
            <div className="brand-creator-layout">
                <div className="ai-analyst-section">
                    <h4>Start with AI Analyst</h4>
                    <p>Enter a brand name or website URL to automatically extract its Brand DNA.</p>
                    <div className="input-group">
                        <input 
                            type="text" 
                            value={urlInput} 
                            onChange={e => setUrlInput(e.target.value)} 
                            placeholder="e.g. www.apple.com" 
                            disabled={isAnalyzing}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        />
                        <button className="button-primary" onClick={handleAnalyze} disabled={isAnalyzing} style={{ whiteSpace: 'nowrap' }}>
                            {isAnalyzing ? <span className="spinner" /> : (CREDIT_COSTS.BRAND_ANALYSIS > 0 ? `Analyze (${CREDIT_COSTS.BRAND_ANALYSIS} Cr)` : `Analyze (Free)`)}
                        </button>
                    </div>
                    {error && <p style={{ marginTop: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--danger)' }}>{error}</p>}
                </div>

                <div className="form-divider">OR FILL MANUALLY BELOW</div>

                <div className="brand-dna-form-wrapper">
                    {isAnalyzing && (
                        <div className="loading-overlay">
                            <span className="spinner" />
                            <span>Analyzing Brand DNA...</span>
                        </div>
                    )}
                    <div className="brand-dna-form-grid">
                        <div className="form-column">
                            <div className="modal-form-group">
                                <label>Brand Name</label>
                                <p className="field-helper">The official name of your brand or workspace.</p>
                                <input 
                                    value={brandName} 
                                    onChange={e => setBrandName(e.target.value)} 
                                    placeholder="e.g., My Awesome Brand"
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Industry</label>
                                <p className="field-helper">The market category that best fits your brand.</p>
                                <Select 
                                    value={industry} 
                                    onChange={val => setIndustry(val as Industry)}
                                    options={industries.map(ind => ({ value: ind, label: ind }))}
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Brand Essence</label>
                                <p className="field-helper">Core mission, values, and identity.</p>
                                <textarea value={dna.brandEssence || ''} onChange={e => setDna({...dna, brandEssence: e.target.value})} rows={5} style={{ resize: 'vertical' }} placeholder="e.g., Minimalist sustainable fashion for the modern creative."/>
                            </div>
                        </div>
                        <div className="form-column">
                             <div className="modal-form-group">
                                <label>Target Audience</label>
                                <p className="field-helper">Who this brand is for.</p>
                                <textarea value={dna.targetAudience || ''} onChange={e => setDna({...dna, targetAudience: e.target.value})} rows={5} style={{ resize: 'vertical' }} placeholder="e.g., Urban professionals aged 25-40 who value quality and design."/>
                            </div>
                            <div className="modal-form-group">
                                <label>Visual Style Keywords</label>
                                <p className="field-helper">Comma-separated (e.g., Minimalist, Dark).</p>
                                <ChipInput 
                                    chips={dna.visualStyle} 
                                    onChange={newChips => handleKeywordChange('visualStyle', newChips)}
                                    placeholder="Add keyword..."
                                />
                            </div>
                            <div className="modal-form-group">
                                <label>Tone of Voice Keywords</label>
                                <p className="field-helper">Comma-separated (e.g., Friendly, Professional, Witty).</p>
                                <ChipInput 
                                    chips={dna.toneOfVoice} 
                                    onChange={newChips => handleKeywordChange('toneOfVoice', newChips)}
                                    placeholder="Add keyword..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-actions">
                {editingBrand && onDelete && (
                    <button className="button-danger" style={{ marginRight: 'auto' }} onClick={handleDelete}>
                        Delete Brand
                    </button>
                )}
                <button className="button-secondary" onClick={onClose}>Cancel</button>
                <button className="button-primary" onClick={handleSave}>
                    {editingBrand ? 'Save Changes' : 'Create Brand'}
                </button>
            </div>
        </Modal>
    );
};
