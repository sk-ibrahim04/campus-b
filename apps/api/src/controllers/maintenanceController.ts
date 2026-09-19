import { Request, Response } from 'express';
import { MaintenanceTicketModel } from '../models/MaintenanceTicket.js';
import { ResourceModel } from '../models/Resource.js';
import { MaintenanceAgent } from '../agents/index.js';
import { emitCampusEvent } from '../events/eventBus.js';

export async function getMaintenanceTickets(req: Request, res: Response): Promise<void> {
  const tickets = await MaintenanceTicketModel.find().sort({ createdAt: -1 }).lean();
  res.json(tickets);
}

export async function reportMaintenance(req: Request, res: Response): Promise<void> {
  const { title, description, resourceId, resourceName, buildingName } = req.body;
  const reportedBy = (req as any).user?.name || 'Lab Assistant';

  const triageResult = await MaintenanceAgent.triage({
    description: `${title || ''} ${description || ''}`.trim(),
    resourceId: resourceId || 'UNKNOWN',
    resourceName: resourceName || 'Classroom B204',
    buildingName: buildingName || 'Block B',
    reportedBy,
  });

  const ticketNumber = `TICK-${Math.floor(1000 + Math.random() * 9000)}`;

  const ticket = await MaintenanceTicketModel.create({
    ticketNumber,
    title: title || `${triageResult.subcategory} in ${resourceName}`,
    description,
    category: triageResult.category,
    subcategory: triageResult.subcategory,
    priority: triageResult.priority,
    status: 'REPORTED',
    resourceId: resourceId || 'UNKNOWN',
    resourceName: resourceName || 'Classroom B204',
    buildingName: buildingName || 'Block B',
    assignedTeam: triageResult.assignedTeam,
    reportedBy,
    immediateActionTaken: triageResult.immediateActionTaken,
    isEscalated: triageResult.isEscalated,
  });

  await emitCampusEvent({
    type: 'MAINTENANCE_CREATED',
    actor: reportedBy,
    agent: 'MaintenanceAgent',
    action: 'CREATE_MAINTENANCE_TICKET',
    reason: `Reported issue: ${title}. Triage classified as ${triageResult.category} (${triageResult.priority} priority).`,
    affectedResources: [resourceName],
    previousState: 'AVAILABLE',
    newState: triageResult.isEscalated ? 'MAINTENANCE' : 'AVAILABLE',
    approvalRequired: false,
  });

  res.json({ success: true, ticket });
}

export async function updateTicketStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const ticket = await MaintenanceTicketModel.findById(id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  ticket.status = status;
  if (status === 'RESOLVED' || status === 'CLOSED') {
    ticket.resolvedAt = new Date();

    // If resource was blocked under maintenance, restore it to AVAILABLE
    await ResourceModel.findOneAndUpdate(
      { $or: [{ _id: ticket.resourceId }, { code: ticket.resourceId }, { name: ticket.resourceName }] },
      {
        status: 'AVAILABLE',
        'maintenanceState.isUnderMaintenance': false,
        'maintenanceState.issue': '',
      }
    );

    await emitCampusEvent({
      type: 'RESOURCE_RELEASED',
      actor: (req as any).user?.name || 'Maintenance Crew',
      agent: 'MaintenanceAgent',
      action: 'RESOLVE_MAINTENANCE_TICKET',
      reason: `Maintenance Ticket ${ticket.ticketNumber} marked ${status}. Resource ${ticket.resourceName} restored to operational status.`,
      affectedResources: [ticket.resourceName],
      previousState: 'MAINTENANCE',
      newState: 'AVAILABLE',
      approvalRequired: false,
    });
  }
  await ticket.save();

  res.json({ success: true, ticket });
}
