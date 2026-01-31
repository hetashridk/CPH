import React from 'react';
import { ICONS } from '../../core/components/IconButton';
import { View } from '../../core/types';

const FeatureItem: React.FC<{ label: string }> = ({ label }) => (
    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
        <div style={{ 
            minWidth: '20px', height: '20px', borderRadius: '50%', 
            background: 'rgba(62, 124, 129, 0.1)', color: 'var(--primary-color)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
        }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span>{label}</span>
    </li>
);

export const ResourceIntelligenceView: React.FC<{
    onNavigate: (view: View) => void;
}> = ({ onNavigate }) => {
    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Resource Intelligence</h2>
                    <p className="view-header-subtitle">
                        Your plan details, included features, and production resource costs.
                    </p>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-4)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Plan Overview</h3>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', background: 'var(--bg-interactive)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border-strong)' }}>Current Plan: Pro Enterprise</span>
                </div>
                
                <div className="credit-guide-columns" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-8)' }}>
                    
                    {/* Premium Features Column (Left) - Enhanced UI */}
                    <div className="credit-column" style={{ 
                        background: '#fff',
                        padding: 'var(--space-8)', 
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 24, right: 24, 
                            background: 'var(--primary-color)', color: '#fff',
                            padding: '6px 14px', borderRadius: '20px',
                            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                            boxShadow: '0 4px 10px rgba(62, 124, 129, 0.2)'
                        }}>
                            UNLIMITED ACCESS
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-8)' }}>
                            <div style={{ 
                                width: '56px', height: '56px', 
                                background: 'linear-gradient(135deg, var(--bg-interactive) 0%, #fff 100%)', 
                                borderRadius: '16px', color: 'var(--primary-color)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                border: '1px solid var(--border-color)'
                            }}>
                                {ICONS.sparkles}
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Architect Suite</h4>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Advanced Reasoning & Analysis Tools</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', flexGrow: 1 }}>
                            
                            <div>
                                <h5 style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Strategic Intelligence</h5>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                                    <FeatureItem label="AI Brand Research & DNA Extraction" />
                                    <FeatureItem label="Market Fit & Product Strategy Analysis" />
                                    <FeatureItem label="Deep Product DNA Creation" />
                                </ul>
                            </div>

                            <div>
                                <h5 style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Creative Engine</h5>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                                    <FeatureItem label="Visual Style & Prompt Architecture" />
                                    <FeatureItem label="Reverse-Engineering from Images" />
                                    <FeatureItem label="Advanced Creative Reasoning" />
                                </ul>
                            </div>

                            <div>
                                <h5 style={{ color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Optimization & Control</h5>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                                    <FeatureItem label="Self-Correction & Critique Agents" />
                                    <FeatureItem label="Production Intelligence Verification" />
                                </ul>
                            </div>

                        </div>

                        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-color)' }}>
                            <button 
                                className="button-primary button-full-width" 
                                style={{ height: '52px', fontSize: '1rem', fontWeight: 600 }}
                                onClick={() => onNavigate('workshop')}
                            >
                                Launch Studio
                            </button>
                        </div>
                    </div>

                    {/* Production Cost Column (Right) */}
                    <div className="credit-column" style={{ 
                        background: 'linear-gradient(180deg, #fff 0%, #f7f9fa 100%)', 
                        padding: 'var(--space-8)', 
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column',
                        position: 'relative',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                            <span style={{ 
                                display: 'inline-block',
                                background: '#111', color: '#FFD700', 
                                padding: '8px 20px', borderRadius: '24px', 
                                fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em',
                                marginBottom: 'var(--space-3)',
                                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                            }}>
                                🚀 UP TO 80% OFF
                            </span>
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Production Cost</h4>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', margin: 0 }}>Pay only for final high-res pixels.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>1K Standard</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Web & Social</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ textDecoration: 'line-through', color: '#dc2626', opacity: 0.6, fontSize: '0.85rem', fontWeight: 600 }}>5 Cr</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)', lineHeight: 1 }}>1 Cr</strong>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', borderRadius: '16px', border: '2px solid var(--primary-color)', boxShadow: '0 4px 12px rgba(62, 124, 129, 0.15)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, background: 'var(--primary-color)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: '0 0 12px 0' }}>POPULAR</div>
                                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>2K High-Res</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Print & Digital</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ textDecoration: 'line-through', color: '#dc2626', opacity: 0.6, fontSize: '0.85rem', fontWeight: 600 }}>10 Cr</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--primary-color)', lineHeight: 1 }}>2 Cr</strong>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>4K Ultra-Res</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Large Format</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ textDecoration: 'line-through', color: '#dc2626', opacity: 0.6, fontSize: '0.85rem', fontWeight: 600 }}>20 Cr</span>
                                    <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)', lineHeight: 1 }}>4 Cr</strong>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--bg-app)', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--border-strong)' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontStyle: 'italic', fontWeight: 600 }}>
                                "Zero cost for reasoning, analysis, & drafting."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};