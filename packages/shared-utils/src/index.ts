import {
  CandidatePlan,
  DecisionScoringWeights,
  Resource,
  ResourceScheduleItem,
} from '@campussynapse/shared-types';

export const DEFAULT_SCORING_WEIGHTS: DecisionScoringWeights = {
  feasibilityWeight: 0.35,
  disruptionWeight: 0.25,
  utilizationWeight: 0.20,
  distanceWeight: 0.10,
  preferenceWeight: 0.10,
};

/**
 * Calculates transparent decision score based on configurable weights
 */
export function calculateDecisionScore(
  plan: {
    feasibilityScore: number;
    disruptionScore: number;
    utilizationScore: number;
    distanceScore: number;
    preferenceScore?: number;
  },
  weights: DecisionScoringWeights = DEFAULT_SCORING_WEIGHTS
): number {
  const pref = plan.preferenceScore ?? 90;
  const rawScore =
    plan.feasibilityScore * weights.feasibilityWeight +
    plan.disruptionScore * weights.disruptionWeight +
    plan.utilizationScore * weights.utilizationWeight +
    plan.distanceScore * weights.distanceWeight +
    pref * weights.preferenceWeight;

  return Math.round(rawScore * 10) / 10;
}

/**
 * Converts HH:mm string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

/**
 * Checks if two time intervals overlap on the same day
 */
export function doIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const a1 = timeStringToMinutes(startA);
  const a2 = timeStringToMinutes(endA);
  const b1 = timeStringToMinutes(startB);
  const b2 = timeStringToMinutes(endB);
  return Math.max(a1, b1) < Math.min(a2, b2);
}

/**
 * Checks if a resource has a scheduling clash in the specified time window
 */
export function hasResourceClash(
  resource: Resource,
  startTime: string,
  endTime: string
): { hasConflict: boolean; conflictingItem?: ResourceScheduleItem } {
  for (const item of resource.schedule) {
    if (item.status === 'CANCELLED') continue;
    if (doIntervalsOverlap(item.startTime, item.endTime, startTime, endTime)) {
      return { hasConflict: true, conflictingItem: item };
    }
  }
  return { hasConflict: false };
}

/**
 * Computes capacity utilization efficiency percentage for a given attendees count
 */
export function computeCapacityUtilization(attendees: number, roomCapacity: number): number {
  if (roomCapacity <= 0) return 0;
  if (attendees > roomCapacity) {
    // Over capacity is non-viable
    return 0;
  }
  const ratio = (attendees / roomCapacity) * 100;
  // Ideal ratio is 75%-90%. Rooms that are vastly oversized (e.g. 180 in a 600 hall) are penalized
  if (ratio >= 75 && ratio <= 95) return 100;
  if (ratio > 95) return 85; // Too packed
  if (ratio >= 50) return Math.round(ratio + 10);
  return Math.round(ratio);
}

/**
 * Formats date to user-friendly string
 */
export function formatTimeSlot(start: string, end: string): string {
  return `${start} – ${end}`;
}
