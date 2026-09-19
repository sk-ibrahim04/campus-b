import { Resource, CandidatePlan } from '@campussynapse/shared-types';

export interface PolicyValidationResult {
  isValid: boolean;
  violations: string[];
  requiresApproval: boolean;
  approvalReason?: string;
  policyNotes: string[];
}

export class PolicyEngine {
  /**
   * Validates a candidate plan against institutional campus policies
   */
  static validatePlan(
    plan: CandidatePlan,
    resource: Resource,
    requestedAttendees: number,
    eventType: string = 'EVENT'
  ): PolicyValidationResult {
    const violations: string[] = [];
    const policyNotes: string[] = [];
    let requiresApproval = false;
    let approvalReason: string | undefined;

    // Rule 1: Capacity Constraint
    if (requestedAttendees > resource.capacity) {
      violations.push(`Capacity Violation: Room capacity (${resource.capacity}) cannot accommodate ${requestedAttendees} attendees.`);
    } else {
      policyNotes.push(`Capacity Rule Passed: ${requestedAttendees} ≤ ${resource.capacity}`);
    }

    // Rule 2: Maintenance State
    if (resource.status === 'MAINTENANCE' || resource.maintenanceState?.isUnderMaintenance) {
      violations.push(`Maintenance Lockout: Room ${resource.name} is currently flagged for active maintenance (${resource.maintenanceState?.issue || 'Under Repair'}).`);
    }

    // Rule 3: Blocked Status
    if (resource.status === 'BLOCKED') {
      violations.push(`Safety Lockout: Room ${resource.name} is currently blocked by campus security/safety administration.`);
    }

    // Rule 4: Mandatory Human Approval Policy
    // Any booking > 150 attendees, or any EXAM, or any booking in Main Auditorium requires approval
    if (requestedAttendees >= 150) {
      requiresApproval = true;
      approvalReason = `High-capacity reservation (${requestedAttendees} attendees) requires Campus Administrator approval.`;
      policyNotes.push('Policy Directive: Events ≥ 150 attendees require Level 2 Human-in-the-Loop review.');
    } else if (eventType === 'EXAM') {
      requiresApproval = true;
      approvalReason = 'Academic examination schedule updates mandate Dean / Academic Admin sign-off.';
      policyNotes.push('Policy Directive: Examination schedules cannot be autonomously assigned.');
    } else if (resource.type === 'AUDITORIUM') {
      requiresApproval = true;
      approvalReason = 'Main Auditorium allocation requires central facilities review.';
      policyNotes.push('Policy Directive: Central Auditorium requires central booking confirmation.');
    }

    return {
      isValid: violations.length === 0,
      violations,
      requiresApproval,
      approvalReason,
      policyNotes,
    };
  }
}
