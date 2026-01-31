
import React from 'react';
import { GenerationLog } from '../../core/types';

export const SystemPerformanceView: React.FC<{
    logs: GenerationLog[];
    onClearLogs: () => void;
}> = ({ logs, onClearLogs }) => {
    
    const successfulGenerations = logs.filter(log => log.status === 'success');
    const failedGenerations = logs.filter(log => log.status === 'failure');
    const averageDuration = successfulGenerations.length > 0 ?
        successfulGenerations.reduce((acc, log) => acc + log.duration, 0) / successfulGenerations.length : 0;
    const totalCost = logs.reduce((acc, log) => acc + log.cost, 0);

    return (
        <div className="view-container">
            <div className="view-header">
                <h2>System Performance</h2>
                <button className="button-danger" onClick={onClearLogs}>Clear All Logs</button>
            </div>

            <div className="performance-stats-grid">
                <div className="stat-card">
                    <h4>Total Generations</h4>
                    <p>{logs.length}</p>
                </div>
                <div className="stat-card">
                    <h4>Success Rate</h4>
                    <p>{logs.length > 0 ? `${((successfulGenerations.length / logs.length) * 100).toFixed(1)}%` : 'N/A'}</p>
                </div>
                <div className="stat-card">
                    <h4>Avg. Generation Time</h4>
                    <p>{(averageDuration / 1000).toFixed(2)}s</p>
                </div>
                <div className="stat-card">
                    <h4>Total Cost</h4>
                    <p>{totalCost} Cr</p>
                </div>
            </div>
        </div>
    );
};
