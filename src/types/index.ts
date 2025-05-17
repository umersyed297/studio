
export interface Observation {
  id: string; // For Local Storage, this was typically Date.now().toString() or a generated UUID
  speciesName?: string;
  dateObserved: string; // Stored as ISO string
  location: string;
  imageUrl: string; // Stored as Data URI
  notes?: string;
  aiSuggestedSpecies: string[];
  createdAt: string; // Stored as ISO string
}

// UserObservationCount was handled locally by the Top Observers page when using mock data
// or derived on-the-fly from LocalStorage data. It's not a separate global type here.
