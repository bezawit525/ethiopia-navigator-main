import React from 'react';
import { motion } from 'framer-motion';
import { Car, Footprints } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type TravelMode = 'driving' | 'walking';

interface ModeSelectorProps {
  mode: TravelMode;
  onChange: (mode: TravelMode) => void;
  className?: string;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange, className = '' }) => {
  const { t } = useLanguage();

  return (
    <div className={`flex rounded-xl bg-muted/50 p-1 ${className}`}>
      <button
        onClick={() => onChange('driving')}
        className={`mode-btn flex items-center gap-2 flex-1 justify-center ${
          mode === 'driving' ? 'active' : ''
        }`}
      >
        <Car className="w-4 h-4" />
        <span>{t.driving}</span>
      </button>
      <button
        onClick={() => onChange('walking')}
        className={`mode-btn flex items-center gap-2 flex-1 justify-center ${
          mode === 'walking' ? 'active' : ''
        }`}
      >
        <Footprints className="w-4 h-4" />
        <span>{t.walking}</span>
      </button>
    </div>
  );
};

export default ModeSelector;
