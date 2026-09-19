import { DecisionScoringWeights, Resource, ResourceScheduleItem } from '../types';

export const DEFAULT_SCORING_WEIGHTS: DecisionScoringWeights = {
  feasibilityWeight: 0.35,
  disruptionWeight: 0.25,
  utilizationWeight: 0.20,
  distanceWeight: 0.10,
  preferenceWeight: 0.10,
};

export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h * 60 + m;
}

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

export function formatTimeSlot(start: string, end: string): string {
  return `${start} – ${end}`;
}
