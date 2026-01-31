import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IconButton } from './IconButton';

export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'medium' | 'large' | 'xlarge';
    showCloseButton?: boolean;
    contentStyle?: React.CSSProperties;
}> = ({ isOpen, onClose, title, children, size = 'medium', showCloseButton = true, bodyClassName = '', contentStyle = {} }) => {
    if (!isOpen) return null;

    // Extract modal actions to render them outside the scrollable area
    const modalActions = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && (child.props as { className?: string }).className === 'modal-actions'
    );
    const modalContent = React.Children.toArray(children).filter(
        (child) => !(React.isValidElement(child) && (child.props as { className?: string }).className === 'modal-actions')
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()} style={contentStyle}>
                <div className="modal-header">
                    {title && <h2>{title}</h2>}
                    {showCloseButton && (
                        <IconButton
                            icon="close"
                            tooltip="Close"
                            onClick={onClose}
                            className="modal-close-button"
                        />
                    )}
                </div>
                <div className={`modal-content-body ${bodyClassName}`}>
                    {modalContent}
                </div>
                {modalActions}
            </div>
        </div>
    );
};

// --- NEW COMPONENT --- //
function simpleMarkdownParse(text: string): string {
    if (!text) return '';
    const escapeHtml = (unsafe: string) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    let html = escapeHtml(text);

    // Block elements: lists
    html = html.replace(/^( *- .*\n?)+/gm, (match) => {
        const listItems = match.trim().split('\n').map(line => {
            return `<li>${line.replace(/^ *- */, '')}</li>`;
        }).join('');
        return `<ul>${listItems}</ul>`;
    });

    // Inline elements
    html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Paragraphs / Line breaks
    return html.replace(/\n/g, '<br />').replace(/<\/ul\><br \/>/g, '</ul>');
}


export const EditableMarkdown: React.FC<{
    value: string;
    onChange: (value: string) => void;
    isTextarea?: boolean;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}> = ({ value, onChange, isTextarea = false, rows = 3, placeholder = "Enter text...", disabled = false, className = '', style = {} }) => {
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleContainerClick = () => {
        if (!disabled) {
            setIsEditing(true);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    const renderedHtml = useMemo(() => simpleMarkdownParse(value), [value]);

    if (isEditing && !disabled) {
        const commonProps = {
            ref: inputRef as any,
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
            onBlur: handleBlur,
            className: "markdown-editing-field",
            placeholder: placeholder,
        };
        const wrapperClass = `markdown-display-container ${isTextarea ? 'is-textarea' : ''} is-editing ${className}`;

        return (
            <div className={wrapperClass} style={{
                ...style,
                border: '1px solid var(--primary-color)',
                boxShadow: '0 0 0 1px var(--primary-color), 0 0 20px rgba(45, 212, 191, 0.2)'
            }}>
                {isTextarea ? (
                    <textarea
                        {...commonProps}
                        rows={rows}
                        style={{
                            width: '100%', height: '100%',
                            border: 'none', outline: 'none',
                            background: 'transparent',
                            backgroundColor: 'transparent',
                            padding: 0, margin: 0,
                            fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit',
                            resize: 'none',
                            lineHeight: '1.6',
                            boxShadow: 'none',
                            transform: 'none'
                        }}
                    />
                ) : (
                    <input
                        {...commonProps}
                        type="text"
                        style={{
                            width: '100%', height: '100%',
                            border: 'none', outline: 'none',
                            background: 'transparent',
                            backgroundColor: 'transparent',
                            padding: 0, margin: 0,
                            fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit',
                            boxShadow: 'none',
                            transform: 'none'
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            className={`markdown-display-container ${isTextarea ? 'is-textarea' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
            onClick={handleContainerClick}
            tabIndex={disabled ? -1 : 0}
            onFocus={handleContainerClick}
            style={{ minHeight: isTextarea ? `${24 * rows}px` : '40px', ...style }}
        >
            {value ? (
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            ) : (
                <span className="placeholder">{placeholder}</span>
            )}
        </div>
    );
};