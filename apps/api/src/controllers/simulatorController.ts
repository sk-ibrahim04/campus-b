import { Request, Response } from 'express';
import { SimulatorService } from '../services/simulatorService.js';
import { WhatIfScenarioInput } from '@campussynapse/shared-types';

export async function runSimulation(req: Request, res: Response): Promise<void> {
  const { scenarioType, resourceId, buildingId, date, startTime, endTime, reason } = req.body;

  const input: WhatIfScenarioInput = {
    scenarioType: scenarioType || 'RESOURCE_UNAVAILABLE',
    resourceId,
    buildingId,
    date: date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: startTime || '14:00',
    endTime: endTime || '17:00',
    reason: reason || 'Auditorium 1 scheduled maintenance',
  };

  const result = await SimulatorService.runSimulation(input);
  res.json(result);
}
