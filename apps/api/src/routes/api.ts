import { Router } from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { getDashboardData } from '../controllers/dashboardController.js';
import {
  getAllResources,
  getResourceById,
  updateResourceStatus,
  recoverGhostResource,
  getBuildings,
} from '../controllers/resourcesController.js';
import { getMasterSchedule, createBooking } from '../controllers/schedulesController.js';
import { interpretCommand, planAndOptimize, executePlan } from '../controllers/orchestratorController.js';
import { runSimulation } from '../controllers/simulatorController.js';
import { getApprovals, approveProposal, rejectProposal } from '../controllers/approvalsController.js';
import { getMaintenanceTickets, reportMaintenance, updateTicketStatus } from '../controllers/maintenanceController.js';
import { getAnalyticsData } from '../controllers/analyticsController.js';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { runDemoScenario, resetDemo } from '../controllers/demoController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { AutonomyEngine } from '../services/autonomyEngine.js';

export const apiRouter = Router();

// Public / Auth
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/profile', authenticateJWT, getProfile);

// Dashboard
apiRouter.get('/dashboard', authenticateJWT, getDashboardData);

// Resources & Buildings
apiRouter.get('/resources', authenticateJWT, getAllResources);
apiRouter.get('/resources/:id', authenticateJWT, getResourceById);
apiRouter.patch('/resources/:id/status', authenticateJWT, updateResourceStatus);
apiRouter.post('/resources/:id/recover', authenticateJWT, recoverGhostResource);
apiRouter.get('/buildings', authenticateJWT, getBuildings);

// Schedules & Bookings
apiRouter.get('/schedules', authenticateJWT, getMasterSchedule);
apiRouter.post('/bookings', authenticateJWT, createBooking);

// AI Orchestrator
apiRouter.post('/orchestrator/interpret', authenticateJWT, interpretCommand);
apiRouter.post('/orchestrator/plan', authenticateJWT, planAndOptimize);
apiRouter.post('/orchestrator/execute', authenticateJWT, executePlan);

// Simulator
apiRouter.post('/simulator/run', authenticateJWT, runSimulation);

// Approvals
apiRouter.get('/approvals', authenticateJWT, getApprovals);
apiRouter.post('/approvals/:id/approve', authenticateJWT, approveProposal);
apiRouter.post('/approvals/:id/reject', authenticateJWT, rejectProposal);

// Maintenance
apiRouter.get('/maintenance', authenticateJWT, getMaintenanceTickets);
apiRouter.post('/maintenance', authenticateJWT, reportMaintenance);
apiRouter.patch('/maintenance/:id/status', authenticateJWT, updateTicketStatus);

// Analytics & Audit
apiRouter.get('/analytics', authenticateJWT, getAnalyticsData);
apiRouter.get('/audit-log', authenticateJWT, getAuditLogs);

// Autonomy Config & Settings
apiRouter.get('/settings/autonomy', authenticateJWT, async (req, res) => {
  const level = await AutonomyEngine.getLevel();
  res.json({ level, autoActionsToday: AutonomyEngine.getAutonomousActionsCount() });
});

apiRouter.post('/settings/autonomy', authenticateJWT, async (req, res) => {
  const { level } = req.body;
  if (level !== undefined && level >= 0 && level <= 3) {
    const updated = await AutonomyEngine.setLevel(level);
    res.json({ success: true, level: updated });
    return;
  }
  res.status(400).json({ error: 'Valid autonomy level (0-3) is required.' });
});

// Demo Mode UX
apiRouter.post('/demo/run', authenticateJWT, runDemoScenario);
apiRouter.post('/demo/reset', authenticateJWT, resetDemo);
