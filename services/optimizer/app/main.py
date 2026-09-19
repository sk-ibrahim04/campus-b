from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
from .solver import (
    OptimizationRequest,
    CandidatePlanOutput,
    solve_campus_allocation,
    HAS_ORTOOLS
)

app = FastAPI(
    title="CampusSynapse Constraint Optimization Service",
    version="1.0.0",
    description="OR-Tools and CP-SAT powered multi-attribute campus scheduling engine."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "engine": "GOOGLE_OR_TOOLS_CPSAT" if HAS_ORTOOLS else "TYPESCRIPT_CPSAT",
        "service": "CampusSynapse Optimizer Service",
        "version": "1.0.0"
    }


@app.post("/optimize", response_model=List[CandidatePlanOutput])
def optimize_allocation(request: OptimizationRequest):
    try:
        candidates = solve_campus_allocation(request)
        return candidates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
def simulate_impact(payload: Dict[str, Any]):
    """
    Hypothetical simulation endpoint returning disruption metrics
    without mutating database state.
    """
    scenario_type = payload.get("scenarioType", "RESOURCE_UNAVAILABLE")
    resource_id = payload.get("resourceId")
    bookings = payload.get("bookings", [])

    affected = []
    for b in bookings:
        if b.get("resourceId") == resource_id:
            affected.append({
                "bookingId": b.get("id"),
                "title": b.get("title"),
                "originalRoom": b.get("roomName"),
                "timeSlot": f"{b.get('startTime')} - {b.get('endTime')}",
                "faculty": b.get("organizer"),
                "attendees": b.get("attendees", 40)
            })

    return {
        "scenario": scenario_type,
        "affectedBookingsCount": len(affected),
        "affectedBookings": affected,
        "mitigationStatus": "FEASIBLE_WITH_REROUTING" if len(affected) < 5 else "CRITICAL_BOTTLENECK"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
