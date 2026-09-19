export type UserRole =
  | 'SUPER_ADMIN'
  | 'CAMPUS_ADMIN'
  | 'FACULTY'
  | 'STUDENT'
  | 'FACILITY_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export type ResourceType =
  | 'CLASSROOM'
  | 'LABORATORY'
  | 'SEMINAR_HALL'
  | 'AUDITORIUM'
  | 'MEETING_ROOM';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE'
  | 'BLOCKED'
  | 'UNDER_REVIEW';

export interface ResourceTelemetry {
  occupancyCount: number;
  temperatureCelsius?: number;
  powerDrawWatts?: number;
  airQualityIndex?: number;
  lastPingTime: string;
}

export interface ResourceScheduleItem {
  bookingId: string;
  title: string;
  organizer: string;
  startTime: string; // ISO or HH:mm
  endTime: string;
  attendees: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'CLASS' | 'LAB' | 'EVENT' | 'EXAM' | 'MEETING';
}

export interface Resource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  capacity: number;
  status: ResourceStatus;
  buildingId: string;
  buildingName: string;
  floor: number;
  location: string;
  equipment: string[];
  accessibility: boolean;
  maintenanceState?: {
    isUnderMaintenance: boolean;
    issue?: string;
    priority?: string;
    ticketId?: string;
  };
  currentOccupancy: number;
  utilizationRate: number; // 0 to 100 percentage
  nextAvailable: string;
  schedule: ResourceScheduleItem[];
  telemetry?: ResourceTelemetry;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  totalFloors: number;
  departments: string[];
  totalRooms: number;
  activeConflictsCount: number;
  description?: string;
}

export type IntentType =
  | 'RESOURCE_ALLOCATION'
  | 'RESOURCE_SEARCH'
  | 'SCHEDULE_CHANGE'
  | 'EVENT_PLANNING'
  | 'CONFLICT_ANALYSIS'
  | 'MAINTENANCE'
  | 'RESOURCE_RECOVERY'
  | 'SIMULATION'
  | 'ANALYTICS_QUERY'
  | 'EXPLANATION';

export interface ParsedIntent {
  intent: IntentType;
  rawPrompt: string;
  resourceType?: ResourceType;
  capacity?: number;
  date?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  requirements?: string[];
  targetRoom?: string;
  targetBuilding?: string;
  maintenanceIssue?: string;
  simulationScenario?: string;
  confidence: number;
  agentResponsible: string;
}

export interface CandidatePlan {
  planId: string;
  title: string;
  resourceId: string;
  resourceName: string;
  buildingName: string;
  capacity: number;
  feasibilityScore: number; // 0 to 100
  disruptionScore: number;  // 0 to 100 (higher = lower disruption)
  utilizationScore: number; // 0 to 100 (capacity fit)
  distanceScore: number;    // 0 to 100
  decisionScore: number;    // Weighted composite
  isRecommended: boolean;
  recommendationReason: string;
  reasons: string[];
  tradeOffs: string[];
  requirementsSatisfied: {
    capacity: boolean;
    availability: boolean;
    equipment: boolean;
    accessibility: boolean;
    policyPassed: boolean;
  };
}

export interface DecisionScoringWeights {
  feasibilityWeight: number; // e.g. 0.35
  disruptionWeight: number;  // e.g. 0.25
  utilizationWeight: number; // e.g. 0.20
  distanceWeight: number;    // e.g. 0.10
  preferenceWeight: number;  // e.g. 0.10
}

export interface WhatIfScenarioInput {
  scenarioType:
    | 'RESOURCE_UNAVAILABLE'
    | 'EVENT_SURGE'
    | 'POWER_OUTAGE'
    | 'SCHEDULE_SHIFT'
    | 'CAPACITY_REDUCTION';
  resourceId?: string;
  buildingId?: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface AffectedEntity {
  bookingId: string;
  title: string;
  facultyName: string;
  attendeesCount: number;
  originalRoom: string;
  originalTime: string;
  suggestedAlternativeRoom?: string;
  disruptionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WhatIfSimulationResult {
  simulationId: string;
  scenarioDescription: string;
  timestamp: string;
  affectedBookings: AffectedEntity[];
  affectedFacultyCount: number;
  affectedStudentsCount: number;
  conflictsDetected: number;
  availableMitigationsCount: number;
  recommendedActions: string[];
  alternativePlans: CandidatePlan[];
  feasibilityRatio: number;
}

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'EQUIPMENT' | 'ELECTRICAL' | 'HVAC' | 'PLUMBING' | 'STRUCTURAL';
  subcategory?: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  resourceId: string;
  resourceName: string;
  buildingName: string;
  assignedTeam: string;
  reportedBy: string;
  createdAt: string;
  resolvedAt?: string;
  immediateActionTaken?: string;
  isEscalated: boolean;
}

export type AutonomyLevel = 0 | 1 | 2 | 3;
// 0 = Observe
// 1 = Recommend
// 2 = Approve then Execute
// 3 = Safe Action Auto-Execution

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  title: string;
  type: 'EVENT_ALLOCATION' | 'EXAM_RESCHEDULE' | 'MAINTENANCE_LOCK' | 'RESOURCE_REALLOCATION';
  description: string;
  proposedPlan: CandidatePlan;
  requiredRole: UserRole;
  status: ApprovalStatus;
  requestedByAgent: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  impactMetrics: {
    attendees: number;
    disruptionScore: number;
    utilizationScore: number;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  agent?: string;
  action: string;
  reason: string;
  affectedResources: string[];
  previousState?: string;
  newState?: string;
  approvalRequired: boolean;
  approvalStatus?: ApprovalStatus;
  metadata?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  recipientRole?: UserRole;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface CampusTelemetrySummary {
  campusStatus: 'OPTIMAL' | 'DEGRADED' | 'ALERT';
  activeConflictsCount: number;
  pendingDecisionsCount: number;
  availableResourcesCount: number;
  totalResourcesCount: number;
  autonomousActionsTodayCount: number;
  recoveredResourcesTodayCount: number;
  averageUtilizationPercent: number;
  activeMaintenanceTicketsCount: number;
}

export interface SystemHealthStatus {
  aiProvider: {
    status: 'CONNECTED' | 'FALLBACK';
    activeEngine: 'GEMINI' | 'OPENAI' | 'DETERMINISTIC_RULES';
    latencyMs: number;
  };
  optimizer: {
    status: 'HEALTHY' | 'FALLBACK_LOCAL';
    engine: 'GOOGLE_OR_TOOLS_CPSAT' | 'TYPESCRIPT_CPSAT';
    latencyMs: number;
  };
  database: {
    status: 'CONNECTED';
    mode: 'MONGODB_ATLAS' | 'EMBEDDED_MEMORY_SERVER';
  };
  socket: {
    status: 'CONNECTED';
    connectedClients: number;
  };
  autonomyEngine: {
    status: 'ACTIVE';
    level: AutonomyLevel;
    safeAutoExecutions: number;
  };
}
