import React, { useMemo, useState } from 'react';
import type { GenerationLog, View } from '../../core/types';
import { ICONS } from '../../core/components/IconButton';

// Helper to format dates relatively
const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
    'Workshop Generation': ICONS.images,
    'Batch Generation': ICONS.products,
    'Image Refinement': ICONS.edit,
    'Image Reshoot': ICONS.undo,
    'Brand Analysis': ICONS.search,
    'Style Creation': ICONS.styles,
    'Image Generation': ICONS.images,
    'PROMPT_IDEAS': ICONS.sparkles,
    'STYLE_PRESET_FROM_IDEA': ICONS.sparkles,
    'default': ICONS.credits,
};

export const CostBillingView: React.FC<{
    credits: number;
    logs: GenerationLog[];
    onNavigate: (view: View) => void;
}> = ({ credits, logs, onNavigate }) => {

    const [filter, setFilter] = useState('all');

    const filteredLogs = useMemo(() => {
        const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (filter === 'all') return sorted;
        return sorted.filter(log => log.action === filter);
    }, [logs, filter]);

    const costBreakdown = useMemo(() => {
        const breakdown: Record<string, { cost: number; count: number }> = {};
        logs.forEach(log => {
            if (!breakdown[log.action]) {
                breakdown[log.action] = { cost: 0, count: 0 };
            }
            breakdown[log.action].cost += log.cost;
            breakdown[log.action].count += 1;
        });
        return Object.entries(breakdown).sort(([, a], [, b]) => b.cost - a.cost);
    }, [logs]);
    
    const totalBreakdownCost = costBreakdown.reduce((sum, [, data]) => sum + data.cost, 0);

    const uniqueActions = ['all', ...Array.from(new Set(logs.map(l => l.action)))];
    const contactAlert = () => alert("To add credits or manage your subscription, please contact us at +918460280468.");

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Cost & Billing</h2>
                    <p className="view-header-subtitle">Track your credit usage, manage your balance, and analyze spending patterns.</p>
                </div>
                <button className="button-primary" onClick={contactAlert}>
                    Manage Subscription
                </button>
            </div>
            
            <div className="cost-billing-layout">
                {/* --- Left Sidebar --- */}
                <aside className="billing-sidebar">
                    <div className="card balance-card-v2">
                        <span className="balance-label">Current Balance</span>
                        <div className="balance-amount">{credits}</div>
                        <span className="balance-currency">Credits</span>
                        <button className="button-primary button-full-width button-lg" style={{marginTop: 'auto'}} onClick={contactAlert}>
                            + Add Credits
                        </button>
                    </div>

                    <div className="card cost-breakdown-card">
                        <h3 className="card-title-v2">Cost Breakdown</h3>
                        <p className="card-subtitle-v2">Total of <strong>{totalBreakdownCost} Cr</strong> spent.</p>
                        <div className="breakdown-list">
                            {costBreakdown.map(([action, data]) => (
                                <div key={action} className="breakdown-item">
                                    <div className="breakdown-item-header">
                                        <span>{action}</span>
                                        <span>{data.cost} Cr</span>
                                    </div>
                                    <div className="breakdown-bar-container">
                                        <div 
                                            className="breakdown-bar" 
                                            style={{ width: `${totalBreakdownCost > 0 ? (data.cost / totalBreakdownCost) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* --- Main Content --- */}
                <main className="billing-main">
                    <div className="card transaction-history-card">
                        <div className="transaction-history-header">
                            <h3 className="card-title-v2">Transaction History</h3>
                            <div className="transaction-filters">
                                <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
                                    {uniqueActions.map(action => (
                                        <option key={action} value={action}>{action === 'all' ? 'All Actions' : action}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="transaction-table-container">
                            {filteredLogs.length > 0 ? (
                                <table className="transaction-table">
                                    <tbody>
                                        {filteredLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="cell-icon">
                                                    <div className="icon-wrapper">
                                                        {ACTION_ICONS[log.action] || ACTION_ICONS['default']}
                                                    </div>
                                                </td>
                                                <td className="cell-details">
                                                    <div className="detail-title">{log.action}</div>
                                                    <div className="detail-subtitle">{log.productName}</div>
                                                </td>
                                                <td className="cell-date">
                                                    <div className="detail-title">{new Date(log.timestamp).toLocaleDateString()}</div>
                                                    <div className="detail-subtitle">{timeAgo(new Date(log.timestamp))}</div>
                                                </td>
                                                <td className="cell-cost">
                                                    -{log.cost} Cr
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="transaction-empty-state">
                                    <p>No transactions match the current filter.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};