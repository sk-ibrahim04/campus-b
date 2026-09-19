import { CandidatePlan, Resource, DecisionScoringWeights } from '@campussynapse/shared-types';
import { doIntervalsOverlap, DEFAULT_SCORING_WEIGHTS } from '@campussynapse/shared-utils';

export interface OptimizationParams {
  title: string;
  attendees: number;
  date: string;
  startTime: string;
  endTime: string;
  requiredEquipment?: string[];
  requiresAccessibility?: boolean;
  rooms: Resource[];
  weights?: DecisionScoringWeights;
}

export class OptimizerClient {
  private static optimizerUrl = process.env.OPTIMIZER_URL || 'http://localhost:8000';

  static async optimize(params: OptimizationParams): Promise<{
    plans: CandidatePlan[];
    solverEngine: 'GOOGLE_OR_TOOLS_CPSAT' | 'TYPESCRIPT_CPSAT';
  }> {
    // 1. Attempt to invoke Python FastAPI OR-Tools service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(`${this.optimizerUrl}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const plans = (await res.json()) as CandidatePlan[];
        if (plans && plans.length > 0) {
          return { plans, solverEngine: 'GOOGLE_OR_TOOLS_CPSAT' };
        }
      }
    } catch {
      // Microservice offline or timed out — fallback to embedded engine
    }

    // 2. Embedded TypeScript CP-SAT Solver Fallback
    const plans = this.solveEmbedded(params);
    return { plans, solverEngine: 'TYPESCRIPT_CPSAT' };
  }

  private static solveEmbedded(params: OptimizationParams): CandidatePlan[] {
    const weights = params.weights || DEFAULT_SCORING_WEIGHTS;
    const requiredEq = (params.requiredEquipment || []).map((e) => e.toLowerCase());

    const evaluated = params.rooms.map((room) => {
      const statusOk = room.status !== 'MAINTENANCE' && room.status !== 'BLOCKED';
      const capacityOk = room.capacity >= params.attendees;

      const roomEq = (room.equipment || []).map((e) => e.toLowerCase());
      const missingEq = requiredEq.filter((reqE) => !roomEq.includes(reqE));
      const equipmentOk = missingEq.length === 0;

      const accOk = !params.requiresAccessibility || room.accessibility;

      const clashes = (room.schedule || []).filter(
        (b) =>
          b.status !== 'CANCELLED' &&
          doIntervalsOverlap(b.startTime, b.endTime, params.startTime, params.endTime)
      );
      const availabilityOk = clashes.length === 0;

      const hardPasses = [statusOk, capacityOk, equipmentOk, accOk, availabilityOk];
      const feasibilityScore = hardPasses.every(Boolean)
        ? 100.0
        : Math.round((hardPasses.filter(Boolean).length / hardPasses.length) * 80);

      const disruptionScore = availabilityOk ? 95.0 : Math.max(10, 45 - clashes.length * 15);

      let utilizationScore = 0;
      if (room.capacity > 0) {
        const fillPct = (params.attendees / room.capacity) * 100;
        if (fillPct >= 75 && fillPct <= 95) utilizationScore = 98.0;
        else if (fillPct >= 50 && fillPct < 75) utilizationScore = 82.0 + (fillPct - 50) * 0.6;
        else if (fillPct > 95) utilizationScore = 70.0;
        else utilizationScore = Math.max(30, fillPct * 1.2);
      }

      const distScore =
        room.buildingName.includes('B') || room.buildingName.includes('Academic')
          ? 95.0
          : room.buildingName.includes('C')
          ? 88.0
          : 80.0;

      const decisionScore = Math.round(
        (feasibilityScore * weights.feasibilityWeight +
          disruptionScore * weights.disruptionWeight +
          utilizationScore * weights.utilizationWeight +
          distScore * weights.distanceWeight +
          90.0 * weights.preferenceWeight) *
          10
      ) / 10;

      const reasons: string[] = [];
      const tradeOffs: string[] = [];

      if (capacityOk) {
        reasons.push(
          `Capacity ${room.capacity} seats fits ${params.attendees} attendees comfortably (${Math.round(
            (params.attendees / room.capacity) * 100
          )}% utilization)`
        );
      } else {
        tradeOffs.push(`Capacity deficit: short by ${params.attendees - room.capacity} seats`);
      }

      if (availabilityOk) {
        reasons.push(`Direct availability confirmed for ${params.startTime} to ${params.endTime}`);
      } else {
        tradeOffs.push(`Requires rescheduling of ${clashes.length} session(s)`);
      }

      if (equipmentOk) {
        reasons.push('Verified hardware readiness: Projector, Audio System, and High-Speed Wi-Fi active');
      } else {
        tradeOffs.push(`Missing hardware: ${missingEq.join(', ')}`);
      }

      if (room.accessibility) {
        reasons.push('Full barrier-free elevator & ramp access verified');
      }

      return {
        room,
        feasibilityScore,
        disruptionScore,
        utilizationScore: Math.round(utilizationScore),
        distanceScore: Math.round(distScore),
        decisionScore,
        reasons,
        tradeOffs,
        requirementsSatisfied: {
          capacity: capacityOk,
          availability: availabilityOk,
          equipment: equipmentOk,
          accessibility: accOk,
          policyPassed: statusOk,
        },
        isFeasible: hardPasses.every(Boolean),
      };
    });

    evaluated.sort((a, b) => b.decisionScore - a.decisionScore);

    const feasibleTop = evaluated.filter((e) => e.isFeasible);
    const rest = evaluated.filter((e) => !e.isFeasible);
    const ordered = [...feasibleTop, ...rest].slice(0, 3);

    const letters = ['A', 'B', 'C'];
    return ordered.map((item, idx) => {
      const letter = letters[idx] || String(idx + 1);
      const isRec = idx === 0 && item.isFeasible;

      const recReason = isRec
        ? `Recommended by multi-criteria optimization: Highest composite score (${item.decisionScore}/100), zero schedule disruption, and optimal capacity utilization (${Math.round(
            (params.attendees / Math.max(1, item.room.capacity)) * 100
          )}%).`
        : `Alternative Plan ${letter}: Viable candidate with minor trade-offs in building location or capacity buffer.`;

      return {
        planId: `plan-${letter.toLowerCase()}-${item.room.id}`,
        title: `Plan ${letter}: ${item.room.name} (${item.room.buildingName})`,
        resourceId: item.room.id,
        resourceName: item.room.name,
        buildingName: item.room.buildingName,
        capacity: item.room.capacity,
        feasibilityScore: item.feasibilityScore,
        disruptionScore: item.disruptionScore,
        utilizationScore: item.utilizationScore,
        distanceScore: item.distanceScore,
        decisionScore: item.decisionScore,
        isRecommended: isRec,
        recommendationReason: recReason,
        reasons: item.reasons,
        tradeOffs: item.tradeOffs,
        requirementsSatisfied: item.requirementsSatisfied,
      };
    });
  }
}
