# CAMPUSSYNAPSE SYSTEM ARCHITECTURE

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Layer
        Web[React Mission Control UI]
        Mobile[Responsive Mobile Console]
    end

    subgraph API & Orchestration Gateway
        Express[Node.js / Express Gateway]
        SocketIO[Socket.IO Realtime Bus]
        Auth[JWT & RBAC Middleware]
    end

    subgraph Multi-Agent Intelligence Layer
        Intent[AI Intent Parser - Gemini / Fallback]
        ScheduleAgent[Schedule Agent]
        ResourceAgent[Resource Agent]
        MaintAgent[Maintenance Agent]
        EventAgent[Event Agent]
        PolicyAgent[Policy Gatekeeper]
        DecisionAgent[Decision & Explainability Agent]
    end

    subgraph Optimization Microservice
        FastAPI[Python FastAPI]
        ORTools[Google OR-Tools CP-SAT Solver]
        HardConstraints[Hard Constraints: Capacity, State, Clashes]
        SoftObjectives[Soft Objectives: Disruption, Utilization, Distance]
    end

    subgraph Digital Twin State Store
        Mongo[(MongoDB Atlas / In-Memory Server)]
        AuditLog[(Immutable Audit Ledger)]
    end

    Web <-->|REST & WebSocket| Express
    Express --> Auth
    Express --> Intent
    Intent --> EventAgent
    EventAgent --> PolicyAgent
    PolicyAgent --> ScheduleAgent & ResourceAgent
    ScheduleAgent & ResourceAgent --> FastAPI
    FastAPI --> ORTools
    ORTools --> HardConstraints & SoftObjectives
    ORTools --> DecisionAgent
    DecisionAgent --> Express
    Express -->|Atomic Commit| Mongo
    Express --> AuditLog
    Express --> SocketIO
    SocketIO -->|Broadcast State Delta| Web
```

## 2. Multi-Agent Delegation Model

Each agent acts as a specialized micro-service within the system:
1. **ScheduleAgent**: Detects overlapping intervals, evaluates timetable disruptions, and identifies available windows.
2. **ResourceAgent**: Validates certified seat capacity, filters operational hardware (laser projectors, line-array audio), and monitors live IoT telemetry.
3. **MaintenanceAgent**: Classifies natural language facility reports into categories (Equipment, Electrical, HVAC, Plumbing) and triggers immediate emergency lockouts on high-voltage or flood hazards.
4. **PolicyAgent**: Hard deterministic institutional validator (no over-booking, no maintenance overrides, mandatory admin authorization on high-capacity events).
5. **DecisionAgent**: Synthesizes multi-criteria scoring into human-readable transparency cards ("Why this decision?").
6. **NotificationAgent**: Formats in-app and dispatch payloads.

## 3. Constraint Programming (Google OR-Tools CP-SAT)

The optimizer solves the room allocation problem deterministically:
- **Decision Variables**: $x_{i,r} \in \{0, 1\}$, indicating whether event $i$ is assigned to room $r$.
- **Hard Constraints**:
  - $\sum_{r} x_{i,r} = 1$ (every event is assigned to at most one space).
  - $x_{i,r} \cdot \text{Attendees}_i \le \text{Capacity}_r$.
  - $\text{Status}_r \ne \text{MAINTENANCE} \land \text{Status}_r \ne \text{BLOCKED}$.
  - Overlap constraint: For any existing booking $b$ in room $r$ overlapping with $[t_{\text{start}}, t_{\text{end}}]$, either $x_{i,r} = 0$ or $b$ must be flagged for rescheduling.
- **Objective Function**:
  $$\max \sum_{r} x_{i,r} \left( w_{\text{feas}} \cdot S_{\text{feas}} + w_{\text{disrupt}} \cdot S_{\text{disrupt}} + w_{\text{util}} \cdot S_{\text{util}} + w_{\text{dist}} \cdot S_{\text{dist}} \right)$$
