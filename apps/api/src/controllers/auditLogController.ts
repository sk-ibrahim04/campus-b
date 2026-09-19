import { Request, Response } from 'express';
import { AuditLogModel } from '../models/AuditLog.js';

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const { limit = 50, action } = req.query;
  const filter: any = {};
  if (action) filter.action = action;

  const logs = await AuditLogModel.find(filter)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .lean();

  res.json(logs);
}
