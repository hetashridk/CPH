
import React, { useState, useRef } from 'react';

export const ChipInput: React.FC<{
    chips: string[];
    onChange: (newChips: string[]) => void;
    suggestions?: string[];
    placeholder?: string;
}> = ({ chips = [], onChange, suggestions = [], placeholder = "Type and press Enter..." }) => {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const safeChips = Array.isArray(chips) ? chips : [];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = inputValue.trim();
            if (val && !safeChips.includes(val)) {
                onChange([...safeChips, val]);
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && safeChips.length > 0) {
            // Remove last chip if backspace pressed with empty input
            onChange(safeChips.slice(0, -1));
        }
    };

    const removeChip = (chipToRemove: string) => {
        onChange(safeChips.filter(c => c !== chipToRemove));
    };
    
    const addSuggestion = (suggestion: string) => {
        if (!safeChips.includes(suggestion)) {
            onChange([...safeChips, suggestion]);
        }
    }

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const availableSuggestions = suggestions.filter(s => !safeChips.includes(s));

    return (
        <div className="chip-input-wrapper">
            <div 
                className={`chip-container ${isFocused ? 'focused' : ''}`}
                onClick={handleContainerClick}
            >
                {safeChips.map((chip) => (
                    <div key={chip} className="chip">
                        <span>{chip}</span>
                        <button 
                            className="chip-remove"
                            onClick={(e) => { e.stopPropagation(); removeChip(chip); }}
                            type="button"
                            tabIndex={-1}
                            title="Remove"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                ))}
                 <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="chip-input-field"
                    placeholder={safeChips.length === 0 ? placeholder : ""}
                />
            </div>
            
            {availableSuggestions.length > 0 && (
                <div className="chip-suggestions">
                    <span className="suggestion-label">Suggestions:</span>
                    <div className="suggestion-list">
                        {availableSuggestions.map(s => (
                            <button 
                                key={s} 
                                className="suggestion-chip" 
                                onClick={() => addSuggestion(s)}
                                type="button"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
