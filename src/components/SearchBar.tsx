import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { GeocodingResult } from '@/hooks/useGebetaApi';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => Promise<GeocodingResult[]>;
  onSelectPlace: (place: GeocodingResult) => void;
  onUseCurrentLocation?: () => void;
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onSearch,
  onSelectPlace,
  onUseCurrentLocation,
  isLoading = false,
  className = '',
  icon,
}) => {
  const { t } = useLanguage();
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const searchResults = await onSearch(value);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0 || value.length > 0);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, onSearch]);

  const handleSelect = (place: GeocodingResult) => {
    onSelectPlace(place);
    onChange(place.name);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onChange('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-muted-foreground">
          {icon || <Search className="w-5 h-5" />}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          placeholder={placeholder || t.searchPlaceholder}
          className="search-input pl-12 pr-10"
        />

        {(value || isLoading || isSearching) && (
          <button
            onClick={handleClear}
            className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLoading || isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50"
          >
            {/* Current location option */}
            {onUseCurrentLocation && (
              <button
                onClick={() => {
                  onUseCurrentLocation();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{t.myLocation}</p>
                  <p className="text-sm text-muted-foreground">{t.currentLocation}</p>
                </div>
              </button>
            )}

            {/* Search results */}
            {results.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {results.map((place, index) => (
                  <motion.button
                    key={place.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelect(place)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{place.name}</p>
                      {place.address && (
                        <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : value.length > 0 && !isSearching ? (
              <div className="p-4 text-center text-muted-foreground">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>{t.noResults}</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
