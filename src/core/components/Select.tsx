
import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    triggerStyle?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    className = "",
    style = {},
    triggerStyle = {}
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll selected item into view when opening
    useEffect(() => {
        if (isOpen && dropdownRef.current && value) {
            const selectedEl = dropdownRef.current.querySelector('.selected');
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [isOpen, value]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div
            className={`custom-select-container ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
            ref={containerRef}
            style={style}
        >
            <div
                className="custom-select-trigger"
                style={triggerStyle}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !disabled && setIsOpen(!isOpen);
                    }
                }}
            >
                <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="select-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="custom-select-dropdown" ref={dropdownRef}>
                    {options.length > 0 ? (
                        options.map(option => (
                            <div
                                key={option.value}
                                className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                                {option.value === value && (
                                    <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="custom-select-option empty">No options</div>
                    )}
                </div>
            )}
        </div>
    );
};
