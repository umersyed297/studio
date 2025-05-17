
'use server';

import { connectToDatabase } from './mongodb';
import type { Observation, UserObservationCount } from '@/types';
import { ObjectId, WithId } from 'mongodb';

interface SaveObservationInput {
  observerName?: string;
  speciesName?: string;
  dateObserved: string; // ISO String
  location: string;
  imageUrl: string; // Data URI
  notes?: string;
  aiSuggestedSpecies: string[];
}

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function saveObservationAction(
  observationData: SaveObservationInput
): Promise<ActionResult<Observation>> {
  try {
    const { db } = await connectToDatabase();
    const newObservation = {
      ...observationData,
      dateObserved: new Date(observationData.dateObserved), // Store as BSON Date
      createdAt: new Date(), // Store as BSON Date
    };
    const result = await db.collection('observations').insertOne(newObservation);

    if (!result.insertedId) {
      throw new Error('Failed to insert observation into database.');
    }
    
    // Construct the returned object to match the Observation type, converting ObjectId and Dates
    const savedObservation: Observation = {
      id: result.insertedId.toString(),
      observerName: newObservation.observerName,
      speciesName: newObservation.speciesName,
      dateObserved: newObservation.dateObserved.toISOString(),
      location: newObservation.location,
      imageUrl: newObservation.imageUrl,
      notes: newObservation.notes,
      aiSuggestedSpecies: newObservation.aiSuggestedSpecies,
      createdAt: newObservation.createdAt.toISOString(),
    };

    return { success: true, data: savedObservation };
  } catch (error) {
    console.error('Error saving observation:', error);
    return { success: false, error: (error as Error).message || 'Failed to save observation to database.' };
  }
}

export async function getObservationsAction(): Promise<ActionResult<Observation[]>> {
  try {
    const { db } = await connectToDatabase();
    const observationsFromDb = await db.collection('observations')
      .find({})
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .toArray();

    const observations = observationsFromDb.map((doc: WithId<Document>) => {
      const { _id, dateObserved, createdAt, ...rest } = doc;
      return {
        id: _id.toString(),
        dateObserved: dateObserved instanceof Date ? dateObserved.toISOString() : String(dateObserved),
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : String(createdAt),
        ...rest,
      } as Observation; // Ensure type consistency
    });
    
    return { success: true, data: observations };
  } catch (error) {
    console.error('Error fetching observations:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch observations.' };
  }
}

export async function getTopObserversAction(): Promise<ActionResult<UserObservationCount[]>> {
  try {
    const { db } = await connectToDatabase();
    const pipeline = [
      { $match: { observerName: { $exists: true, $ne: null, $ne: "" } } }, // Ensure observerName is valid
      { $group: { _id: "$observerName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, userId: "$_id", count: 1 } } // userId corresponds to observerName
    ];
    const results = await db.collection('observations').aggregate(pipeline).toArray();
    
    return { success: true, data: results as UserObservationCount[] };
  } catch (error) {
    console.error('Error fetching top observers:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch top observers.' };
  }
}
