
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Removed Firebase imports
import type { Observation as ObservationType } from '@/types';
import { MapDisplay } from '@/components/map-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, ListChecks, MapIcon, AlertTriangle } from 'lucide-react';

// Client-side Observation type where dates are strings (ISO format from Local Storage)
interface ClientObservation extends Omit<ObservationType, 'dateObserved' | 'createdAt'> {
  id: string;
  dateObserved: string; // Will be ISO string
  createdAt: string;    // Will be ISO string
}

const LOCAL_STORAGE_KEY = 'observations';

export default function MapViewPage() {
  const [observations, setObservations] = useState<ClientObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setLoading(true);
    try {
      const storedObservationsRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedObservationsRaw) {
        const parsedObservations: ClientObservation[] = JSON.parse(storedObservationsRaw);
        // No specific sorting needed for map view unless desired
        setObservations(parsedObservations);
      } else {
        setObservations([]);
      }
      setError(null);
    } catch (e) {
      console.error('Error fetching observations from local storage for map:', e);
      setError('Failed to load observation data for the map. Data might be corrupted.');
      setObservations([]);
    }
    setLoading(false);
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <MapIcon className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Observation Map View
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Visualize biodiversity sightings on the map (data from local storage). Pins are approximate.
        </p>
        <div className="mt-4 space-x-2">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Submit New
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/observations">
              <ListChecks className="mr-2 h-4 w-4" /> View List
            </Link>
          </Button>
        </div>
      </header>

      <Card className="shadow-lg">
        <CardContent className="p-4 md:p-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3 mx-auto rounded" />
              <Skeleton className="h-[70vh] w-full rounded-lg" />
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10 bg-destructive/10 p-6 rounded-md">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive text-lg font-semibold">Error Loading Data</p>
              <p className="text-destructive/80">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <MapDisplay observations={observations} googleMapsApiKey={googleMapsApiKey} />
          )}
           {!googleMapsApiKey && !loading && ( // Show this even if there are observations, if key is missing
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Google Maps API Key Missing</AlertTitle>
                <AlertDescription>
                  The map cannot be displayed because the Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not configured in your environment variables. Please add it to your .env.local file and restart the server.
                </AlertDescription>
              </Alert>
           )}
        </CardContent>
      </Card>
    </main>
  );
}
