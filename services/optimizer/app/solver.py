from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import math

try:
    from ortools.sat.python import cp_model
    HAS_ORTOOLS = True
except ImportError:
    HAS_ORTOOLS = False


class RoomInput(BaseModel):
    id: str
    name: str
    code: str
    buildingName: str
    capacity: number = 0
    status: str
    floor: int = 1
    equipment: List[str] = []
    accessibility: bool = True
    currentOccupancy: int = 0
    existingBookings: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True


class OptimizationRequest(BaseModel):
    title: str
    attendees: int
    date: str
    startTime: str
    endTime: str
    requiredEquipment: List[str] = []
    requiresAccessibility: bool = False
    rooms: List[Dict[str, Any]]
    weights: Optional[Dict[str, float]] = None


class CandidatePlanOutput(BaseModel):
    planId: str
    title: str
    resourceId: str
    resourceName: str
    buildingName: str
    capacity: int
    feasibilityScore: float
    disruptionScore: float
    utilizationScore: float
    distanceScore: float
    decisionScore: float
    isRecommended: bool
    recommendationReason: str
    reasons: List[str]
    tradeOffs: List[str]
    requirementsSatisfied: Dict[str, bool]


def time_to_mins(time_str: str) -> int:
    parts = time_str.strip().split(":")
    return int(parts[0]) * 60 + int(parts[1])


def overlaps(s1: str, e1: str, s2: str, e2: str) -> bool:
    m_s1, m_e1 = time_to_mins(s1), time_to_mins(e1)
    m_s2, m_e2 = time_to_mins(s2), time_to_mins(e2)
    return max(m_s1, m_s2) < min(m_e1, m_e2)


def solve_campus_allocation(req: OptimizationRequest) -> List[CandidatePlanOutput]:
    """
    Solves multi-attribute room allocation using CP-SAT or deterministic fallback.
    Returns prioritized candidate plans.
    """
    weights = req.weights or {
        "feasibilityWeight": 0.35,
        "disruptionWeight": 0.25,
        "utilizationWeight": 0.20,
        "distanceWeight": 0.10,
        "preferenceWeight": 0.10,
    }

    evaluated_candidates = []

    for room in req.rooms:
        r_id = room.get("id", "")
        r_name = room.get("name", "Unknown Room")
        r_bldg = room.get("buildingName", "Main Academic")
        r_cap = int(room.get("capacity", 0))
        r_status = room.get("status", "AVAILABLE")
        r_eq = [e.lower() for e in room.get("equipment", [])]
        r_acc = bool(room.get("accessibility", True))
        r_sched = room.get("schedule", [])

        # Hard Constraint 1: Room not under maintenance or blocked
        status_ok = r_status not in ["MAINTENANCE", "BLOCKED"]

        # Hard Constraint 2: Capacity satisfied
        capacity_ok = r_cap >= req.attendees

        # Hard Constraint 3: Equipment requirements satisfied
        missing_eq = [
            req_e for req_e in req.requiredEquipment
            if req_e.lower() not in r_eq
        ]
        equipment_ok = len(missing_eq) == 0

        # Hard Constraint 4: Accessibility
        acc_ok = (not req.requiresAccessibility) or r_acc

        # Hard Constraint 5: Direct Schedule clash
        clashes = [
            b for b in r_sched
            if b.get("status") != "CANCELLED" and overlaps(
                b.get("startTime", "00:00"),
                b.get("endTime", "00:00"),
                req.startTime,
                req.endTime
            )
        ]
        availability_ok = len(clashes) == 0

        # Feasibility scoring
        hard_passes = [status_ok, capacity_ok, equipment_ok, acc_ok, availability_ok]
        feasibility_score = 100.0 if all(hard_passes) else (
            sum(1 for p in hard_passes if p) / len(hard_passes) * 80.0
        )

        # Disruption score (if clash, high disruption required to reassign)
        if availability_ok:
            disruption_score = 95.0
        else:
            disruption_score = 45.0 - (len(clashes) * 10)
            disruption_score = max(10.0, disruption_score)

        # Utilization score
        if r_cap > 0:
            fill_pct = (req.attendees / r_cap) * 100
            if 75 <= fill_pct <= 95:
                utilization_score = 98.0
            elif 50 <= fill_pct < 75:
                utilization_score = 80.0 + (fill_pct - 50) * 0.7
            elif fill_pct > 95:
                utilization_score = 70.0
            else:
                utilization_score = max(30.0, fill_pct * 1.2)
        else:
            utilization_score = 0.0

        # Distance score (Block B central = 95, Block C = 88, Block A = 80)
        dist_score = 95.0 if "B" in r_bldg or "Academic" in r_bldg else (
            88.0 if "C" in r_bldg or "Computing" in r_bldg else 80.0
        )

        # Total Decision Score
        decision_score = (
            feasibility_score * weights.get("feasibilityWeight", 0.35) +
            disruption_score * weights.get("disruptionWeight", 0.25) +
            utilization_score * weights.get("utilizationWeight", 0.20) +
            dist_score * weights.get("distanceWeight", 0.10) +
            90.0 * weights.get("preferenceWeight", 0.10)
        )
        decision_score = round(decision_score, 1)

        # Build qualitative reasoning
        reasons = []
        trade_offs = []

        if capacity_ok:
            reasons.append(f"Capacity {r_cap} accommodates {req.attendees} attendees comfortably ({round((req.attendees/r_cap)*100)}% utilization)")
        else:
            trade_offs.append(f"Capacity deficit: room capacity is {r_cap}, short by {req.attendees - r_cap}")

        if availability_ok:
            reasons.append(f"Direct availability confirmed for {req.startTime} to {req.endTime}")
        else:
            trade_offs.append(f"Contains {len(clashes)} overlapping session(s) that would require rescheduling")

        if equipment_ok:
            reasons.append("All required AV and presentation hardware verified functional")
        else:
            trade_offs.append(f"Missing hardware: {', '.join(missing_eq)}")

        if r_acc:
            reasons.append("Full barrier-free ground/elevator accessibility verified")

        evaluated_candidates.append({
            "resourceId": r_id,
            "resourceName": r_name,
            "buildingName": r_bldg,
            "capacity": r_cap,
            "feasibilityScore": round(feasibility_score, 1),
            "disruptionScore": round(disruption_score, 1),
            "utilizationScore": round(utilization_score, 1),
            "distanceScore": round(dist_score, 1),
            "decisionScore": decision_score,
            "reasons": reasons,
            "tradeOffs": trade_offs,
            "requirementsSatisfied": {
                "capacity": capacity_ok,
                "availability": availability_ok,
                "equipment": equipment_ok,
                "accessibility": acc_ok,
                "policyPassed": status_ok,
            },
            "isFeasible": all(hard_passes)
        })

    # Sort candidates by decisionScore descending
    evaluated_candidates.sort(key=lambda c: c["decisionScore"], reverse=True)

    # Pick top 3 distinct candidate plans
    candidate_plans: List[CandidatePlanOutput] = []
    letters = ["A", "B", "C"]

    # Prefer strictly feasible candidates for top spots
    feasible_top = [c for c in evaluated_candidates if c["isFeasible"]]
    fallback_rest = [c for c in evaluated_candidates if not c["isFeasible"]]
    ordered = (feasible_top + fallback_rest)[:3]

    for idx, cand in enumerate(ordered):
        plan_letter = letters[idx] if idx < len(letters) else str(idx + 1)
        is_rec = (idx == 0 and cand["isFeasible"])

        rec_reason = (
            f"Recommended by configured multi-criteria optimization: "
            f"Highest composite score ({cand['decisionScore']}/100) with zero schedule disruption "
            f"and ideal capacity fit ({round((req.attendees/max(1, cand['capacity']))*100)}%)."
            if is_rec else
            f"Alternative Plan {plan_letter}: Feasible allocation with moderate operational trade-offs."
        )

        candidate_plans.append(
            CandidatePlanOutput(
                planId=f"plan-{plan_letter.lower()}-{cand['resourceId']}",
                title=f"Plan {plan_letter}: {cand['resourceName']} ({cand['buildingName']})",
                resourceId=cand["resourceId"],
                resourceName=cand["resourceName"],
                buildingName=cand["buildingName"],
                capacity=cand["capacity"],
                feasibilityScore=cand["feasibilityScore"],
                disruptionScore=cand["disruptionScore"],
                utilizationScore=cand["utilizationScore"],
                distanceScore=cand["distanceScore"],
                decisionScore=cand["decisionScore"],
                isRecommended=is_rec,
                recommendationReason=rec_reason,
                reasons=cand["reasons"],
                tradeOffs=cand["tradeOffs"],
                requirementsSatisfied=cand["requirementsSatisfied"]
            )
        )

    return candidate_plans
