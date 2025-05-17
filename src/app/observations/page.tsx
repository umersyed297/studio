
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Observation as ObservationType } from '@/types';
import { ObservationDisplayCard } from '@/components/observation-display-card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Home, ListChecks, Search, FilterX, MapIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { getObservationsAction } from '@/lib/actions'; // Using server action

const ALL_SPECIES_OPTION_VALUE = "__ALL_SPECIES_PLACEHOLDER__";

export default function ViewObservationsPage() {
  const [observations, setObservations] = useState<ObservationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speciesFilter, setSpeciesFilter] = useState<string>('');
  const [locationSearch, setLocationSearch] = useState<string>('');

  const fetchObservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getObservationsAction();
      if (result.success && result.data) {
        setObservations(result.data);
      } else {
        setError(result.error || 'Failed to load observations.');
        setObservations([]);
      }
    } catch (e) {
      console.error('Error fetching observations:', e);
      setError((e as Error).message || 'An unexpected error occurred.');
      setObservations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  const uniqueSpecies = useMemo(() => {
    const speciesSet = new Set<string>();
    observations.forEach((obs) => {
      if (obs.speciesName && obs.speciesName.trim() !== '') {
        speciesSet.add(obs.speciesName.trim());
      }
    });
    return Array.from(speciesSet).sort((a,b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [observations]);

  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      const speciesMatch =
        !speciesFilter || 
        obs.speciesName?.toLowerCase() === speciesFilter.toLowerCase() ||
        obs.aiSuggestedSpecies?.some(s => s.toLowerCase() === speciesFilter.toLowerCase());
      const locationMatch =
        !locationSearch ||
        obs.location.toLowerCase().includes(locationSearch.toLowerCase());
      return speciesMatch && locationMatch;
    });
  }, [observations, speciesFilter, locationSearch]);

  const handleSpeciesFilterChange = (value: string) => {
    if (value === ALL_SPECIES_OPTION_VALUE) {
      setSpeciesFilter('');
    } else {
      setSpeciesFilter(value);
    }
  };

  const clearFilters = () => {
    setSpeciesFilter('');
    setLocationSearch('');
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
          <ListChecks className="mr-3 h-10 w-10 md:h-12 md:w-12" />
          View Observations
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Browse through all submitted biodiversity sightings from the database.
        </p>
         <div className="mt-4 space-x-2 flex justify-center items-center">
            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Go to Submit Page
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/map">
                <MapIcon className="mr-2 h-4 w-4" /> View Map
              </Link>
            </Button>
            <Button variant="outline" onClick={fetchObservations} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="speciesFilter" className="block text-sm font-medium text-foreground mb-1">
                Filter by Species
              </label>
              <Select 
                value={speciesFilter === '' ? ALL_SPECIES_OPTION_VALUE : speciesFilter} 
                onValueChange={handleSpeciesFilterChange}
                disabled={uniqueSpecies.length === 0 && speciesFilter === ''}
              >
                <SelectTrigger id="speciesFilter" className="w-full">
                  <SelectValue placeholder="All Species" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SPECIES_OPTION_VALUE}>All Species</SelectItem>
                  {uniqueSpecies.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <label htmlFor="locationSearch" className="block text-sm font-medium text-foreground mb-1">
                Search by Location
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="locationSearch"
                  type="text"
                  placeholder="Enter location..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            <div className="md:col-span-1 flex justify-end">
                <Button onClick={clearFilters} variant="outline" className="w-full md:w-auto" disabled={!speciesFilter && !locationSearch}>
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filters
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="p-4">
                <Skeleton className="h-40 w-full mb-4 rounded-md" />
                <Skeleton className="h-6 w-3/4 mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mb-1 rounded" />
                <Skeleton className="h-4 w-1/2 mb-1 rounded" />
                <Skeleton className="h-4 w-full mt-2 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && error && (
         <div className="text-center py-10 bg-destructive/10 p-6 rounded-md">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive text-lg font-semibold">Error Loading Data</p>
            <p className="text-destructive/80">{error}</p>
          </div>
      )}

      {!loading && !error && filteredObservations.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-lg">
            {observations.length === 0 ? "No observations have been submitted yet." : "No observations match your current filters."}
          </p>
        </div>
      )}

      {!loading && !error && filteredObservations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObservations.map((obs) => (
            <ObservationDisplayCard key={obs.id} observation={obs} />
          ))}
        </div>
      )}
    </main>
  );
}
