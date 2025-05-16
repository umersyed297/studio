import type { Timestamp } from 'firebase/firestore';

export interface Observation {
  id?: string;
  speciesName?: string;
  dateObserved: Timestamp; // Stored as Timestamp in Firestore
  location: string;
  imageUrl: string;
  notes?: string;
  aiSuggestedSpecies: string[];
  createdAt: Timestamp;
}
