
// Firebase Timestamp import is no longer needed: import type { Timestamp } from 'firebase/firestore';

export interface Observation {
  id: string; // Will be a simple unique ID like timestamp string
  speciesName?: string;
  dateObserved: string; // Store as ISO string
  location: string;
  imageUrl: string; // Will store image as Data URI
  notes?: string;
  aiSuggestedSpecies: string[];
  createdAt: string; // Store as ISO string
}
