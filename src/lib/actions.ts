
'use server';

// Firebase related imports are removed as they are no longer used for observation saving.
// Image upload and data saving are now handled client-side using Local Storage
// in ObservationForm.tsx.

// This file is kept for potential future server actions (like the existing AI flows,
// though those are typically in their own `src/ai/flows/` directory).
// If no other server actions are planned, this file could eventually be removed.

// Genkit flows like `suggestSpeciesNames` are defined elsewhere and are still used.
// This file does not need to export anything if it only contains comments.
// To keep it a module if it were truly empty, one might add:
// export {};
