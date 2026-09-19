import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;
export let isUsingMemoryServer = false;

export async function connectDB(): Promise<void> {
  // If already connected, reuse existing connection (crucial for Serverless/Vercel)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (uri && uri !== 'memory') {
    try {
      console.log(`[Database] Attempting connection to MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('[Database] Successfully connected to MongoDB Atlas / Remote Cluster.');
      return;
    } catch (err) {
      console.warn('[Database] External MongoDB connection failed:', (err as Error).message);
      if (process.env.VERCEL) {
        console.warn('[Database] Running on Vercel: Please check your MONGODB_URI in Vercel Environment Variables.');
        return;
      }
    }
  }

  // On Vercel, MongoMemoryServer cannot download binaries; warn user to provide MONGODB_URI
  if (process.env.VERCEL) {
    console.warn('[Database] Running on Vercel without MONGODB_URI. Please configure MONGODB_URI (e.g. free MongoDB Atlas) in your Vercel Project Settings.');
    return;
  }

  // Fallback to embedded in-memory MongoDB for local development
  try {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    isUsingMemoryServer = true;
    console.log('[Database] Connected via embedded MongoMemoryServer (Zero-configuration local mode).');
  } catch (memErr) {
    console.error('[Database] Failed to initialize embedded MongoDB:', memErr);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
