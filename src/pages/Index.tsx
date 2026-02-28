import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Locate, 
  MapPin, 
  Loader2,
  Menu,
  ChevronUp,
  ChevronDown,
  CircleDot,
  Target
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useGebetaApi, GeocodingResult, RouteResult } from '@/hooks/useGebetaApi';
import MapComponent, { MapComponentHandle } from '@/components/MapComponent';
import SearchBar from '@/components/SearchBar';
import RoutePanel from '@/components/RoutePanel';
import ModeSelector from '@/components/ModeSelector';
import LanguageToggle from '@/components/LanguageToggle';
import ApiKeyInput from '@/components/ApiKeyInput';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type TravelMode = 'driving' | 'walking';

interface Location {
  lat: number;
  lng: number;
  name?: string;
}

const NavigationApp: React.FC = () => {
  const { t, isAmharic } = useLanguage();
  const gebetaApi = useGebetaApi();
  const mapRef = useRef<MapComponentHandle>(null);

  // State
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [isLocating, setIsLocating] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [selectingFor, setSelectingFor] = useState<'origin' | 'destination' | null>(null);

  // Search state
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location: Location = {
          lat: latitude,
          lng: longitude,
          name: t.myLocation,
        };
        
        setCurrentLocation(location);
        mapRef.current?.flyTo(latitude, longitude, 15);
        
        // Try to reverse geocode for a better name
        if (gebetaApi.isKeySet) {
          const result = await gebetaApi.reverseGeocode(latitude, longitude);
          if (result && result.name) {
            setCurrentLocation({ ...location, name: result.name });
          }
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: 'Location Error',
          description: 'Unable to get your location. Please enable location services.',
          variant: 'destructive',
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }, [gebetaApi, t.myLocation]);

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    if (!gebetaApi.isKeySet) return;

    const result = await gebetaApi.reverseGeocode(lat, lng);
    const location: Location = {
      lat,
      lng,
      name: result?.name || 'Selected Location',
    };

    if (selectingFor === 'origin' || (!origin && !selectingFor)) {
      setOrigin(location);
      setOriginSearch(location.name || '');
      setSelectingFor('destination');
      toast({ title: t.searchStart, description: location.name });
    } else {
      setDestination(location);
      setDestinationSearch(location.name || '');
      setSelectingFor(null);
      toast({ title: t.searchDestination, description: location.name });
    }
  }, [origin, selectingFor, gebetaApi, t]);

  // Handle place selection from search
  const handleOriginSelect = useCallback((place: GeocodingResult) => {
    const location: Location = {
      lat: place.lat,
      lng: place.lng,
      name: place.name,
    };
    setOrigin(location);
    setOriginSearch(place.name);
    mapRef.current?.flyTo(place.lat, place.lng, 15);
  }, []);

  const handleDestinationSelect = useCallback((place: GeocodingResult) => {
    const location: Location = {
      lat: place.lat,
      lng: place.lng,
      name: place.name,
    };
    setDestination(location);
    setDestinationSearch(place.name);
    mapRef.current?.flyTo(place.lat, place.lng, 15);
  }, []);

  // Use current location as origin
  const useCurrentAsOrigin = useCallback(() => {
    if (currentLocation) {
      setOrigin(currentLocation);
      setOriginSearch(currentLocation.name || t.myLocation);
    } else {
      getCurrentLocation();
    }
  }, [currentLocation, getCurrentLocation, t.myLocation]);

  // Get directions
  const getDirections = useCallback(async () => {
    if (!origin || !destination) {
      toast({
        title: 'Missing locations',
        description: 'Please select both start and destination',
        variant: 'destructive',
      });
      return;
    }

    if (!gebetaApi.isKeySet) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Gebeta Maps API key',
        variant: 'destructive',
      });
      return;
    }

    const result = await gebetaApi.getDirections(origin, destination, true);
    
    if (result) {
      setRoute(result);
      setIsPanelExpanded(true);
      toast({
        title: t.routeFound,
        description: `${(result.distance / 1000).toFixed(1)} ${t.km}`,
      });
    } else {
      toast({
        title: t.noRouteFound,
        description: 'Unable to find a route between these locations',
        variant: 'destructive',
      });
    }
  }, [origin, destination, gebetaApi, t]);

  // Clear route
  const clearRoute = useCallback(() => {
    setRoute(null);
    setOrigin(null);
    setDestination(null);
    setOriginSearch('');
    setDestinationSearch('');
    setSelectingFor(null);
  }, []);

  // Auto-fetch directions when both points are set
  useEffect(() => {
    if (origin && destination && gebetaApi.isKeySet && !route) {
      getDirections();
    }
  }, [origin, destination, gebetaApi.isKeySet]);

  // Show API key input if not set
  if (!gebetaApi.isKeySet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-ethiopic">
              {t.appName}
            </h1>
            <p className="text-muted-foreground">{t.appTagline}</p>
          </div>
          <ApiKeyInput onSave={gebetaApi.setApiKey} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t.appName} - Ethiopian Navigation</title>
        <meta name="description" content="Navigate Ethiopia with ease using Gebeta Maps. Get directions, search places, and explore Ethiopia in English and Amharic." />
      </Helmet>

      <div className="h-screen w-screen overflow-hidden relative">
        {/* Map */}
        <MapComponent
          ref={mapRef}
          onMapClick={handleMapClick}
          origin={origin}
          destination={destination}
          currentLocation={currentLocation}
          routeGeometry={route?.geometry}
          className="absolute inset-0"
        />

        {/* Top controls - higher z-index to stay above map */}
        <div className="absolute top-0 left-0 right-0 p-4 z-30 pointer-events-none">
          <div className="max-w-lg mx-auto space-y-3 pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-medium">
                  <Navigation className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className={`font-bold text-foreground ${isAmharic ? 'font-ethiopic' : ''}`}>
                    {t.appName}
                  </h1>
                </div>
              </motion.div>
              <LanguageToggle />
            </div>

            {/* Search bars */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 space-y-3 shadow-medium"
            >
              {/* Origin input with GPS button */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchBar
                    placeholder={t.searchStart}
                    value={originSearch}
                    onChange={setOriginSearch}
                    onSearch={gebetaApi.searchPlaces}
                    onSelectPlace={handleOriginSelect}
                    onUseCurrentLocation={useCurrentAsOrigin}
                    isLoading={gebetaApi.isLoading}
                    icon={<CircleDot className="w-5 h-5 text-primary" />}
                  />
                </div>
                <Button
                  onClick={useCurrentAsOrigin}
                  disabled={isLocating}
                  variant="outline"
                  className="h-[54px] px-4 bg-accent/20 border-accent hover:bg-accent/30 flex-shrink-0"
                  title={t.myLocation}
                >
                  {isLocating ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <Locate className="w-5 h-5 text-primary" />
                  )}
                </Button>
              </div>
              
              {/* Destination input */}
              <SearchBar
                placeholder={t.searchDestination}
                value={destinationSearch}
                onChange={setDestinationSearch}
                onSearch={gebetaApi.searchPlaces}
                onSelectPlace={handleDestinationSelect}
                isLoading={gebetaApi.isLoading}
                icon={<Target className="w-5 h-5 text-destructive" />}
              />

              {/* Mode selector and directions button */}
              <div className="flex items-center gap-3">
                <ModeSelector
                  mode={travelMode}
                  onChange={setTravelMode}
                  className="flex-1"
                />
                <Button
                  onClick={getDirections}
                  disabled={!origin || !destination || gebetaApi.isLoading}
                  className="btn-ethiopian"
                >
                  {gebetaApi.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating action buttons - z-index between map and top panel */}
        <div className="absolute right-4 bottom-32 z-20 space-y-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="w-12 h-12 rounded-xl bg-card border border-border shadow-medium flex items-center justify-center hover:bg-muted transition-colors"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Locate className="w-5 h-5 text-primary" />
            )}
          </motion.button>
        </div>

        {/* Route panel */}
        <AnimatePresence>
          {route && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none">
              <div className="max-w-lg mx-auto pointer-events-auto">
                <button
                  onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                  className="w-full flex items-center justify-center py-2 mb-2"
                >
                  {isPanelExpanded ? (
                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                
                {isPanelExpanded && (
                  <RoutePanel
                    route={route}
                    originName={origin?.name}
                    destinationName={destination?.name}
                    onClearRoute={clearRoute}
                    onStartNavigation={() => {
                      toast({
                        title: t.startNavigation,
                        description: 'Navigation started',
                      });
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Selection helper */}
        {selectingFor && !route && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="glass-card px-6 py-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectingFor === 'origin' 
                  ? 'Tap to select start point' 
                  : 'Tap to select destination'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

// Wrap with providers
const Index: React.FC = () => {
  return (
    <LanguageProvider>
      <NavigationApp />
    </LanguageProvider>
  );
};

export default Index;
