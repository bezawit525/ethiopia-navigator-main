import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage, isAmharic } = useLanguage();

  return (
    <div className={`flex rounded-xl bg-card border border-border p-1 ${className}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`lang-toggle ${!isAmharic ? 'active' : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('am')}
        className={`lang-toggle font-ethiopic ${isAmharic ? 'active' : ''}`}
      >
        አማ
      </button>
    </div>
  );
};

export default LanguageToggle;
