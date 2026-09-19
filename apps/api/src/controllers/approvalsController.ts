import { Request, Response } from 'express';
import { ApprovalModel } from '../models/Approval.js';
import { ResourceModel } from '../models/Resource.js';
import { BookingModel } from '../models/Booking.js';
import { emitCampusEvent } from '../events/eventBus.js';
import { NotificationAgent } from '../agents/index.js';

export async function getApprovals(req: Request, res: Response): Promise<void> {
  const { status } = req.query;
  const filter: any = {};
  if (status) filter.status = status;

  const approvals = await ApprovalModel.find(filter).sort({ requestedAt: -1 }).lean();
  res.json(approvals);
}

export async function approveProposal(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { comments } = req.body;
  const actor = (req as any).user?.name || 'Dr. Rajesh Sharma (Admin)';

  const approval = await ApprovalModel.findById(id);
  if (!approval) {
    res.status(404).json({ error: 'Approval request not found.' });
    return;
  }

  if (approval.status !== 'PENDING') {
    res.status(400).json({ error: `Approval is already ${approval.status}.` });
    return;
  }

  approval.status = 'APPROVED';
  approval.reviewedAt = new Date();
  approval.reviewedBy = actor;
  approval.comments = comments || 'Approved after multi-criteria operational review.';
  await approval.save();

  // Execute the approved plan
  const plan = approval.proposedPlan;
  const resource = await ResourceModel.findOne({
    $or: [{ _id: plan.resourceId }, { code: plan.resourceId }, { name: plan.resourceName }],
  });

  if (resource) {
    const prevStatus = resource.status;
    resource.status = 'RESERVED';
    resource.schedule.push({
      bookingId: `appr-book-${approval._id}`,
      title: approval.title,
      organizer: actor,
      startTime: '14:00',
      endTime: '17:00',
      attendees: approval.impactMetrics.attendees || plan.capacity,
      status: 'SCHEDULED',
      type: 'EVENT',
    });
    await resource.save();

    await BookingModel.create({
      title: approval.title,
      resourceId: resource._id.toString(),
      resourceName: resource.name,
      buildingName: resource.buildingName,
      organizer: actor,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      attendees: approval.impactMetrics.attendees || plan.capacity,
      type: 'EVENT',
      status: 'SCHEDULED',
      isAutonomous: true,
      approvalId: approval._id.toString(),
    });

    await emitCampusEvent({
      type: 'APPROVAL_GRANTED',
      actor,
      agent: 'DecisionAgent',
      action: 'EXECUTE_APPROVED_PLAN',
      reason: `Proposal approved by administrator: ${approval.title}`,
      affectedResources: [resource.name],
      previousState: prevStatus,
      newState: 'RESERVED',
      approvalRequired: true,
    });

    await NotificationAgent.notifyExecuted(approval.title, resource.name);
  }

  res.json({ success: true, message: 'Plan approved and executed into live campus state.', approval });
}

export async function rejectProposal(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { comments } = req.body;
  const actor = (req as any).user?.name || 'Dr. Rajesh Sharma (Admin)';

  const approval = await ApprovalModel.findById(id);
  if (!approval) {
    res.status(404).json({ error: 'Approval request not found.' });
    return;
  }

  approval.status = 'REJECTED';
  approval.reviewedAt = new Date();
  approval.reviewedBy = actor;
  approval.comments = comments || 'Rejected by administrator.';
  await approval.save();

  await emitCampusEvent({
    type: 'APPROVAL_REJECTED',
    actor,
    agent: 'DecisionAgent',
    action: 'REJECT_PLAN_PROPOSAL',
    reason: `Proposal rejected by administrator: ${comments || 'Administrative override'}`,
    affectedResources: [approval.proposedPlan.resourceName],
    previousState: 'UNDER_REVIEW',
    newState: 'AVAILABLE',
    approvalRequired: true,
  });

  res.json({ success: true, message: 'Proposal rejected.', approval });
}
