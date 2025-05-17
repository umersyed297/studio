
export interface Observation {
  id: string; // MongoDB _id as string
  observerName?: string; // Added for Top Observers
  speciesName?: string;
  dateObserved: string; // Store as ISO string
  location: string;
  imageUrl: string; // Will store image as Data URI
  notes?: string;
  aiSuggestedSpecies: string[];
  createdAt: string; // Store as ISO string
}

export interface UserObservationCount {
  userId: string; // Corresponds to observerName
  count: number;
}
