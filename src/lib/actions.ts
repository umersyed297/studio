
'use server';

// Firebase related imports are removed as they are no longer used here.
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db, storage } from '@/lib/firebase';
// import type { Observation } from '@/types';
// import { observationFormSchema, type ObservationFormValues } from '@/lib/schemas';

// The saveObservationAction has been removed as data saving is now handled client-side
// in ObservationForm.tsx using Local Storage.
// This file is kept for potential future server actions (like the existing AI flows).
// If no other server actions are planned, this file could eventually be removed.

// Example of how it might look if it was completely empty:
// 'use server';
// export {}; //Keeps it a module

// For now, let's just leave it as is, assuming AI flows are defined elsewhere and imported by components.
// The key is that saveObservationAction is gone.

// If you had other server actions here, they would remain.
// For example, if `suggestSpeciesNames` was defined here (it's in its own file), it would stay.
