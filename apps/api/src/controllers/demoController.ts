import { Request, Response } from 'express';
import { resetAndSeedDatabase } from '../seed/index.js';
import { planAndOptimize, executePlan } from './orchestratorController.js';
import { broadcastEvent } from '../events/socket.js';
import { emitCampusEvent } from '../events/eventBus.js';

export async function resetDemo(req: Request, res: Response): Promise<void> {
  try {
    const result = await resetAndSeedDatabase();

    broadcastEvent('demo_reset', {
      timestamp: new Date().toISOString(),
      message: 'CampusSynapse digital twin reset to pristine baseline state.',
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function runDemoScenario(req: Request, res: Response): Promise<void> {
  try {
    // 1. Reset first to guarantee baseline state
    await resetAndSeedDatabase();

    // 2. Simulate Hero Query execution
    const heroPrompt = 'Plan a seminar for 180 students tomorrow from 2 PM to 5 PM';

    // Call orchestrator internal planning
    const mockReq = {
      body: { prompt: heroPrompt },
      user: { name: 'Dr. Rajesh Sharma (Demo Admin)', role: 'SUPER_ADMIN' },
    } as any;

    let responseData: any = null;
    const mockRes = {
      json: (data: any) => {
        responseData = data;
      },
      status: () => mockRes,
    } as any;

    await planAndOptimize(mockReq, mockRes);

    await emitCampusEvent({
      type: 'DEMO_RUN_STARTED',
      actor: 'Hackathon Judge / Admin',
      agent: 'Multi-Agent Orchestrator',
      action: 'INITIATE_HERO_DEMO_WORKFLOW',
      reason: 'Executing live 13-step Smart India Hackathon hero orchestration demonstration.',
      affectedResources: ['Seminar Hall A (Sir CV Raman Hall)', 'Seminar Hall B (Homi Bhabha Hall)'],
      approvalRequired: true,
    });

    res.json({
      success: true,
      message: 'Demo Scenario initiated successfully. Candidate plans and conflict analysis ready for review.',
      orchestration: responseData,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
