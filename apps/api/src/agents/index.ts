import { Resource, ParsedIntent, CandidatePlan, MaintenanceTicket } from '@campussynapse/shared-types';
import { PolicyEngine, PolicyValidationResult } from '../policies/policyEngine.js';
import { OptimizerClient, OptimizationParams } from '../services/optimizerClient.js';
import { getAIProvider } from '../services/ai/aiProvider.js';
import { emitCampusEvent, createAndBroadcastNotification } from '../events/eventBus.js';
import { ResourceModel } from '../models/Resource.js';
import { doIntervalsOverlap } from '@campussynapse/shared-utils';

export class ScheduleAgent {
  static async detectConflicts(
    resourceId: string,
    startTime: string,
    endTime: string
  ): Promise<{ hasConflict: boolean; conflicts: any[] }> {
    const resource = await ResourceModel.findOne({
      $or: [{ _id: resourceId }, { code: resourceId }],
    });
    if (!resource) return { hasConflict: false, conflicts: [] };

    const clashes = resource.schedule.filter(
      (b) =>
        b.status !== 'CANCELLED' &&
        doIntervalsOverlap(b.startTime, b.endTime, startTime, endTime)
    );

    return { hasConflict: clashes.length > 0, conflicts: clashes };
  }
}

export class ResourceAgent {
  static async findAvailableRooms(minCapacity: number, startTime: string, endTime: string): Promise<Resource[]> {
    const all = await ResourceModel.find({
      status: { $nin: ['MAINTENANCE', 'BLOCKED'] },
      capacity: { $gte: minCapacity },
    }).lean();

    return all.filter((r) => {
      const clashes = (r.schedule || []).filter(
        (b) =>
          b.status !== 'CANCELLED' &&
          doIntervalsOverlap(b.startTime, b.endTime, startTime, endTime)
      );
      return clashes.length === 0;
    }) as unknown as Resource[];
  }
}

export class PolicyAgent {
  static validate(
    plan: CandidatePlan,
    resource: Resource,
    attendees: number
  ): PolicyValidationResult {
    return PolicyEngine.validatePlan(plan, resource, attendees);
  }
}

export class DecisionAgent {
  static async explainRecommendation(plan: CandidatePlan): Promise<{
    headline: string;
    scoreFactors: { name: string; score: number; weight: string }[];
    reasons: string[];
    tradeOffs: string[];
  }> {
    const { provider } = getAIProvider();
    const explanation = await provider.explainDecision(plan.title, {
      decisionScore: plan.decisionScore,
      utilizationScore: plan.utilizationScore,
      disruptionScore: plan.disruptionScore,
    });

    return {
      headline: explanation,
      scoreFactors: [
        { name: 'Feasibility', score: plan.feasibilityScore, weight: '35%' },
        { name: 'Minimal Disruption', score: plan.disruptionScore, weight: '25%' },
        { name: 'Capacity Fit (Utilization)', score: plan.utilizationScore, weight: '20%' },
        { name: 'Campus Accessibility & Distance', score: plan.distanceScore, weight: '10%' },
        { name: 'Departmental Preference', score: 90, weight: '10%' },
      ],
      reasons: plan.reasons,
      tradeOffs: plan.tradeOffs,
    };
  }
}

export class NotificationAgent {
  static async notifyApprovalRequired(approvalId: string, title: string): Promise<void> {
    await createAndBroadcastNotification(
      'Action Requires Approval',
      `AI Proposal "${title}" requires administrative approval before execution.`,
      'WARNING',
      'CAMPUS_ADMIN'
    );
  }

  static async notifyExecuted(title: string, roomName: string): Promise<void> {
    await createAndBroadcastNotification(
      'Resource Allocated & Confirmed',
      `Allocation confirmed for "${title}" in ${roomName}. Digital Twin updated.`,
      'SUCCESS'
    );
  }
}

export class MaintenanceAgent {
  static async triage(ticketInput: {
    description: string;
    resourceId: string;
    resourceName: string;
    buildingName: string;
    reportedBy: string;
  }) {
    const { provider } = getAIProvider();
    const triageResult = await provider.triageMaintenance(ticketInput.description);

    let immediateActionTaken = triageResult.immediateAction;
    let shouldBlockResource = triageResult.priority === 'CRITICAL';

    if (shouldBlockResource) {
      await ResourceModel.findOneAndUpdate(
        { $or: [{ _id: ticketInput.resourceId }, { code: ticketInput.resourceId }, { name: ticketInput.resourceName }] },
        {
          status: 'MAINTENANCE',
          'maintenanceState.isUnderMaintenance': true,
          'maintenanceState.issue': ticketInput.description,
          'maintenanceState.priority': triageResult.priority,
        }
      );

      await emitCampusEvent({
        type: 'MAINTENANCE_ESCALATED',
        actor: 'MaintenanceAgent',
        agent: 'MaintenanceAgent',
        action: 'EMERGENCY_RESOURCE_LOCKOUT',
        reason: `Critical safety hazard detected: ${ticketInput.description}`,
        affectedResources: [ticketInput.resourceName],
        previousState: 'AVAILABLE',
        newState: 'MAINTENANCE',
        approvalRequired: false,
      });

      await createAndBroadcastNotification(
        'Critical Safety Incident',
        `Room ${ticketInput.resourceName} has been immediately blocked due to critical hazard: ${ticketInput.description}`,
        'CRITICAL'
      );
    }

    return {
      category: triageResult.category,
      subcategory: triageResult.subcategory,
      priority: triageResult.priority,
      assignedTeam: triageResult.assignedTeam,
      immediateActionTaken,
      isEscalated: shouldBlockResource,
    };
  }
}
