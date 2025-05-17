
'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Observation as ObservationType } from '@/types'; 
import { Leaf, CalendarDays, MapPin, FileText, Wand2 } from 'lucide-react';

// ClientObservation matches the structure in Local Storage (dates as strings)
interface ClientObservation extends Omit<ObservationType, 'dateObserved' | 'createdAt'> {
  id: string;
  dateObserved: string; // ISO string
  createdAt: string;    // ISO string
}
interface ObservationDisplayCardProps {
  observation: ClientObservation;
}

export function ObservationDisplayCard({ observation }: ObservationDisplayCardProps) {
  // Parse date string for display
  const dateObservedFormatted = observation.dateObserved ? format(new Date(observation.dateObserved), 'PPP') : 'N/A';

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-primary" />
          {observation.speciesName || 'Unknown Species'}
        </CardTitle>
        <CardDescription className="flex items-center text-sm">
          <CalendarDays className="mr-2 h-4 w-4" />
          Observed on: {dateObservedFormatted}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pt-2 pb-4 space-y-3">
        {observation.imageUrl && ( // imageUrl is now a Data URI
          <div className="aspect-video w-full relative overflow-hidden rounded-md border border-muted">
            <Image
              src={observation.imageUrl}
              alt={observation.speciesName || 'Observation image'}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 hover:scale-105"
              data-ai-hint="wildlife nature"
            />
          </div>
        )}
        
        <div className="flex items-start text-sm">
          <MapPin className="mr-2 mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-foreground font-medium">{observation.location}</span>
        </div>

        {observation.notes && (
          <>
            <Separator />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-muted-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" /> Notes
              </h4>
              <p className="text-sm text-foreground bg-secondary/30 p-2 rounded-md leading-relaxed">
                {observation.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
      {observation.aiSuggestedSpecies && observation.aiSuggestedSpecies.length > 0 && (
          <CardFooter className="pt-0 pb-4 border-t mt-auto">
            <div className="w-full">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center">
                    <Wand2 className="mr-2 h-4 w-4" /> AI Suggested Species
                </h4>
                <div className="flex flex-wrap gap-2">
                {observation.aiSuggestedSpecies.map((species, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                    {species}
                    </Badge>
                ))}
                </div>
            </div>
          </CardFooter>
        )}
    </Card>
  );
}
