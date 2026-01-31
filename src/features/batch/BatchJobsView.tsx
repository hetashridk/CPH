
import React, { useState, useMemo, useEffect } from 'react';
import { ICONS, IconButton } from '../../core/components/IconButton';
import { Modal } from '../../core/components/Modal';
import type { BatchJob, Product, StylePreset } from '../../core/types';
import { saveDocument, auth } from '../../core/auth/firebase';

interface BatchJobsViewProps {
    jobs: BatchJob[];
    products: Product[];
    stylePresets: StylePreset[];
    onAddJob: (job: Omit<BatchJob, 'id' | 'createdAt' | 'status' | 'completedImages'>) => void;
    onRunJob: (jobId: string) => Promise<void>;
    onStopJob: (jobId: string) => Promise<void>;
    onDeleteJob: (jobId: string) => void;
    onViewJobDetails: (jobId: string) => void;
    credits: number;
    CREDIT_COSTS: { IMAGE_GENERATION: number };
    activeTimers: Record<string, number>;
    onStartTimer: (jobId: string, duration: number) => void;
    onStartCreator: (editingJob?: BatchJob) => void;
}

const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

export const BatchJobsView: React.FC<BatchJobsViewProps> = ({
    jobs,
    products,
    stylePresets,
    onAddJob,
    onRunJob,
    onStopJob,
    onDeleteJob,
    onViewJobDetails,
    credits,
    CREDIT_COSTS,
    activeTimers,
    onStartTimer,
    onStartCreator
}) => {
    const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [deleteConfirmJob, setDeleteConfirmJob] = useState<BatchJob | null>(null);

    // Close menu on outside click
    useEffect(() => {
        if (!activeMenuId) return; // Only listen for clicks when a menu is open

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Find the container for the currently active menu using a data attribute
            const menuContainer = document.querySelector(`[data-menu-id='${activeMenuId}']`);

            // If the click is outside the active menu's container, close it
            if (menuContainer && !menuContainer.contains(target)) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeMenuId]); // Rerun this effect when activeMenuId changes

    const displayedJobs = useMemo(() => {
        return jobs
            .filter(j => viewMode === 'archived' ? j.archived : !j.archived)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [jobs, viewMode]);

    const handleCreateNew = () => {
        onStartCreator();
    };

    const handleModify = (job: BatchJob) => {
        onStartCreator(job);
        setActiveMenuId(null);
    };

    const handleDuplicate = (job: BatchJob) => {
        onStartCreator(job);
        setActiveMenuId(null);
    };

    const handleDelete = (job: BatchJob) => {
        setDeleteConfirmJob(job);
        setActiveMenuId(null);
    };

    const confirmDelete = () => {
        if (deleteConfirmJob) {
            onDeleteJob(deleteConfirmJob.id);
            setDeleteConfirmJob(null);
        }
    };

    const handleArchiveToggle = async (job: BatchJob) => {
        if (auth.currentUser) {
            await saveDocument(auth.currentUser.uid, 'batchJobs', job.id, { archived: !job.archived });
        }
        setActiveMenuId(null);
    };

    const handleRunJobWithTimer = (job: BatchJob) => {
        onRunJob(job.id);
        const duration = Math.max(60, (job.totalImages || 0) * 30);
        onStartTimer(job.id, duration);
    };

    return (
        <div className="view-container">
            <div className="view-header">
                <div>
                    <h2>Batch Jobs</h2>
                    <p className="view-header-subtitle">Manage and execute bulk generation tasks.</p>
                </div>
                <div className="view-header-actions">
                    <div className="segmented-control">
                        <button className={viewMode === 'active' ? 'active' : ''} onClick={() => setViewMode('active')}>Active</button>
                        <button className={viewMode === 'archived' ? 'active' : ''} onClick={() => setViewMode('archived')}>History</button>
                    </div>
                    <button className="button-primary" onClick={handleCreateNew}>+ Create Batch</button>
                </div>
            </div>

            {displayedJobs.length === 0 ? (
                <div className="empty-state">
                    <h3>{viewMode === 'active' ? 'No Active Jobs' : 'No Archived Jobs'}</h3>
                    <p>{viewMode === 'active' ? 'Create a new batch job to start generating assets in bulk.' : 'Archived jobs will appear here.'}</p>
                    {viewMode === 'active' && (
                        <button className="button-primary" onClick={handleCreateNew} style={{ marginTop: 'var(--space-4)' }}>Create Batch Job</button>
                    )}
                </div>
            ) : (
                <div className="batch-job-grid">
                    {displayedJobs.map(job => {
                        const timer = activeTimers[job.id];
                        return (
                            <div key={job.id} className={`batch-job-card ${activeMenuId === job.id ? 'menu-open' : ''}`} onClick={() => onViewJobDetails(job.id)}>
                                <div className="batch-job-header">
                                    <div>
                                        <h3>{job.name}</h3>
                                        <div className="batch-job-date">{new Date(job.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span className={`batch-status ${job.status}`}>{job.status}</span>
                                        {job.status === 'running' && (
                                            (timer !== undefined && timer > 0) ? (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', animation: 'pulse-opacity 2s infinite' }}>
                                                    Est. time: {formatTime(timer)}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', animation: 'pulse-opacity 2s infinite' }}>
                                                    Taking longer than expected...
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="batch-job-body">
                                    <div className="batch-job-summary">
                                        <div style={{ textAlign: 'center' }}>
                                            <div className="total">{job.config?.productIds?.length || 0}</div>
                                            <span>Products</span>
                                        </div>
                                        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div className="total">{job.config?.stylePresetIds?.length || 0}</div>
                                            <span>Styles</span>
                                        </div>
                                        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div className="total">{job.totalImages}</div>
                                            <span>Assets</span>
                                        </div>
                                    </div>

                                    <div className="batch-job-progress-section">
                                        <div className="progress-header">
                                            <span>Progress</span>
                                            <span>{job.totalImages > 0 ? ((job.completedImages / job.totalImages) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar" style={{ width: `${job.totalImages > 0 ? (job.completedImages / job.totalImages) * 100 : 0}%`, backgroundColor: job.status === 'failed' ? 'var(--danger)' : 'var(--primary-color)' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="batch-job-footer">
                                    {(job.status === 'pending' || job.status === 'failed') &&
                                        <button className="button-primary small" onClick={(e) => { e.stopPropagation(); handleRunJobWithTimer(job); }}>{job.status === 'failed' ? 'Retry Job' : 'Start Job'}</button>
                                    }
                                    {job.status === 'running' &&
                                        <button className="button-danger small" onClick={(e) => { e.stopPropagation(); onStopJob(job.id); }}>Stop Job</button>
                                    }
                                    {job.status === 'completed' &&
                                        <button className="button-secondary small" onClick={(e) => { e.stopPropagation(); onViewJobDetails(job.id); }}>View Results</button>
                                    }

                                    <div className="kebab-menu-container" data-menu-id={job.id}>
                                        <IconButton icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>} tooltip="More actions" onClick={(e) => { e.stopPropagation(); setActiveMenuId(job.id === activeMenuId ? null : job.id); }} />
                                        {activeMenuId === job.id &&
                                            <div className="kebab-menu-dropdown">
                                                {job.status === 'pending' && <button className="kebab-menu-item" onClick={(e) => { e.stopPropagation(); handleModify(job) }}>Modify</button>}
                                                <button className="kebab-menu-item" onClick={(e) => { e.stopPropagation(); handleDuplicate(job) }}>Duplicate</button>
                                                <button className="kebab-menu-item" onClick={(e) => { e.stopPropagation(); handleArchiveToggle(job) }}>{job.archived ? 'Restore' : 'Archive'}</button>
                                                <button className="kebab-menu-item danger" onClick={(e) => { e.stopPropagation(); handleDelete(job) }}>Delete</button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={!!deleteConfirmJob} onClose={() => setDeleteConfirmJob(null)} title="Confirm Deletion" size="medium">
                <p>Are you sure you want to permanently delete the batch job "<strong>{deleteConfirmJob?.name}</strong>"? Generated assets will not be deleted.</p>
                <div className="modal-actions">
                    <button className="button-secondary" onClick={() => setDeleteConfirmJob(null)}>Cancel</button>
                    <button className="button-danger" onClick={confirmDelete}>Delete Job</button>
                </div>
            </Modal>
        </div>
    );
};
