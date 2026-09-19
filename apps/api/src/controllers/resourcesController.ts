import { Request, Response } from 'express';
import { ResourceModel } from '../models/Resource.js';
import { BuildingModel } from '../models/Building.js';
import { emitCampusEvent } from '../events/eventBus.js';
import { RecoveryService } from '../services/recoveryService.js';

export async function getAllResources(req: Request, res: Response): Promise<void> {
  const { buildingId, type, status } = req.query;
  const filter: any = {};

  if (buildingId) filter.buildingId = buildingId;
  if (type) filter.type = type;
  if (status) filter.status = status;

  const resources = await ResourceModel.find(filter).lean();
  res.json(resources);
}

export async function getResourceById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const resource = await ResourceModel.findOne({
    $or: [{ _id: id }, { code: id }],
  });

  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  res.json(resource);
}

export async function updateResourceStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status, reason } = req.body;

  const resource = await ResourceModel.findOne({
    $or: [{ _id: id }, { code: id }],
  });

  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  const prevStatus = resource.status;
  resource.status = status;
  await resource.save();

  await emitCampusEvent({
    type: 'RESOURCE_STATUS_UPDATED',
    actor: (req as any).user?.name || 'Administrator',
    action: 'UPDATE_RESOURCE_STATUS',
    reason: reason || `Manual status update from ${prevStatus} to ${status}`,
    affectedResources: [resource.name],
    previousState: prevStatus,
    newState: status,
    approvalRequired: false,
  });

  res.json({ success: true, resource });
}

export async function recoverGhostResource(req: Request, res: Response): Promise<void> {
  const resourceId = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
  const actor = (req as any).user?.name || 'Administrator';
  const success = await RecoveryService.recoverResource(resourceId, actor);

  if (!success) {
    res.status(404).json({ error: 'Resource not found or could not be recovered.' });
    return;
  }

  const updated = await ResourceModel.findOne({
    $or: [{ _id: resourceId }, { code: resourceId }, { name: resourceId }],
  });
  res.json({ success: true, resource: updated });
}

export async function getBuildings(req: Request, res: Response): Promise<void> {
  const buildings = await BuildingModel.find().lean();
  res.json(buildings);
}
