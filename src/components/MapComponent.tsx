import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const createCustomIcon = (color: string, size: number = 32) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: ${size * 0.4}px;
          height: ${size * 0.4}px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const originIcon = createCustomIcon('hsl(145, 55%, 35%)'); // Ethiopian green
export const destinationIcon = createCustomIcon('hsl(0, 70%, 50%)'); // Ethiopian red
export const currentLocationIcon = createCustomIcon('hsl(45, 90%, 50%)'); // Ethiopian gold

interface MapComponentProps {
  onMapClick?: (lat: number, lng: number) => void;
  origin?: { lat: number; lng: number; name?: string } | null;
  destination?: { lat: number; lng: number; name?: string } | null;
  currentLocation?: { lat: number; lng: number } | null;
  routeGeometry?: [number, number][];
  className?: string;
}

export interface MapComponentHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
}

const MapComponent = forwardRef<MapComponentHandle, MapComponentProps>(({
  onMapClick,
  origin,
  destination,
  currentLocation,
  routeGeometry,
  className = '',
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const currentLocationCircleRef = useRef<L.Circle | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom: number = 15) => {
      mapRef.current?.flyTo([lat, lng], zoom, { duration: 1 });
    },
    fitBounds: (bounds: [[number, number], [number, number]]) => {
      mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
    },
  }));

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map centered on Ethiopia (Addis Ababa)
    const map = L.map(mapContainerRef.current, {
      center: [9.0192, 38.7525], // Addis Ababa
      zoom: 12,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Handle click events
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update click handler
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.off('click');
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    });
  }, [onMapClick]);

  // Update origin marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    if (origin) {
      const marker = L.marker([origin.lat, origin.lng], { icon: originIcon })
        .addTo(mapRef.current);
      
      if (origin.name) {
        marker.bindPopup(`<strong>Start:</strong> ${origin.name}`);
      }
      
      originMarkerRef.current = marker;
    }
  }, [origin]);

  // Update destination marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    if (destination) {
      const marker = L.marker([destination.lat, destination.lng], { icon: destinationIcon })
        .addTo(mapRef.current);
      
      if (destination.name) {
        marker.bindPopup(`<strong>Destination:</strong> ${destination.name}`);
      }
      
      destinationMarkerRef.current = marker;
    }
  }, [destination]);

  // Update current location marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.remove();
      currentLocationMarkerRef.current = null;
    }

    if (currentLocationCircleRef.current) {
      currentLocationCircleRef.current.remove();
      currentLocationCircleRef.current = null;
    }

    if (currentLocation) {
      // Add accuracy circle
      const circle = L.circle([currentLocation.lat, currentLocation.lng], {
        radius: 50,
        color: 'hsl(45, 90%, 50%)',
        fillColor: 'hsl(45, 90%, 50%)',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(mapRef.current);

      // Add marker
      const marker = L.marker([currentLocation.lat, currentLocation.lng], { icon: currentLocationIcon })
        .addTo(mapRef.current)
        .bindPopup('You are here');
      
      currentLocationMarkerRef.current = marker;
      currentLocationCircleRef.current = circle;
    }
  }, [currentLocation]);

  // Update route line
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routeGeometry && routeGeometry.length > 0) {
      const routeLine = L.polyline(routeGeometry, {
        color: 'hsl(145, 55%, 35%)',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Add a lighter outline for better visibility
      const routeOutline = L.polyline(routeGeometry, {
        color: 'white',
        weight: 10,
        opacity: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      // Bring main route to front
      routeLine.bringToFront();
      
      routeLayerRef.current = routeLine;

      // Fit bounds to show entire route
      const bounds = routeLine.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [routeGeometry]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100%' }}
    />
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
