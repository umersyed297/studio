
'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { format, parseISO } from 'date-fns';
import type { Observation as ObservationType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface MapDisplayProps {
  observations: ObservationType[];
  googleMapsApiKey: string | undefined;
}

const MAP_CENTER_ISLAMABAD = { lat: 33.7379, lng: 73.0844 }; // Islamabad, Pakistan
const DEFAULT_ZOOM = 10;
const SIMULATION_SPREAD = 0.05; 

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return Math.abs(hash);
}

interface SimulatedCoordinates {
  lat: number;
  lng: number;
}

function getSimulatedCoords(locationName: string): SimulatedCoordinates {
  // Using a consistent seed for a given location name
  // For Local Storage version, 'v2' suffix to differentiate from potential previous hashes
  const hashLat = simpleHash(locationName + '_lat_v2_local');
  const hashLng = simpleHash(locationName + '_lng_v2_local');

  const latOffset = ((hashLat % 2000) / 1000 - 1) * SIMULATION_SPREAD; 
  const lngOffset = ((hashLng % 2000) / 1000 - 1) * SIMULATION_SPREAD;
  
  return {
    lat: MAP_CENTER_ISLAMABAD.lat + latOffset,
    lng: MAP_CENTER_ISLAMABAD.lng + lngOffset,
  };
}


const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
};

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

export function MapDisplay({ observations, googleMapsApiKey }: MapDisplayProps) {
  const [selectedObservation, setSelectedObservation] = useState<ObservationType | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || '',
    libraries,
    preventGoogleFontsLoading: true,
  });

  const onMapClick = useCallback(() => {
    setSelectedObservation(null);
  }, []);

  const formatInfoWindowDate = (dateString: string) => {
    try {
      // Dates from Local Storage are already ISO strings
      return format(parseISO(dateString), 'PPP');
    } catch (e) {
      return "Invalid date";
    }
  };

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Map Error</AlertTitle>
        <AlertDescription>
          Could not load Google Maps. Please ensure your API key is correct and the API is enabled.
          Error: {loadError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded || !googleMapsApiKey) {
    return (
      <div className="space-y-4">
        {!googleMapsApiKey && (
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Missing</AlertTitle>
            <AlertDescription>
              Google Maps API key is not configured. Map cannot be displayed. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.
            </AlertDescription>
          </Alert>
        )}
        <Skeleton className="h-[70vh] w-full rounded-lg" />
        <div className="text-center text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={MAP_CENTER_ISLAMABAD}
      zoom={DEFAULT_ZOOM}
      onClick={onMapClick}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {observations.map((obs) => {
        const position = getSimulatedCoords(obs.location);
        return (
          <MarkerF
            key={obs.id} // Use Local Storage ID as key
            position={position}
            onClick={() => setSelectedObservation(obs)}
            title={`${obs.speciesName || 'Unknown Species'} at ${obs.location}`}
          />
        );
      })}

      {selectedObservation && (
        <InfoWindowF
          position={getSimulatedCoords(selectedObservation.location)}
          onCloseClick={() => setSelectedObservation(null)}
          options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
        >
          <div className="p-1 space-y-1 max-w-xs">
            <h3 className="text-md font-semibold text-primary">
              {selectedObservation.speciesName || 'Unknown Species'}
            </h3>
            {/* observerName is not present in Local Storage Observation type, so this part won't render */}
            {/* @ts-ignore - selectedObservation may not have observerName */}
            {selectedObservation.observerName && ( 
              <p className="text-xs text-muted-foreground">
                 {/* @ts-ignore */}
                By: {selectedObservation.observerName}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Location: {selectedObservation.location}
            </p>
            <p className="text-xs text-muted-foreground">
              Observed: {formatInfoWindowDate(selectedObservation.dateObserved)}
            </p>
            {selectedObservation.imageUrl && ( // imageUrl is Data URI
               <img 
                src={selectedObservation.imageUrl} 
                alt={selectedObservation.speciesName || "Observation"} 
                className="mt-2 max-h-28 w-auto rounded object-cover"
                data-ai-hint="wildlife nature"
              />
            )}
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
