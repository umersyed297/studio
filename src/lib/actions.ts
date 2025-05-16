'use server';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { Observation } from '@/types';
import { observationFormSchema, type ObservationFormValues } from '@/lib/schemas'; // Assuming this is where validated form values type comes from

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
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message: `Failed to save observation: ${errorMessage}` };
  }
}
