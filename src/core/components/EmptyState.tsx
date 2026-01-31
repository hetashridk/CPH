
import React from 'react';

export const EmptyState: React.FC<{
  title: string;
  message: string;
  action?: React.ReactNode;
}> = ({ title, message, action }) => (
  <div className="empty-state">
    <h2>{title}</h2>
    <p>{message}</p>
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);