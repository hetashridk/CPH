import React, { useState, useEffect } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

type AccentName = 'coral' | 'blush' | 'butterscotch' | 'smoke' | 'duckegg' | 'emeraldsea';

interface Accent {
  name: AccentName;
  color: string;
}

const ACCENTS: Accent[] = [
  { name: 'coral', color: '#f79483' },
  { name: 'blush', color: '#f4d3c8' },
  { name: 'butterscotch', color: '#f2c14e' },
  { name: 'smoke', color: '#a8b2b9' },
  { name: 'duckegg', color: '#c0d1c9' },
  { name: 'emeraldsea', color: '#3e7c81' },
];

export const AccentColorSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccent, setSelectedAccent] = usePersistentState<AccentName>('app_accent_theme_v2', 'emeraldsea');

  useEffect(() => {
    document.body.dataset.theme = selectedAccent;
  }, [selectedAccent]);

  const handleSelectAccent = (accentName: AccentName) => {
    setSelectedAccent(accentName);
    setIsOpen(false);
  };
  
  const currentAccentColor = ACCENTS.find(a => a.name === selectedAccent)?.color || ACCENTS[0].color;

  return (
    <div className={`accent-selector-wrapper ${isOpen ? 'is-open' : ''}`}>
      <div className="accent-palette">
        {ACCENTS.map(accent => (
          <div
            key={accent.name}
            className={`accent-dot ${selectedAccent === accent.name ? 'selected' : ''}`}
            style={{ backgroundColor: accent.color }}
            onClick={() => handleSelectAccent(accent.name)}
            title={accent.name.charAt(0).toUpperCase() + accent.name.slice(1)}
          />
        ))}
      </div>
      <div
        className="accent-trigger"
        style={{ backgroundColor: currentAccentColor }}
        onClick={() => setIsOpen(!isOpen)}
        title="Change Accent Color"
      />
    </div>
  );
};