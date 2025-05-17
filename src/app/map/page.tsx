
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Observation as ObservationType } from '@/types';
import { MapDisplay } from '@/components/map-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, ListChecks, MapIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { getObservationsAction } from '@/lib/actions'; // Using server action

export default function MapViewPage() {
  const [observations, setObservations] = useState<ObservationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const fetchObservationsForMap = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getObservationsAction();
      if (result.success && result.data) {
        setObservations(result.data);
      } else {
        setError(result.error || 'Failed to load observation data for the map.');
        setObservations([]);
      }
    } catch (e) {
      console.error('Error fetching observations for map:', e);
      setError((e as Error).message || 'An unexpected error occurred.');
      setObservations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchObservationsForMap();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <MapIcon className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Observation Map View
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Visualize biodiversity sightings on the map (data from MongoDB). Pins are approximate.
        </p>
        <div className="mt-4 space-x-2 flex justify-center items-center">
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
           <Button variant="outline" onClick={fetchObservationsForMap} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Map Data
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
           {!googleMapsApiKey && !loading && (
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
