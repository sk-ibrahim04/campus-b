import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;
export let isUsingMemoryServer = false;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri !== 'memory') {
    try {
      console.log(`[Database] Attempting connection to MongoDB URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log('[Database] Successfully connected to MongoDB Atlas / Local Daemon.');
      return;
    } catch (err) {
      console.warn('[Database] External MongoDB connection timed out. Falling back to embedded MongoMemoryServer...', (err as Error).message);
    }
  }

  // Fallback to embedded in-memory MongoDB
  try {
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    isUsingMemoryServer = true;
    console.log('[Database] Connected via embedded MongoMemoryServer (Zero-configuration standalone mode).');
  } catch (memErr) {
    console.error('[Database] Failed to initialize embedded MongoDB:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
