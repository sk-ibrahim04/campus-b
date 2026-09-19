# CAMPUSSYNAPSE REST & WEBSOCKET API SPECIFICATION

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication
- `POST /auth/login`: Authenticate with email & password. Returns JWT token and user profile.
- `GET /auth/profile`: Returns authenticated user session.

## 2. Mission Control Dashboard
- `GET /dashboard`: Returns real-time campus telemetry, system health observability matrix, pending approvals, and recent activity.

## 3. Digital Twin & Resources
- `GET /resources`: Lists all spaces with filters (`buildingId`, `status`, `type`).
- `GET /resources/:id`: Detailed telemetry, hardware checklist, and upcoming schedule.
- `PATCH /resources/:id/status`: Manually overrides room operational status.
- `POST /resources/:id/recover`: Autonomous reclaim of ghost reservations.
- `GET /buildings`: Lists monitored campus blocks (Blocks A, B, and C).

## 4. AI Orchestration
- `POST /orchestrator/interpret`: Parses natural-language prompt into structured `ParsedIntent`.
- `POST /orchestrator/plan`: Runs full pipeline (Intent $\to$ Conflicts $\to$ Policy Gate $\to$ OR-Tools Optimizer $\to$ Scored Candidate Plans $\to$ Decision Explanation).
- `POST /orchestrator/execute`: Executes confirmed candidate plan and updates digital twin.

## 5. What-If Simulator
- `POST /simulator/run`: Runs hypothetical disruption evaluation with 0 persistent database mutation.

## 6. Approvals
- `GET /approvals`: Lists approval requests with filter (`status=PENDING | APPROVED | REJECTED`).
- `POST /approvals/:id/approve`: Signs off on AI proposal and executes into live campus state.
- `POST /approvals/:id/reject`: Rejects proposal with administrative remarks.

## 7. Maintenance Intelligence
- `GET /maintenance`: Lists open and historical work orders.
- `POST /maintenance`: Submits incident description; triggers AI auto-triage and emergency lockout for critical electrical/flood hazards.
- `PATCH /maintenance/:id/status`: Updates ticket status and removes safety lockout when resolved.

## 8. Analytics & Audit
- `GET /analytics`: Operational telemetry aggregations (utilization by block, conflict trends, recovery metrics).
- `GET /audit-log`: Immutable chronological ledger entries.

## 9. Autonomy Settings
- `GET /settings/autonomy`: Current autonomy level (0–3) and safe executions counter.
- `POST /settings/autonomy`: Updates institutional autonomy level.

## 10. Demo Automation
- `POST /demo/run`: One-click execution of the 13-step hackathon hero scenario.
- `POST /demo/reset`: Restores pristine baseline digital twin data.

---

## WebSocket Events (Socket.IO)

| Event Name | Direction | Payload Description |
| :--- | :--- | :--- |
| `digital_twin_updated` | Server $\to$ Client | Emitted whenever any room state changes (available, reserved, maintenance). |
| `notification_created` | Server $\to$ Client | In-app warning or success notification. |
| `audit_logged` | Server $\to$ Client | Realtime append to the immutable audit trail. |
| `demo_reset` | Server $\to$ Client | Resets all connected clients to baseline state. |
