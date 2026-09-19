import { Request, Response } from 'express';
import { ResourceModel } from '../models/Resource.js';
import { ApprovalModel } from '../models/Approval.js';
import { BookingModel } from '../models/Booking.js';
import { getAIProvider } from '../services/ai/aiProvider.js';
import { OptimizerClient } from '../services/optimizerClient.js';
import { PolicyEngine } from '../policies/policyEngine.js';
import { DecisionAgent, NotificationAgent } from '../agents/index.js';
import { AutonomyEngine } from '../services/autonomyEngine.js';
import { emitCampusEvent } from '../events/eventBus.js';
import { CandidatePlan } from '@campussynapse/shared-types';

export async function interpretCommand(req: Request, res: Response): Promise<void> {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Command prompt string is required.' });
    return;
  }

  const { provider, engineName } = getAIProvider();
  const parsedIntent = await provider.parseIntent(prompt);

  res.json({
    parsedIntent,
    aiEngineUsed: engineName,
  });
}

export async function planAndOptimize(req: Request, res: Response): Promise<void> {
  const { prompt, requestedIntent, weights } = req.body;

  const { provider, engineName } = getAIProvider();
  const intent = requestedIntent || (await provider.parseIntent(prompt || 'Plan a seminar for 180 students tomorrow from 2 PM to 5 PM'));

  const attendees = intent.capacity || 180;
  const startTime = intent.startTime || '14:00';
  const endTime = intent.endTime || '17:00';
  const date = intent.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // 1. Digital Twin Inspection
  const allResources = await ResourceModel.find().lean();

  // 2. Conflict Detection on default / target room (e.g. Seminar Hall A)
  const conflictsDetected: any[] = [];
  allResources.forEach((room) => {
    (room.schedule || []).forEach((item) => {
      if (item.status !== 'CANCELLED') {
        // Check overlap
        const [sH, sM] = item.startTime.split(':').map(Number);
        const [eH, eM] = item.endTime.split(':').map(Number);
        const [rSH, rSM] = startTime.split(':').map(Number);
        const [rEH, rEM] = endTime.split(':').map(Number);

        const itemStart = sH * 60 + sM;
        const itemEnd = eH * 60 + eM;
        const reqStart = rSH * 60 + rSM;
        const reqEnd = rEH * 60 + rEM;

        if (Math.max(itemStart, reqStart) < Math.min(itemEnd, reqEnd)) {
          conflictsDetected.push({
            roomName: room.name,
            roomId: room._id.toString(),
            conflictingBooking: item,
          });
        }
      }
    });
  });

  // 3. Optimization via Google OR-Tools / CP-SAT
  const optimizationResult = await OptimizerClient.optimize({
    title: `Event: ${prompt || 'Academic Seminar'}`,
    attendees,
    date,
    startTime,
    endTime,
    requiredEquipment: intent.requirements || ['Projector', 'Audio System'],
    requiresAccessibility: true,
    rooms: allResources as any,
    weights,
  });

  const candidatePlans: CandidatePlan[] = optimizationResult.plans;
  const recommendedPlan = candidatePlans.find((p) => p.isRecommended) || candidatePlans[0];

  // 4. Policy Engine Gate
  const targetResource = allResources.find((r) => r._id.toString() === recommendedPlan?.resourceId || r.name === recommendedPlan?.resourceName) || allResources[0];
  const policyResult = PolicyEngine.validatePlan(recommendedPlan, targetResource as any, attendees);

  // 5. Explainable AI Reasoning
  const explanation = await DecisionAgent.explainRecommendation(recommendedPlan);

  // 6. Autonomy Engine Check
  const currentLevel = await AutonomyEngine.getLevel();
  const requiresApproval = policyResult.requiresApproval || currentLevel < 3;

  let approvalId: string | undefined;
  if (requiresApproval) {
    const approval = await ApprovalModel.create({
      title: `Event Allocation: ${attendees} attendees (${startTime} - ${endTime})`,
      type: 'EVENT_ALLOCATION',
      description: `Plan recommended: ${recommendedPlan.title}. Policy notes: ${policyResult.approvalReason || 'Admin review required.'}`,
      proposedPlan: recommendedPlan,
      requiredRole: 'CAMPUS_ADMIN',
      status: 'PENDING',
      requestedByAgent: 'EventAgent',
      impactMetrics: {
        attendees,
        disruptionScore: recommendedPlan.disruptionScore,
        utilizationScore: recommendedPlan.utilizationScore,
      },
    });
    approvalId = approval._id.toString();
    await NotificationAgent.notifyApprovalRequired(approvalId, approval.title);
  }

  // Record audit of proposal creation
  await emitCampusEvent({
    type: 'AI_ACTION_CREATED',
    actor: 'Autonomous Engine',
    agent: 'OrchestratorAgent',
    action: 'OPTIMIZED_ALLOCATION_GENERATED',
    reason: `Evaluated ${allResources.length} campus resources using ${optimizationResult.solverEngine}. Selected ${recommendedPlan.resourceName} with score ${recommendedPlan.decisionScore}/100.`,
    affectedResources: [recommendedPlan.resourceName],
    previousState: targetResource.status,
    newState: requiresApproval ? 'UNDER_REVIEW' : 'RESERVED',
    approvalRequired: requiresApproval,
  });

  res.json({
    parsedIntent: intent,
    pipelineStages: [
      { name: '1. Intent Extraction', status: 'COMPLETED', detail: `Understood: ${intent.intent} (${attendees} attendees, ${startTime}-${endTime})` },
      { name: '2. Digital Twin Inspection', status: 'COMPLETED', detail: `Scanned 3 campus blocks & ${allResources.length} total resources` },
      { name: '3. Conflict Detection', status: 'COMPLETED', detail: `Detected ${conflictsDetected.length} potential timetable clash(es)` },
      { name: '4. Policy Gatekeeper', status: policyResult.isValid ? 'COMPLETED' : 'FLAGGED', detail: policyResult.policyNotes.join(' • ') },
      { name: '5. Constraint Optimization', status: 'COMPLETED', detail: `Solved using ${optimizationResult.solverEngine} (${candidatePlans.length} plans generated)` },
      { name: '6. Decision Scoring', status: 'COMPLETED', detail: `Selected ${recommendedPlan.resourceName} (Score: ${recommendedPlan.decisionScore}/100)` },
      { name: '7. Governance & Autonomy', status: requiresApproval ? 'WAITING_APPROVAL' : 'AUTO_EXECUTING', detail: requiresApproval ? 'Awaiting Human-in-the-Loop Administrator Approval' : 'Auto-execution permitted under Level 3' },
    ],
    conflictsDetected,
    candidatePlans,
    recommendedPlan,
    decisionExplanation: explanation,
    policyValidation: policyResult,
    autonomy: {
      level: currentLevel,
      requiresApproval,
      approvalId,
    },
    solverEngine: optimizationResult.solverEngine,
    aiEngine: engineName,
  });
}

export async function executePlan(req: Request, res: Response): Promise<void> {
  const { planId, resourceId, title, attendees, date, startTime, endTime } = req.body;

  const resource = await ResourceModel.findOne({
    $or: [{ _id: resourceId }, { code: resourceId }, { name: resourceId }],
  });

  if (!resource) {
    res.status(404).json({ error: 'Target resource not found' });
    return;
  }

  const prevStatus = resource.status;
  resource.status = 'RESERVED';
  resource.schedule.push({
    bookingId: `b-${Date.now()}`,
    title: title || 'Allocated Seminar',
    organizer: (req as any).user?.name || 'Dean of Academic Operations',
    startTime: startTime || '14:00',
    endTime: endTime || '17:00',
    attendees: attendees || 180,
    status: 'SCHEDULED',
    type: 'EVENT',
  });
  await resource.save();

  // Create booking record
  await BookingModel.create({
    title: title || 'Allocated Seminar',
    resourceId: resource._id.toString(),
    resourceName: resource.name,
    buildingName: resource.buildingName,
    organizer: (req as any).user?.name || 'Dean of Academic Operations',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '14:00',
    endTime: endTime || '17:00',
    attendees: attendees || 180,
    type: 'EVENT',
    status: 'SCHEDULED',
    isAutonomous: true,
  });

  await emitCampusEvent({
    type: 'RESOURCE_RESERVED',
    actor: (req as any).user?.name || 'Administrator',
    agent: 'ResourceAgent',
    action: 'CONFIRM_RESOURCE_ALLOCATION',
    reason: `Allocation finalized and confirmed for ${resource.name}. Digital Twin updated live.`,
    affectedResources: [resource.name],
    previousState: prevStatus,
    newState: 'RESERVED',
    approvalRequired: false,
  });

  await NotificationAgent.notifyExecuted(title || 'Allocated Seminar', resource.name);

  res.json({
    success: true,
    message: `Plan executed successfully. Resource ${resource.name} is now RESERVED.`,
    resource,
  });
}
