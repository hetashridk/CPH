
import React, { useState, useEffect } from 'react';
import { ChipInput } from '../../core/components/ChipInput';
import { generateId } from '../../core/utils/misc';
import { analyzeBrandFromUrl } from './brandAnalysis.service';
import { Brand, BrandDNA, Industry } from '../../core/types';

const emptyDNA: BrandDNA = {
    brandEssence: '',
    targetAudience: '',
    visualStyle: [],
    toneOfVoice: [],
};

interface BrandCreatorViewProps {
    onAddBrand: (brand: Brand) => void;
    onUpdateBrand: (brand: Brand) => void;
    editingBrand: Brand | null;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { BRAND_ANALYSIS: number };
    onCancel: () => void;
}

export const BrandCreatorView: React.FC<BrandCreatorViewProps> = ({ 
    onAddBrand, 
    onUpdateBrand, 
    editingBrand, 
    deductCredits, 
    CREDIT_COSTS,
    onCancel
}) => {
    
    const [urlInput, setUrlInput] = useState('');
    const [brandName, setBrandName] = useState('');
    const [industry, setIndustry] = useState<Industry>('Creative Exploration');
    const [dna, setDna] = useState<BrandDNA>(emptyDNA);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
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
    }, [editingBrand]);

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
        onCancel(); // Navigate back after save
    };
    
    const handleKeywordChange = (field: 'visualStyle' | 'toneOfVoice', newChips: string[]) => {
        setDna(prev => ({ ...prev, [field]: newChips }));
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
            
            {/* Full Screen Glass Panel */}
            <div style={{
                background: 'rgba(10, 10, 10, 0.2)', // Matches sidebar background
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)', // Matches sidebar border
                borderRadius: '24px', // Matches sidebar radius
                boxShadow: 'none',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%'
            }}>
                
                {/* AI Analysis Bar - Matched Header */}
                <div style={{
                    height: '80px', // Explicitly 80px to match Sidebar Header
                    padding: '0 32px',
                    background: 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)', // Matches sidebar dividers
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-main)'}}>AI Brand Analyst</h3>
                        <p style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: 0}}>Import intelligence from a website URL.</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <input 
                            style={{ 
                                flex: 1,
                                height: '40px', // Slightly smaller inputs inside header look better
                                padding: '0 16px', 
                                borderRadius: '8px', 
                                background: 'var(--bg-input)', 
                                border: '1px solid var(--primary-color)', 
                                boxShadow: '0 0 15px -3px var(--primary-dim)', 
                                fontSize: '0.9rem', 
                                color: 'var(--text-main)'
                            }}
                            placeholder="e.g. www.tesla.com"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                            disabled={isAnalyzing}
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            style={{ 
                                height: '40px', 
                                borderRadius: '8px', 
                                padding: '0 20px', 
                                fontSize: '0.9rem',
                                minWidth: 'auto',
                                whiteSpace: 'nowrap',
                                background: 'transparent',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                fontWeight: 600,
                                cursor: isAnalyzing ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isAnalyzing ? <span className="spinner small"/> : 'Analyze'}
                        </button>
                    </div>
                </div>
                {error && <div style={{padding: '0 32px', marginTop: '8px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500}}>{error}</div>}

                {/* Main Form Content - Scrollable */}
                <div style={{ 
                    padding: '32px 32px', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '48px',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', margin: 0}}>Core Identity</h4>
                        </div>
                        
                        <div className="modal-form-group">
                            <label>Brand Name</label>
                            <p className="field-helper">The official name of your brand or workspace.</p>
                            <input 
                                value={brandName} 
                                onChange={e => setBrandName(e.target.value)} 
                                placeholder="Brand Name" 
                                className="brand-input"
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Industry Sector</label>
                            <p className="field-helper">The market category that best fits your brand.</p>
                            <input 
                                value={industry} 
                                onChange={e => setIndustry(e.target.value)} 
                                placeholder="e.g. Fintech, Sustainable Fashion" 
                                className="brand-input"
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Brand Essence</label>
                            <p className="field-helper">The core mission and soul of the brand.</p>
                            <textarea 
                                value={dna.brandEssence} 
                                onChange={e => setDna({...dna, brandEssence: e.target.value})}
                                rows={6}
                                placeholder="e.g. Sustainable luxury for the modern nomad..."
                                style={{lineHeight: '1.6'}}
                                className="brand-input"
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <h4 style={{fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-color)', margin: 0}}>Strategy & Style</h4>
                        </div>

                        <div className="modal-form-group">
                            <label>Target Audience</label>
                            <p className="field-helper">Who are your ideal customers? Be specific about demographics.</p>
                            <textarea 
                                value={dna.targetAudience} 
                                onChange={e => setDna({...dna, targetAudience: e.target.value})}
                                rows={4}
                                placeholder="e.g. Tech-savvy professionals aged 25-40..."
                                style={{lineHeight: '1.6'}}
                                className="brand-input"
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Visual Style Keywords</label>
                            <p className="field-helper">Comma separated (e.g. Minimalist, Dark)</p>
                            <ChipInput 
                                chips={dna.visualStyle} 
                                onChange={newChips => handleKeywordChange('visualStyle', newChips)}
                                placeholder="Add keyword..."
                            />
                        </div>
                        <div className="modal-form-group">
                            <label>Tone of Voice Keywords</label>
                            <p className="field-helper">Comma separated (e.g. Witty, Professional)</p>
                            <ChipInput 
                                chips={dna.toneOfVoice} 
                                onChange={newChips => handleKeywordChange('toneOfVoice', newChips)}
                                placeholder="Add keyword..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions - Matched Height */}
                <div style={{
                    height: '80px', // Explicitly 80px to match Sidebar Footer
                    padding: '0 32px',
                    background: 'transparent',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)', // Matches sidebar dividers
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    flexShrink: 0
                }}>
                    <button className="button-secondary" onClick={onCancel}>Cancel</button>
                    <button 
                        onClick={handleSave} 
                        style={{
                            minWidth: '140px',
                            background: 'transparent',
                            border: '1px solid var(--primary-color)',
                            color: 'var(--primary-color)',
                            borderRadius: 'var(--radius-md)',
                            height: '40px',
                            padding: '0 16px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {editingBrand ? 'Save Changes' : 'Create Brand'}
                    </button>
                </div>

            </div>
        </div>
    );
};
