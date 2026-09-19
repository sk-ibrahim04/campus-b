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

// API Routes
app.use('/api', apiRouter);

// Root health
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'CampusSynapse Autonomous Operations API',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Check if initial seeding is required
    const count = await ResourceModel.countDocuments();
    if (count === 0) {
      console.log('[Server] First boot detected with empty database. Seeding demo dataset...');
      await resetAndSeedDatabase();
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
    process.exit(1);
  }
}

startServer();
