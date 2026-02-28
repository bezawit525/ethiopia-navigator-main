import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, AlertCircle, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const { t } = useLanguage();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Please enter an API key');
      return;
    }
    onSave(key.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 max-w-md mx-auto"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Key className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t.enterApiKey}</h3>
          <p className="text-sm text-muted-foreground">Get your key from Gebeta Maps</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setError('');
            }}
            placeholder={t.apiKeyPlaceholder}
            className="search-input"
          />
          {error && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full btn-ethiopian">
          {t.saveApiKey}
        </Button>

        <a
          href="https://maps.gebeta.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
        >
          <span>Get your API key</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </form>
    </motion.div>
  );
};

export default ApiKeyInput;
