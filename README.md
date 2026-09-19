# CAMPUSSYNAPSE

## Autonomous Campus Digital Twin & Resource Orchestration System

**Smart India Hackathon 2026 — SIH26193**  
**Track:** SOFTWARE | **Theme:** Smart Automation | **Category:** Student Innovation

> **OBSERVE → SIMULATE → DECIDE → AUTOMATE**  
> *Mission Control for a Self-Driving Smart Campus*

---

## 1. Product Overview

Traditional campus management software relies on passive CRUD forms and fragmented databases: a user fills out a request form, an administrator manually checks a spreadsheet or timetable portal, and changes must be typed into multiple systems.

**CampusSynapse** revolutionizes campus infrastructure into an intelligent operational system. It maintains a **live spatial Digital Twin of physical campus resources** across all blocks, senses real-time telemetry (IoT occupancy, ambient temperature, energy draw), predicts conflicts using multi-agent intelligence, solves multi-attribute scheduling with **Google OR-Tools (CP-SAT)**, simulates what-if disruptions without mutating real state, and executes approved actions under controlled autonomy.

---

## 2. Core Operational Loop

```text
REAL CAMPUS STATE
        ↓
DIGITAL TWIN (Blocks A, B, C)
        ↓
SENSE (IoT Occupancy, Ambient Sensors, Timetables)
        ↓
UNDERSTAND (AI Intent Parsing with Deterministic Fallbacks)
        ↓
PREDICT (ScheduleAgent & ResourceAgent Conflict Discovery)
        ↓
SIMULATE (What-If Sandbox — Zero State Mutation)
        ↓
OPTIMIZE (Google OR-Tools CP-SAT Constraint Programming)
        ↓
DECIDE (Explainable Multi-Criteria Scoring & Transparency Cards)
        ↓
APPROVE / AUTOMATE (Autonomy Levels 0–3 with Human-in-the-Loop)
        ↓
EXECUTE ACTION (Database Atomic Mutation)
        ↓
UPDATE DIGITAL TWIN (Real-Time Socket.IO Broadcast)
        ↓
CONTINUE MONITORING
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts, Socket.IO Client, Zustand.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Mongoose, Zod, JWT, bcryptjs, embedded `mongodb-memory-server` fallback.
- **Optimization Microservice**: Python 3, FastAPI, Google OR-Tools (CP-SAT Solver), Pydantic, Uvicorn (with embedded TypeScript CP-SAT fallback).
- **AI Intent Engine**: Multi-tier provider supporting Google Gemini 1.5, OpenAI, and high-precision deterministic regex rules to guarantee 100% judge resilience.
- **Database**: MongoDB Atlas / Local MongoDB with automatic zero-configuration in-memory fallback.

---

## 4. Key Innovations & Modules

1. **Hero Orchestration Pipeline**:
   Handles natural-language commands like *"Plan a seminar for 180 students tomorrow from 2 PM to 5 PM"*. Detects conflicting sessions in Seminar Hall A, filters certified rooms, invokes OR-Tools CP-SAT, generates 3 candidate plans (Plan A, B, C), explains why Plan A was selected, and updates the digital twin live upon approval.
2. **Interactive Spatial Digital Twin (`/digital-twin`)**:
   Floor-by-floor live room matrix for Block A (Engineering), Block B (Academic Spine), and Block C (Computing & Auditorium) color-coded by operational status: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`, `BLOCKED`, `UNDER_REVIEW`.
3. **What-If Sandbox Simulator (`/simulator`)**:
   Hypothesizes closures, power failures, or surges and computes affected students/faculty and alternative plans **without mutating the production database**.
4. **Autonomous Resource Recovery Engine**:
   Detects ghost bookings where a room is reserved but telemetry indicates 0 occupants past a 15-minute grace period. Reclaims the space and notifies the waitlist.
5. **Maintenance Intelligence (`/maintenance`)**:
   Natural-language incident triaging. Critical electrical or flooding hazards trigger an emergency lockout on the digital twin.
6. **Autonomy Engine (Levels 0–3)**:
   - **Level 0 (Observe)**: Telemetry and passive monitoring.
   - **Level 1 (Recommend)**: AI proposes plans; human operator executes.
   - **Level 2 (Approve then Execute - Default)**: AI generates executable action; 1-click human sign-off triggers execution.
   - **Level 3 (Safe Action Auto-Execution)**: Routine low-risk tasks (reclaiming ghost rooms, conflict notifications) execute autonomously.
7. **Explainable AI**:
   Every recommendation includes transparent scores:
   $$\text{Score} = w_{\text{feasibility}} \cdot S_{\text{feas}} + w_{\text{disruption}} \cdot S_{\text{disrupt}} + w_{\text{utilization}} \cdot S_{\text{util}} + w_{\text{distance}} \cdot S_{\text{dist}}$$
   with configurable weights.
8. **One-Click Demo & Resettable State**:
   **[ RUN DEMO ]** walks judges through the 13-step hero workflow in under 2 minutes. **[ RESET DEMO ]** instantly restores baseline synthetic data.

---

## 5. Quick Start & Local Setup

### Prerequisites
- Node.js v18+ (Node v20.20.2 recommended)
- npm v10+
- Python 3.10+ (optional, for FastAPI OR-Tools service)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*Note: Even without configuring MongoDB or API keys, the system automatically uses embedded MongoMemoryServer and deterministic AI rules so it boots out of the box.*

### 3. Run Verification Tests
```bash
npm run test --workspace=@campussynapse/api
```

### 4. Start Development Servers
```bash
npm run dev
```
- **Mission Control Web App**: `http://localhost:5173`
- **Orchestration REST API**: `http://localhost:5000/api`
- **WebSocket Gateway**: `ws://localhost:5000`

---

## 6. Demo Accounts (Pre-configured)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@campussynapse.edu` | `Admin@123` | Full governance, autonomy config, audit |
| **Campus Admin** | `campusadmin@campussynapse.edu` | `Admin@123` | Approvals, digital twin, orchestrator |
| **Faculty Coordinator** | `faculty@campussynapse.edu` | `Faculty@123` | Event requests, schedules, maintenance |
| **Facility Lead** | `staff@campussynapse.edu` | `Faculty@123` | Work orders, hazard triage, room unblocking |

---

## 7. Repository Structure

```
campussynapse/
├── apps/
│   ├── web/                     # React 18 + Vite + Tailwind CSS frontend
│   └── api/                     # Node.js Express + Socket.IO orchestration backend
├── services/
│   └── optimizer/               # Python FastAPI + Google OR-Tools CP-SAT microservice
├── packages/
│   ├── shared-types/            # Common TypeScript interfaces
│   └── shared-utils/            # Time interval checkers & scoring math
├── docs/                        # Architecture, API, Demo, and Deployment guides
├── .env.example
├── README.md
└── package.json
```

---

## 8. License
Developed for Smart India Hackathon 2026 under MIT License.
