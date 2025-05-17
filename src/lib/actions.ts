
'use server';

// This file previously contained Firebase-related server actions,
// and later MongoDB-related server actions.
// Since the application is being reverted to use Local Storage,
// data operations for observations are primarily handled client-side.

// Genkit flows (in src/ai/flows/) are server-side but distinct from these actions.

// If other server-only logic is needed in the future (not related to
// observation CRUD for Local Storage), it can be added here.
// For example, an action that doesn't directly modify observation data
// but performs some other server-side task.
