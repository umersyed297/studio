
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, Timestamp as FirestoreTimestamp } from 'firebase/firestore';
import type { Observation as ObservationType } from '@/types';
import { MapDisplay } from '@/components/map-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, ListChecks, MapIcon, AlertTriangle } from 'lucide-react';

// Define a client-side Observation type where Timestamps are Dates
interface ClientObservation extends Omit<ObservationType, 'dateObserved' | 'createdAt'> {
  id: string;
  dateObserved: Date;
  createdAt: Date;
}

export default function MapViewPage() {
  const [observations, setObservations] = useState<ClientObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'observations'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedObservations: ClientObservation[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as ObservationType;
          // Ensure data.dateObserved and data.createdAt are Timestamps before calling toDate
          const dateObserved = data.dateObserved instanceof FirestoreTimestamp 
                               ? data.dateObserved.toDate() 
                               : new Date(data.dateObserved as any); // Fallback, might need adjustment if data is not proper Timestamp
          const createdAt = data.createdAt instanceof FirestoreTimestamp 
                            ? data.createdAt.toDate() 
                            : new Date(data.createdAt as any); // Fallback

          fetchedObservations.push({
            ...data,
            id: doc.id,
            dateObserved,
            createdAt,
          });
        });
        setObservations(fetchedObservations);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching observations for map:', err);
        setError('Failed to fetch observation data for the map. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <MapIcon className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          Observation Map View
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Visualize biodiversity sightings on the map. Pins are approximate based on location text.
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
