import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { initSocket } from './events/socket.js';
import { apiRouter } from './routes/api.js';
import { resetAndSeedDatabase } from './seed/index.js';
import { ResourceModel } from './models/Resource.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

let dbInitialized = false;

// Auto-connect DB on incoming requests (essential for Vercel serverless cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (!dbInitialized) {
      try {
        const count = await ResourceModel.countDocuments();
        if (count === 0) {
          console.log('[Server] Seeding database...');
          await resetAndSeedDatabase();
        }
      } catch (seedErr) {
        // Suppress if DB is not ready yet
      }
      dbInitialized = true;
    }
    next();
  } catch (err) {
    console.error('[Middleware] Database initialization error:', err);
    next();
  }
});

// API Routes
app.use('/api', apiRouter);

// Root welcome & health
app.get('/', (req, res) => {
  res.json({
    service: 'CampusSynapse Autonomous Operations API',
    status: 'ONLINE',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      resources: '/api/resources',
      allocations: '/api/allocations',
      telemetry: '/api/telemetry',
      systemHealth: '/api/system-health',
      decisions: '/api/orchestrator/decide',
      simulator: '/api/simulator/what-if'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CampusSynapse Autonomous Operations API',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await connectDB();

    // Check if initial seeding is required
    try {
      const count = await ResourceModel.countDocuments();
      if (count === 0) {
        console.log('[Server] First boot detected with empty database. Seeding demo dataset...');
        await resetAndSeedDatabase();
      }
    } catch (seedErr) {
      console.warn('[Server] Initial seed check warning:', seedErr);
    }

    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CAMPUSSYNAPSE ORCHESTRATION BACKEND ACTIVE`);
      console.log(`📡 REST API:      http://localhost:${PORT}/api`);
      console.log(`⚡ WEBSOCKET:     ws://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
  }
}

// Only listen on local/server environments (not in Vercel serverless functions)
if (!process.env.VERCEL) {
  startServer();
}

export { app, server };
export default app;
