'use server';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { Observation } from '@/types';
import { observationFormSchema, type ObservationFormValues } from '@/lib/schemas';

export async function saveObservationAction(
  validatedData: ObservationFormValues,
  aiSuggestions: string[]
): Promise<{ success: boolean; message: string; observationId?: string }> {
  try {
    const { imageFile, ...otherData } = validatedData;

    // 1. Upload image to Firebase Storage
    const imageName = `${Date.now()}-${imageFile.name}`;
    const storageRef = ref(storage, `observations/${imageName}`);
    await uploadBytes(storageRef, imageFile);
    const imageUrl = await getDownloadURL(storageRef);

    // 2. Prepare data for Firestore
    const observationData: Omit<Observation, 'id'> = {
      ...otherData,
      dateObserved: validatedData.dateObserved, // Already a Date object from Zod
      imageUrl,
      aiSuggestedSpecies: aiSuggestions,
      createdAt: serverTimestamp() as any, // Firestore will convert this
    };

    // 3. Save data to Firestore
    const docRef = await addDoc(collection(db, 'observations'), observationData);

    return { success: true, message: 'Observation saved successfully!', observationId: docRef.id };
  } catch (error) {
    console.error('Error saving observation:', error);
    let finalMessage: string;

    // Check if it's a Firebase error with a code property
    if (error instanceof Error && typeof (error as any).code === 'string') {
      const firebaseErrorCode = (error as any).code;
      if (firebaseErrorCode === 'storage/no-default-bucket') {
        finalMessage = "Configuration error: Firebase Storage bucket is not set. Please ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is defined in your environment variables (e.g., in a .env.local file at the root of your project) and that it's the correct bucket name for your Firebase project.";
      } else {
        finalMessage = `Failed to save observation: ${error.message} (Code: ${firebaseErrorCode})`;
      }
    } else if (error instanceof Error) { // Generic JavaScript error
      finalMessage = `Failed to save observation: ${error.message}`;
    } else { // Unknown error
      finalMessage = 'Failed to save observation due to an unknown error.';
    }
    
    return { success: false, message: finalMessage };
  }
}
