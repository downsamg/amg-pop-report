import { MongoClient } from 'mongodb';

let _clientPromise: Promise<MongoClient> | null = null;

function getClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MongoDB URI to .env.local');
  }

  if (_clientPromise) return _clientPromise;

  if (process.env.NODE_ENV === 'development') {
    const g = global as typeof globalThis & { _mongoClientPromise?: Promise<MongoClient> };
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(process.env.MONGODB_URI).connect();
    }
    _clientPromise = g._mongoClientPromise;
  } else {
    _clientPromise = new MongoClient(process.env.MONGODB_URI).connect();
  }

  return _clientPromise;
}

export default getClient;
