// src/lib/mongodb.ts
import { MongoClient, Db, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
interface GlobalWithMongo extends NodeJS.Global {
  _mongoClientPromise?: Promise<MongoClient>;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    try {
      // Verify connection
      await cachedClient.db(MONGODB_DB_NAME).command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (e) {
      console.warn('Cached MongoDB connection failed ping test, reconnecting...', e);
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB.");
    const db = client.db(MONGODB_DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    throw e;
  }
}

// Optional: If you want to cache the promise across hot reloads for serverless functions
// This is a common pattern for Next.js API routes, but less critical for server actions
// if connectToDatabase is called at the start of each action.

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as GlobalWithMongo;
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    });
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
  });
  clientPromise = client.connect();
}

export default clientPromise;
