import { useState, useCallback } from 'react';

const GEBETA_API_BASE = 'https://mapapi.gebeta.app/api';

export interface GeocodingResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
  address?: string;
}

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][];
  instructions?: RouteInstruction[];
}

export interface RouteInstruction {
  text: string;
  distance: number;
  duration: number;
  type: string;
  modifier?: string;
}

export interface GebetaApiHook {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  isKeySet: boolean;
  searchPlaces: (query: string) => Promise<GeocodingResult[]>;
  getDirections: (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    includeInstructions?: boolean
  ) => Promise<RouteResult | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<GeocodingResult | null>;
  isLoading: boolean;
  error: string | null;
}

// Demo mode with sample data for Ethiopia
const DEMO_PLACES: GeocodingResult[] = [
  { id: '1', name: 'Bole International Airport', lat: 8.9779, lng: 38.7993, type: 'airport', address: 'Addis Ababa, Ethiopia' },
  { id: '2', name: 'Meskel Square', lat: 9.0107, lng: 38.7612, type: 'landmark', address: 'Addis Ababa, Ethiopia' },
  { id: '3', name: 'National Museum of Ethiopia', lat: 9.0355, lng: 38.7468, type: 'museum', address: 'Addis Ababa, Ethiopia' },
  { id: '4', name: 'Holy Trinity Cathedral', lat: 9.0257, lng: 38.7575, type: 'church', address: 'Addis Ababa, Ethiopia' },
  { id: '5', name: 'Entoto Park', lat: 9.0833, lng: 38.7667, type: 'park', address: 'Addis Ababa, Ethiopia' },
  { id: '6', name: 'Merkato Market', lat: 9.0320, lng: 38.7340, type: 'market', address: 'Addis Ababa, Ethiopia' },
  { id: '7', name: 'Unity Park', lat: 9.0183, lng: 38.7611, type: 'park', address: 'Addis Ababa, Ethiopia' },
  { id: '8', name: 'Friendship Park', lat: 9.0122, lng: 38.7644, type: 'park', address: 'Addis Ababa, Ethiopia' },
];

export const useGebetaApi = (): GebetaApiHook => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    // Start with demo mode enabled by default
    return localStorage.getItem('gebeta_api_key') || 'demo';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem('gebeta_api_key', key);
    setApiKeyState(key);
  }, []);

  const isDemoMode = apiKey === 'demo';

  const searchPlaces = useCallback(async (query: string): Promise<GeocodingResult[]> => {
    if (!apiKey || !query.trim()) return [];
    
    setIsLoading(true);
    setError(null);

    // Demo mode - filter from sample data
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const filtered = DEMO_PLACES.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      setIsLoading(false);
      return filtered;
    }

    try {
      const response = await fetch(
        `${GEBETA_API_BASE}/v1/route/geocoding?name=${encodeURIComponent(query)}&apiKey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Map the response to our format
      if (data.data && Array.isArray(data.data)) {
        return data.data.map((item: any, index: number) => ({
          id: `place-${index}`,
          name: item.name || item.display_name || query,
          lat: parseFloat(item.lat || item.latitude),
          lng: parseFloat(item.lng || item.lon || item.longitude),
          type: item.type || 'place',
          address: item.address || item.display_name,
        }));
      }

      // Single result format
      if (data.data && data.data.lat) {
        return [{
          id: 'place-0',
          name: data.data.name || query,
          lat: parseFloat(data.data.lat),
          lng: parseFloat(data.data.lng || data.data.lon),
          type: 'place',
        }];
      }

      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const getDirections = useCallback(async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    includeInstructions = true
  ): Promise<RouteResult | null> => {
    if (!apiKey) return null;

    setIsLoading(true);
    setError(null);

    // Demo mode - generate sample route
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const distance = Math.sqrt(Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2)) * 111000;
      setIsLoading(false);
      return {
        distance: Math.round(distance),
        duration: Math.round(distance / 10),
        geometry: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        instructions: [
          { text: 'Start navigation', distance: 0, duration: 0, type: 'depart' },
          { text: 'Continue to destination', distance: Math.round(distance), duration: Math.round(distance / 10), type: 'straight' },
          { text: 'Arrive at destination', distance: 0, duration: 0, type: 'arrive' },
        ],
      };
    }

    try {
      const instructionParam = includeInstructions ? '&instruction=1' : '';
      const url = `${GEBETA_API_BASE}/route/direction/?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}${instructionParam}&apiKey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get directions');
      }

      const data = await response.json();
      
      if (!data.data || data.msg === 'NoRoute') {
        throw new Error('No route found');
      }

      const routeData = data.data;
      
      // Parse geometry from the route
      const geometry: [number, number][] = [];
      if (routeData.direction) {
        routeData.direction.forEach((step: any) => {
          if (step.point) {
            geometry.push([step.point[0], step.point[1]]);
          }
        });
      }

      // Parse instructions
      const instructions: RouteInstruction[] = [];
      if (routeData.direction) {
        routeData.direction.forEach((step: any) => {
          instructions.push({
            text: step.instruction || step.name || 'Continue',
            distance: step.distance || 0,
            duration: step.time || 0,
            type: step.type || 'turn',
            modifier: step.modifier,
          });
        });
      }

      return {
        distance: routeData.totalDistance || 0,
        duration: routeData.totalTime || 0,
        geometry,
        instructions,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get directions');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number
  ): Promise<GeocodingResult | null> => {
    if (!apiKey) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${GEBETA_API_BASE}/v1/route/revgeocode?lat=${lat}&lng=${lng}&apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();

      if (data.data) {
        return {
          id: 'current-location',
          name: data.data.name || data.data.display_name || 'Selected Location',
          lat,
          lng,
          address: data.data.address || data.data.display_name,
        };
      }

      return {
        id: 'current-location',
        name: 'Selected Location',
        lat,
        lng,
      };
    } catch (err) {
      // Return basic location even if reverse geocoding fails
      return {
        id: 'current-location',
        name: 'Selected Location',
        lat,
        lng,
      };
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  return {
    apiKey,
    setApiKey,
    isKeySet: !!apiKey,
    searchPlaces,
    getDirections,
    reverseGeocode,
    isLoading,
    error,
  };
};
