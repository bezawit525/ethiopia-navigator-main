import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Route, 
  Navigation, 
  ChevronRight, 
  CornerDownLeft, 
  CornerDownRight, 
  ArrowUp, 
  Flag,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { RouteResult } from '@/hooks/useGebetaApi';
import { Button } from '@/components/ui/button';

interface RoutePanelProps {
  route: RouteResult;
  originName?: string;
  destinationName?: string;
  onStartNavigation?: () => void;
  onClearRoute?: () => void;
}

const RoutePanel: React.FC<RoutePanelProps> = ({
  route,
  originName,
  destinationName,
  onStartNavigation,
  onClearRoute,
}) => {
  const { t } = useLanguage();

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} ${t.km}`;
    }
    return `${Math.round(meters)} ${t.m}`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ${t.hour} ${minutes} ${t.min}`;
    }
    return `${minutes} ${t.min}`;
  };

  // Get instruction icon
  const getInstructionIcon = (type: string, modifier?: string) => {
    const iconClass = "w-5 h-5";
    
    if (type === 'arrive' || type === 'end') {
      return <Flag className={iconClass} />;
    }
    if (type === 'depart' || type === 'start') {
      return <Navigation className={iconClass} />;
    }
    if (modifier?.includes('left')) {
      return <CornerDownLeft className={iconClass} />;
    }
    if (modifier?.includes('right')) {
      return <CornerDownRight className={iconClass} />;
    }
    return <ArrowUp className={iconClass} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass-card overflow-hidden animate-slide-up"
    >
      {/* Header with summary */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">{t.routeFound}</h3>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Route summary */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.distance}</p>
              <p className="font-semibold text-foreground">{formatDistance(route.distance)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.duration}</p>
              <p className="font-semibold text-foreground">{formatDuration(route.duration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route points */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 h-8 bg-border" />
            <div className="w-3 h-3 rounded-full bg-destructive" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.searchStart}</p>
              <p className="font-medium text-foreground truncate">{originName || 'Start'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.searchDestination}</p>
              <p className="font-medium text-foreground truncate">{destinationName || 'Destination'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-turn instructions */}
      {route.instructions && route.instructions.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          {route.instructions.map((instruction, index) => (
            <div
              key={index}
              className="nav-instruction border-b border-border/30 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {getInstructionIcon(instruction.type, instruction.modifier)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{instruction.text}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistance(instruction.distance)}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Start navigation button */}
      {onStartNavigation && (
        <div className="p-4">
          <Button
            onClick={onStartNavigation}
            className="w-full btn-ethiopian"
          >
            <Navigation className="w-5 h-5 mr-2" />
            {t.startNavigation}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default RoutePanel;
